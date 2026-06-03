import { auth } from "@clerk/nextjs/server";

import { connectToDatabase } from "@/lib/db";
import type { StudyMaterial } from "@/lib/ai/generate-study-material";
import NoteModel from "@/models/note.model";

export interface AllNote {
  _id: string;
  title: string;
  subject: string;
  fileType: string;
  createdAt: string;
  generatedContent?: StudyMaterial;
}

type LeanAllNote = {
  _id: unknown;
  title?: string;
  subject?: string;
  fileType?: string;
  createdAt?: Date | string;
  generatedContent?: StudyMaterial;
};

export async function getAllNotes(): Promise<AllNote[]> {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  await connectToDatabase();

  const notes = await NoteModel.find({ userId })
    .sort({ createdAt: -1 })
    .select("_id title subject fileType createdAt generatedContent")
    .lean<LeanAllNote[]>()
    .exec();

  return notes.map((note) => ({
    _id: String(note._id),
    title: note.title ?? "Untitled note",
    subject: note.subject ?? "Unknown subject",
    fileType: note.fileType ?? "unknown",
    createdAt: new Date(note.createdAt ?? Date.now()).toISOString(),
    generatedContent: note.generatedContent,
  }));
}
