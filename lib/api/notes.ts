import type { AllNote, NotesPagination } from "@/lib/actions/get-all-notes";

export interface NotesResponse {
  notes: AllNote[];
  pagination: NotesPagination;
}

interface GetNotesParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export async function getNotes({
  search = "",
  page = 1,
  limit = 8,
  sort,
}: GetNotesParams = {}): Promise<NotesResponse> {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  params.set("page", String(page));
  params.set("limit", String(limit));
  if (sort) {
    params.set("sort", sort);
  }

  const response = await fetch(`/api/notes${params.size ? `?${params.toString()}` : ""}`);

  if (!response.ok) {
    throw new Error("Failed to load notes.");
  }

  const data = (await response.json()) as NotesResponse;

  return data;
}
