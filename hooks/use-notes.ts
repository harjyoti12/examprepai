"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getNotes } from "@/lib/api/notes";

interface UseNotesParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export function useNotes({ search = "", page = 1, limit = 8, sort = "newest" }: UseNotesParams = {}) {
  return useQuery({
    queryKey: ["notes", page, search, sort],
    queryFn: () => getNotes({ search, page, limit, sort }),
    placeholderData: keepPreviousData,
  });
}
