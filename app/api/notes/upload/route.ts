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
import { processNote } from "@/lib/extraction/process-note";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Support both direct blob uploads (client provides file URLs) and traditional form uploads
    let title: string;
    let subject: string;
    let fileUrls: string[] = [];
    let fileType: "pdf" | "image";

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      // Expecting body: { title, subject, fileUrls: string[] }
      const body = await request.json();
      title = String(body.title ?? "").trim();
      subject = String(body.subject ?? "").trim();

      if (!Array.isArray(body.fileUrls) || body.fileUrls.length === 0 || !title || !subject) {
        return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
      }

      fileUrls = body.fileUrls.map(String);
      fileType = fileUrls[0]?.toLowerCase().split("?")[0].endsWith(".pdf") ? "pdf" : "image";
    } else {
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
      fileUrls = urls;
      fileType = getUploadFileType(payload.files);
      title = payload.title as string;
      subject = payload.subject as string;
    }

    await connectToDatabase();

    const note = await NoteModel.create({
      userId,
      title,
      subject,
      fileUrls,
      fileType,
    });

    // Fire-and-forget processing: decouple long-running processing from the HTTP response.
    // This avoids keeping the HTTP request open while extraction/AI runs.
    // Note: in serverless environments this is a best-effort approach; consider a durable queue for production.
    processNote(note._id.toString())
      .then((res) => {
        if (!res.success) {
          console.error(`Background processing failed for note ${note._id.toString()}:`, res.error);
        }
      })
      .catch((err) => {
        console.error(`Background processing error for note ${note._id.toString()}:`, err);
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
