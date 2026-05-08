import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { uploadFilesToBlob } from "@/lib/blob-upload";
import { connectToDatabase } from "@/lib/db";
import {
  getUploadFileType,
  noteUploadSchema,
} from "@/lib/validations/note";
import NoteModel from "@/models/note.model";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((file): file is File => file instanceof File && file.size > 0);

    const payload = noteUploadSchema.parse({
      title: formData.get("title"),
      subject: formData.get("subject"),
      files,
    });

    const { urls } = await uploadFilesToBlob(payload.files);

    await connectToDatabase();

    const note = await NoteModel.create({
      userId,
      title: payload.title,
      subject: payload.subject,
      fileUrls: urls,
      fileType: getUploadFileType(payload.files),
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid upload request.",
          details: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    console.error("Note upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
