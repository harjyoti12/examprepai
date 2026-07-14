import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db";
import NoteModel, { type Note } from "@/models/note.model";

export async function getNoteById(noteId: string, clerkUserId: string): Promise<Note | null> {
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return null;
  }

  await connectToDatabase();

  const note = await NoteModel.findOne(
    { _id: noteId, userId: clerkUserId },
  ).maxTimeMS(10_000).lean().exec();
  return note as Note | null;
}
