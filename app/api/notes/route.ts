import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getAllNotes } from "@/lib/actions/get-all-notes";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "8");
  const result = await getAllNotes({
    search: searchParams.get("search") ?? "",
    page: Number.isFinite(page) ? page : 1,
    limit: Number.isFinite(limit) ? limit : 8,
    sort: searchParams.get("sort") ?? undefined,
  });

  return NextResponse.json(result);
}
