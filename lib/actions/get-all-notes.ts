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

export interface NotesPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface AllNotesResult {
  notes: AllNote[];
  pagination: NotesPagination;
}

type LeanAllNote = {
  _id: unknown;
  title?: string;
  subject?: string;
  fileType?: string;
  createdAt?: Date | string;
  generatedContent?: StudyMaterial;
};

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface GetAllNotesParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export async function getAllNotes({
  search = "",
  page = 1,
  limit = 8,
  sort = "newest",
}: GetAllNotesParams = {}): Promise<AllNotesResult> {
  const { userId } = await auth();
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);

  if (!userId) {
    return {
      notes: [],
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems: 0,
        totalPages: 0,
      },
    };
  }

  await connectToDatabase();

  const trimmedSearch = search.trim();
  const baseFilter = { userId, processingStatus: { $ne: "failed" } };
  const query =
    trimmedSearch.length > 0
      ? {
          ...baseFilter,
          $or: [
            { title: { $regex: escapeRegex(trimmedSearch), $options: "i" } },
            { subject: { $regex: escapeRegex(trimmedSearch), $options: "i" } },
          ],
        }
      : baseFilter;

  const totalItems = await NoteModel.countDocuments(query);
  const totalPages = Math.ceil(totalItems / safeLimit);
  const sortDirection = sort === "oldest" ? 1 : -1;

  const notes = await NoteModel.find(query)
    .sort({ createdAt: sortDirection })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .select("_id title subject fileType createdAt generatedContent")
    .lean<LeanAllNote[]>()
    .exec();

  return {
    notes: notes.map((note) => ({
      _id: String(note._id),
      title: note.title ?? "Untitled note",
      subject: note.subject ?? "Unknown subject",
      fileType: note.fileType ?? "unknown",
      createdAt: new Date(note.createdAt ?? Date.now()).toISOString(),
      generatedContent: note.generatedContent,
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
    },
  };
}
