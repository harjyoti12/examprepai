import { connectToDatabase } from "@/lib/db";
import NoteModel from "@/models/note.model";
import NoteChunkModel from "@/models/note-chunk.model";
import { extractPDFText } from "./extract-pdf";
import { generateStudyMaterial } from "../ai/generate-study-material";
import { createNoteChunksFromPages } from "../ai/chunk-content";
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
        note.totalPages = extractedContent.length;
        note.totalChunks = 0;
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

    const noteChunks = createNoteChunksFromPages(extractedContent);

    console.log("NoteChunk model name:", NoteChunkModel.modelName);
    console.log("NoteChunk collection name:", NoteChunkModel.collection.name);
    console.log("Note ID:", note._id.toString());
    console.log("Extracted pages:", extractedContent.length);
    console.log(
      "Extracted page text lengths:",
      extractedContent.map((page) => ({
        page: page.page,
        textLength: page.text.length,
      })),
    );
    console.log("Generated chunks:", noteChunks.length);
    console.log("First chunk:", noteChunks[0]);

    if (noteChunks.length === 0) {
      throw new Error("No PDF chunks could be created from extracted content.");
    }

    const chunksWithNoteId = noteChunks.map((chunk) => ({
      noteId: note._id,
      ...chunk,
    }));

    console.log("Chunk docs:", chunksWithNoteId.length);
    console.log("First chunk with noteId:", chunksWithNoteId[0]);

    // Chunks are stored separately so large PDFs do not depend on Note.extractedContent for AI.
    try {
      const deleteResult = await NoteChunkModel.deleteMany({
        noteId: note._id,
      });
      console.log("Existing chunk delete count:", deleteResult.deletedCount);

      console.log("Saving chunks...");
      const insertedChunks = await NoteChunkModel.insertMany(chunksWithNoteId);
      console.log("Inserted chunks:", insertedChunks.length);
      console.log("First inserted chunk:", insertedChunks[0]);

      const savedChunks = await NoteChunkModel.find({
        noteId: note._id,
      });

      console.log("Saved chunks in database:", savedChunks.length);
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
