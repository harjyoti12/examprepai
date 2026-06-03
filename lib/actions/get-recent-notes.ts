import { connectToDatabase } from "@/lib/db";
import type { StudyMaterial } from "@/lib/ai/generate-study-material";
import NoteModel from "@/models/note.model";

export interface RecentNote {
  _id: string;
  title: string;
  subject: string;
  fileType: string;
  createdAt: string;
  generatedContent?: StudyMaterial;
}

type LeanRecentNote = {
  _id: unknown;
  title?: string;
  subject?: string;
  fileType?: string;
  createdAt?: Date | string;
  generatedContent?: StudyMaterial;
};

export async function getRecentNotes(): Promise<RecentNote[]> {
  await connectToDatabase();

  const notes = await NoteModel.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select("_id title subject fileType createdAt generatedContent")
    .lean<LeanRecentNote[]>()
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
