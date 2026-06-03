import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db";
import NoteModel, { type Note } from "@/models/note.model";

export async function getNoteById(noteId: string): Promise<Note | null> {
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return null;
  }

  await connectToDatabase();

  const note = await NoteModel.findById(noteId).lean().exec();
  return note as Note | null;
}
