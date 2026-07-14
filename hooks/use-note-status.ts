"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProcessingStatus =
  | "uploaded"
  | "extracting"
  | "processing"
  | "completed"
  | "failed";

export interface StatusResponse {
  noteId: string;
  processingStatus: ProcessingStatus;
  fileType: string;
  creditsUsed: number;
  totalPages: number;
  totalChunks: number;
  failureReason: string;
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

async function fetchNoteStatus(noteId: string): Promise<StatusResponse> {
  const response = await fetch(`/api/notes/${noteId}/status`);

  if (response.status === 401) {
    throw new Error("Unauthorized.");
  }

  if (response.status === 404) {
    throw new Error("Note not found.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch note status.");
  }

  return response.json() as Promise<StatusResponse>;
}

// ---------------------------------------------------------------------------
// Terminal-state guard
// ---------------------------------------------------------------------------

const TERMINAL_STATUSES: ProcessingStatus[] = ["completed", "failed"];

function isTerminal(status: ProcessingStatus | undefined): boolean {
  return status !== undefined && TERMINAL_STATUSES.includes(status);
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_POLL_DURATION_MS = 300_000; // 5 minutes — algorithm constant, kept local

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNoteStatus(noteId: string) {
  const pollStartRef = useRef<number | null>(null);

  const { data, isLoading, isError, error, isFetching, failureCount } = useQuery<StatusResponse, Error>({
    queryKey: ["note-status", noteId],
    queryFn: () => fetchNoteStatus(noteId),
    enabled: Boolean(noteId),
    refetchInterval: (query) => {
      const status = query.state.data?.processingStatus;
      if (isTerminal(status)) {
        return false;
      }

      if (pollStartRef.current === null) {
        pollStartRef.current = Date.now();
      } else if (Date.now() - pollStartRef.current > MAX_POLL_DURATION_MS) {
        console.warn("[useNoteStatus] Max polling duration exceeded, stopping");
        return false;
      }

      return 2000;
    },
    retry: false,
  });

  return {
    status: data?.processingStatus,
    fileType: data?.fileType,
    creditsUsed: data?.creditsUsed,
    totalPages: data?.totalPages,
    totalChunks: data?.totalChunks,
    failureReason: data?.failureReason,
    isLoading,
    isError,
    error,
  };
}
