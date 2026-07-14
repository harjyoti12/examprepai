import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import NoteModel from "@/models/note.model";

export const runtime = "nodejs";

export async function GET(request: Request, context: any) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const params = await context?.params;
  const id = params?.id;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  await connectToDatabase();

  const note = await NoteModel.findOne(
    { _id: id, userId },
    { _id: 1, processingStatus: 1, fileType: 1, creditsUsed: 1, totalPages: 1, totalChunks: 1, failureReason: 1 }
  )
    .lean<{ _id: mongoose.Types.ObjectId; processingStatus: string; fileType: string; creditsUsed: number; totalPages: number; totalChunks: number; failureReason: string } | null>()
    .exec();

  if (!note) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  return NextResponse.json({
    noteId: note._id.toString(),
    processingStatus: note.processingStatus,
    fileType: note.fileType,
    creditsUsed: note.creditsUsed ?? 0,
    totalPages: note.totalPages ?? 0,
    totalChunks: note.totalChunks ?? 0,
    failureReason: note.failureReason ?? "",
  });
}
