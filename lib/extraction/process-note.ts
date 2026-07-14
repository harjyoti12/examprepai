import { connectToDatabase } from "@/lib/db";
import NoteModel from "@/models/note.model";
import NoteChunkModel from "@/models/note-chunk.model";
import { extractPDFText } from "./extract-pdf";
import { generateStudyMaterial } from "../ai/generate-study-material";
import { createNoteChunksFromPages } from "../ai/chunk-content";
import { processScannedPdf } from "../ai/process-scanned-pdf";
import { processImages } from "../ai/process-images";
import { getUserSubscription } from "@/lib/business/get-user-subscription";
import { getUserPlan } from "@/lib/business/get-user-plan";
import { validateUpload } from "@/lib/business/validate-upload";
import { calculateRequiredCredits } from "@/lib/business/calculate-required-credits";
import { consumeCredits } from "@/lib/business/consume-credits";

const PROCESSING_TIMEOUT_MS = 240_000; // 4 minutes — algorithm constant, kept local

interface ProcessingResult {
  success: boolean;
  message: string;
  error?: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer!));
}

/**
 * Main processing function to extract content from uploaded files
 * Orchestrates the extraction pipeline based on file type
 */
export async function processNote(noteId: string): Promise<ProcessingResult> {
  try {
    // Connect to database
    await connectToDatabase();

    // Fetch note from database
    const note = await NoteModel.findById(noteId);

    if (!note) {
      return {
        success: false,
        message: "Note not found",
        error: `Note with ID ${noteId} does not exist`,
      };
    }

    const subscription = await getUserSubscription();
    const userPlan = await getUserPlan(note.userId);

    // Update status to "extracting"
    note.processingStatus = "extracting";
    await note.save();

    let extractedContent: { page: number; text: string }[];

    // Detect file type and run appropriate extraction
    if (note.fileType === "pdf") {
      // Extract from PDF with timeout
      const pdfUrl = note.fileUrls[0]; // Should only have one PDF
      extractedContent = await withTimeout(
        extractPDFText(pdfUrl),
        PROCESSING_TIMEOUT_MS,
        "PDF extraction",
      );

      const isScannedPdf =
        extractedContent.length === 0 ||
        extractedContent.every((page) => !page.text?.trim());

      if (isScannedPdf) {
        note.extractedContent = [];
        note.totalPages = extractedContent.length;
        note.totalChunks = 0;
        note.processingStatus = "processing";
        await note.save();

        console.log(`Detected scanned PDF for note ${noteId}, using Gemini Vision fallback.`);

        const scanCreditCheck = validateUpload({
          subscription,
          userPlan,
          fileType: "pdf",
          chunkCount: 1,
        });

        if (!scanCreditCheck.success) {
          note.failureReason = scanCreditCheck.errors[0].code;
          note.processingStatus = "failed";
          await note.save();
          return {
            success: false,
            message: scanCreditCheck.errors[0].message,
            error: scanCreditCheck.errors[0].message,
          };
        }

        const scanResult = await processScannedPdf(noteId, pdfUrl);
        if (!scanResult.success) {
          note.failureReason = "GENERATION_FAILED";
          note.processingStatus = "failed";
          await note.save();
          return {
            success: false,
            message: "Scanned PDF fallback failed.",
            error: scanResult.message,
          };
        }

        const scannedCredits = calculateRequiredCredits({
          fileType: "pdf",
          pageCount: extractedContent.length,
        });

        let scannedRemaining: number | undefined;
        try {
          const consumption = await consumeCredits({
            clerkUserId: note.userId,
            credits: scannedCredits,
            noteId: note._id.toString(),
          });
          scannedRemaining = consumption.remainingCredits;
          await NoteModel.updateOne(
            { _id: note._id },
            { $set: { processingStatus: "completed", creditsUsed: scannedCredits } },
          );
        } catch (creditError) {
          console.error(`Failed to consume credits for scanned PDF ${noteId}:`, creditError);
          await NoteModel.updateOne(
            { _id: note._id },
            { $set: { failureReason: "INSUFFICIENT_CREDITS" } },
          );
          throw creditError;
        }

        return {
          success: true,
          message: scannedRemaining !== undefined
            ? `Study material generated successfully. ${scannedCredits} credits used • ${scannedRemaining} credits remaining.`
            : "Successfully processed scanned PDF and generated study material.",
        };
      }
    } else if (note.fileType === "image") {
      note.totalPages = note.fileUrls.length;
      note.processingStatus = "processing";
      await note.save();

      console.log(`Detected image note for ${noteId}, starting Gemini Vision image generation.`);

      const imageCreditCheck = validateUpload({
        subscription,
        userPlan,
        fileType: "image",
        imageCount: note.fileUrls.length,
      });

      if (!imageCreditCheck.success) {
        note.failureReason = imageCreditCheck.errors[0].code;
        note.processingStatus = "failed";
        await note.save();
        return {
          success: false,
          message: imageCreditCheck.errors[0].message,
          error: imageCreditCheck.errors[0].message,
        };
      }

      const imageResult = await processImages(noteId);
      if (!imageResult.success) {
        note.failureReason = "GENERATION_FAILED";
        note.processingStatus = "failed";
        await note.save();
        return {
          success: false,
          message: "Image AI generation failed.",
          error: imageResult.message,
        };
      }

      const imageCredits = calculateRequiredCredits({
        fileType: "image",
        imageCount: note.fileUrls.length,
      });

      let imageRemaining: number | undefined;
      try {
        const consumption = await consumeCredits({
          clerkUserId: note.userId,
          credits: imageCredits,
          noteId: note._id.toString(),
        });
        imageRemaining = consumption.remainingCredits;
        await NoteModel.updateOne(
          { _id: note._id },
          { $set: { processingStatus: "completed", creditsUsed: imageCredits } },
        );
      } catch (creditError) {
        console.error(`Failed to consume credits for images ${noteId}:`, creditError);
        await NoteModel.updateOne(
          { _id: note._id },
          { $set: { failureReason: "INSUFFICIENT_CREDITS" } },
        );
        throw creditError;
      }

      return {
        success: true,
        message: imageRemaining !== undefined
          ? `Study material generated successfully. ${imageCredits} credits used • ${imageRemaining} credits remaining.`
          : "Successfully processed image note and generated study material.",
      };
    } else {
      throw new Error(`Unsupported file type: ${note.fileType}`);
    }

    const noteChunks = createNoteChunksFromPages(extractedContent);

    if (noteChunks.length === 0) {
      throw new Error("No PDF chunks could be created from extracted content.");
    }

    const chunksWithNoteId = noteChunks.map((chunk) => ({
      noteId: note._id,
      ...chunk,
    }));

    // Chunks are stored separately so large PDFs do not depend on Note.extractedContent for AI.
    try {
      await NoteChunkModel.deleteMany({
        noteId: note._id,
      });

      await NoteChunkModel.insertMany(chunksWithNoteId);

      await NoteChunkModel.find({
        noteId: note._id,
      });
    } catch (chunkInsertError) {
      console.error("NoteChunk insertion failed:", chunkInsertError);
      throw chunkInsertError;
    }

    // Keep extractedContent temporarily for old readers while new AI generation uses NoteChunk.
    note.extractedContent = extractedContent;
    note.totalPages = extractedContent.length;
    note.totalChunks = noteChunks.length;
    note.processingStatus = "processing";
    await note.save();

    const textCreditCheck = validateUpload({
      subscription,
      userPlan,
      fileType: "pdf",
      chunkCount: noteChunks.length,
    });

    if (!textCreditCheck.success) {
      note.failureReason = textCreditCheck.errors[0].code;
      note.processingStatus = "failed";
      await note.save();
      return {
        success: false,
        message: textCreditCheck.errors[0].message,
        error: textCreditCheck.errors[0].message,
      };
    }

    const aiResult = await generateStudyMaterial(noteId);
    if (!aiResult.success) {
      note.failureReason = "GENERATION_FAILED";
      note.processingStatus = "failed";
      await note.save();
      return {
        success: false,
        message: "Extraction completed, but AI generation failed.",
        error: aiResult.message,
      };
    }

    const textCredits = calculateRequiredCredits({
      fileType: "pdf",
      chunkCount: noteChunks.length,
    });

    let textRemaining: number | undefined;
    try {
      const consumption = await consumeCredits({
        clerkUserId: note.userId,
        credits: textCredits,
        noteId: note._id.toString(),
      });
      textRemaining = consumption.remainingCredits;
      await NoteModel.updateOne(
        { _id: note._id },
        { $set: { processingStatus: "completed", creditsUsed: textCredits } },
      );
    } catch (creditError) {
      console.error(`Failed to consume credits for text PDF ${noteId}:`, creditError);
      await NoteModel.updateOne(
        { _id: note._id },
        { $set: { failureReason: "INSUFFICIENT_CREDITS" } },
      );
      throw creditError;
    }

    return {
      success: true,
      message: textRemaining !== undefined
        ? `Study material generated successfully. ${textCredits} credits used • ${textRemaining} credits remaining.`
        : "Successfully extracted content and generated study material.",
    };
  } catch (error) {
    console.error(`Error processing note ${noteId}:`, error);

    // Update note status to "failed"
    try {
      await connectToDatabase();
      const note = await NoteModel.findById(noteId);
      if (note) {
        if (!note.failureReason) {
          note.failureReason = "UNKNOWN_ERROR";
        }
        note.processingStatus = "failed";
        await note.save();
      }
    } catch (updateError) {
      console.error("Failed to update note status to failed:", updateError);
    }

    return {
      success: false,
      message: "Failed to process note",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
