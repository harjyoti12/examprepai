import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";

import { connectToDatabase } from "@/lib/db";
import { getNoteById } from "@/lib/actions/get-note-by-id";
import NoteModel from "@/models/note.model";
import NoteChunkModel from "@/models/note-chunk.model";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const note = await getNoteById(id, userId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Delete all Vercel Blob files
    const fileUrls: string[] = note.fileUrls ?? [];
    const blobResults = await Promise.allSettled(
      fileUrls.map((url) => del(url))
    );
    for (const result of blobResults) {
      if (result.status === "rejected") {
        console.error("Blob deletion failed:", result.reason);
      }
    }

    // Delete note chunk records
    await NoteChunkModel.deleteMany({ noteId: id });

    // Delete the note itself
    await NoteModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
