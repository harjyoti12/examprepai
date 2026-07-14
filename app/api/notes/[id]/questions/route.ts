import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getNoteById } from "@/lib/actions/get-note-by-id";

export const runtime = "nodejs";

export async function GET(request: Request, context: any) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const params = context?.params;
    const resolvedParams = typeof params?.then === "function" ? await params : params;
    const id = resolvedParams?.id ?? params?.id;

    if (!id) {
      return NextResponse.json({ error: "Missing note id." }, { status: 400 });
    }

    const url = new URL(request.url);
    const cursorParam = url.searchParams.get("cursor") ?? "0";
    const limitParam = url.searchParams.get("limit") ?? "6";

    const cursor = Math.max(0, Number(cursorParam) || 0);
    const limit = Math.max(1, Number(limitParam) || 6);

    const note = await getNoteById(id, userId);
    if (!note) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const generatedContent = (note as any).generatedContent as any | undefined;
    const allQuestions = Array.isArray(generatedContent?.importantQuestions)
      ? generatedContent.importantQuestions
      : [];

    const total = allQuestions.length;
    const items = allQuestions.slice(cursor, cursor + limit);
    const nextCursor = cursor + items.length;
    const hasMore = nextCursor < total;

    return NextResponse.json({ items, nextCursor, hasMore, total });
  } catch (error) {
    console.error(`[questions API] Error:`, error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
