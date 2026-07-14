import { after } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { uploadFilesToBlob } from "@/lib/blob-upload";
import { connectToDatabase } from "@/lib/db";
import {
  getUploadFileType,
  noteUploadSchema,
} from "@/lib/validations/note";
import { getUserPlan } from "@/lib/business/get-user-plan";
import { getUserSubscription } from "@/lib/business/get-user-subscription";
import { validateUpload } from "@/lib/business/validate-upload";
import { checkRateLimit, RATE_LIMITS } from "@/lib/business/rate-limit";
import NoteModel from "@/models/note.model";
import { processNote } from "@/lib/extraction/process-note";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const rateCheck = checkRateLimit(`upload:${userId}`, RATE_LIMITS.UPLOAD);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again in a moment." },
        { status: 429 },
      );
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

    const fileType = getUploadFileType(payload.files);
    const subscription = await getUserSubscription();
    const userPlan = await getUserPlan(userId);

    const validation = validateUpload({
      subscription,
      userPlan,
      fileType,
      fileSizeMB:
        fileType === "pdf"
          ? payload.files[0].size / (1024 * 1024)
          : undefined,
      imageCount: fileType === "image" ? payload.files.length : undefined,
    });

    if (!validation.success) {
      const errorDetails: Record<string, unknown> = {};

      if (validation.requiredCredits !== undefined) {
        errorDetails.requiredCredits = validation.requiredCredits;
        errorDetails.remainingCredits = validation.remainingCredits;
        errorDetails.creditsNeeded = validation.creditsNeeded;
      }

      if (validation.errors[0].code === "PDF_SIZE_EXCEEDED") {
        errorDetails.maxSizeMB = subscription.maxPdfSizeMB;
        errorDetails.actualSizeMB = Math.round(
          payload.files[0].size / (1024 * 1024) * 10,
        ) / 10;
        errorDetails.planName = subscription.isFree ? "Free" : "Pro";
      }

      if (validation.errors[0].code === "IMAGE_COUNT_EXCEEDED") {
        errorDetails.maxImages = subscription.maxImages;
        errorDetails.actualCount = payload.files.length;
        errorDetails.planName = subscription.isFree ? "Free" : "Pro";
      }

      return NextResponse.json(
        {
          error: validation.errors[0].message,
          errorCode: validation.errors[0].code,
          errorDetails,
        },
        { status: 403 },
      );
    }

    const { urls } = await uploadFilesToBlob(payload.files);

    await connectToDatabase();

    const note = await NoteModel.create({
      userId,
      title: payload.title,
      subject: payload.subject,
      fileUrls: urls,
      fileType: getUploadFileType(payload.files),
    });

    // Trigger extraction in the background after the response is returned.
    // next/server `after()` keeps the serverless runtime alive until the
    // callback resolves, so processing is not cut off on Vercel.
    after(async () => {
      try {
        const processResult = await processNote(note._id.toString());

        if (!processResult.success) {
          console.error(`Extraction failed for note ${note._id.toString()}:`, processResult.error);
        }
      } catch (err) {
        console.error(`Unhandled error during background processing of note ${note._id.toString()}:`, err);
      }
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
