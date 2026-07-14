import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getNoteById } from "@/lib/actions/get-note-by-id";
import { getUserSubscription } from "@/lib/business/get-user-subscription";
import { getPermissions } from "@/lib/business/permissions";

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

    const note = await getNoteById(id, userId);
    if (!note) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const subscription = await getUserSubscription();
    const permissions = getPermissions(subscription);

    if (!permissions.canRevisionNotes) {
      return NextResponse.json(
        { error: "Upgrade to Pro to access revision notes." },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const cursorParam = url.searchParams.get("cursor") ?? "0";
    const limitParam = url.searchParams.get("limit") ?? "6";

    const cursor = Math.max(0, Number(cursorParam) || 0);
    const limit = Math.max(1, Number(limitParam) || 6);

    const generatedContent = (note as any).generatedContent as any | undefined;
    const allRevision = Array.isArray(generatedContent?.quickRevision)
      ? generatedContent.quickRevision
      : [];

    const total = allRevision.length;
    const items = allRevision.slice(cursor, cursor + limit);
    const nextCursor = cursor + items.length;
    const hasMore = nextCursor < total;

    return NextResponse.json({ items, nextCursor, hasMore, total });
  } catch (error) {
    console.error(`[revision API] Error:`, error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
