import { connectToDatabase } from "@/lib/db";
import NoteModel from "@/models/note.model";
import { extractPDFText } from "./extract-pdf-v2";
import { generateStudyMaterial } from "../ai/generate-study-material";
import { processScannedPdf } from "../ai/process-scanned-pdf";
import { processImages } from "../ai/process-images";

interface ProcessingResult {
  success: boolean;
  message: string;
  error?: string;
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

    // Update status to "extracting"
    note.processingStatus = "extracting";
    await note.save();

    let extractedContent: { page: number; text: string }[];

    // Detect file type and run appropriate extraction
    if (note.fileType === "pdf") {
      // Extract from PDF
      const pdfUrl = note.fileUrls[0]; // Should only have one PDF
      extractedContent = await extractPDFText(pdfUrl);

      const isScannedPdf =
        extractedContent.length === 0 ||
        extractedContent.every((page) => !page.text?.trim());

      if (isScannedPdf) {
        note.extractedContent = [];
        note.processingStatus = "processing";
        await note.save();

        console.log(`Detected scanned PDF for note ${noteId}, using Gemini Vision fallback.`);

        const scanResult = await processScannedPdf(noteId, pdfUrl);
        if (!scanResult.success) {
          return {
            success: false,
            message: "Scanned PDF fallback failed.",
            error: scanResult.message,
          };
        }

        return {
          success: true,
          message: "Successfully processed scanned PDF and generated study material.",
        };
      }
    } else if (note.fileType === "image") {
      note.processingStatus = "processing";
      await note.save();

      console.log(`Detected image note for ${noteId}, starting Gemini Vision image generation.`);

      const imageResult = await processImages(noteId);
      if (!imageResult.success) {
        return {
          success: false,
          message: "Image AI generation failed.",
          error: imageResult.message,
        };
      }

      return {
        success: true,
        message: "Successfully processed image note and generated study material.",
      };
    } else {
      throw new Error(`Unsupported file type: ${note.fileType}`);
    }

    // Save extracted PDF content and move into AI generation
    note.extractedContent = extractedContent;
    note.processingStatus = "processing";
    await note.save();

    console.log(`Extraction completed for note ${noteId}, starting AI generation`);

    const aiResult = await generateStudyMaterial(noteId);
    if (!aiResult.success) {
      return {
        success: false,
        message: "Extraction completed, but AI generation failed.",
        error: aiResult.message,
      };
    }

    return {
      success: true,
      message: "Successfully extracted content and generated study material.",
    };
  } catch (error) {
    console.error(`Error processing note ${noteId}:`, error);

    // Update note status to "failed"
    try {
      await connectToDatabase();
      const note = await NoteModel.findById(noteId);
      if (note) {
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
