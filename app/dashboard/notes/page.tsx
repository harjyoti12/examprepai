"use client";

import Link from "next/link";
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
  Eye,
  NotebookTabs,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileTypeIcon } from "@/components/ui/file-type-icon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DeleteNoteDialog } from "@/components/ui/delete-note-dialog";
import { QueryProvider } from "@/components/providers/query-provider";
import { useNotes } from "@/hooks/use-notes";
import type { AllNote } from "@/lib/actions/get-all-notes";
import { cn } from "@/lib/utils";

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages: Array<number | string> = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  // Build a set of page numbers to show, then insert ellipses for gaps
  const pageSet = new Set<number>();
  pageSet.add(1);
  pageSet.add(totalPages);

  if (currentPage <= 3) {
    const end = Math.min(totalPages - 1, currentPage + 2);
    for (let i = 2; i <= end; i++) pageSet.add(i);
  } else if (currentPage >= totalPages - 2) {
    const start = Math.max(2, currentPage - (currentPage >= totalPages - 1 ? 2 : 1));
    for (let i = start; i <= totalPages - 1; i++) pageSet.add(i);
  } else {
    for (let i = currentPage - 1; i <= currentPage + 1; i++) pageSet.add(i);
  }

  const nums = Array.from(pageSet).sort((a, b) => a - b);

  for (let i = 0; i < nums.length; i++) {
    if (i === 0) {
      pages.push(nums[i]);
      continue;
    }

    const prev = nums[i - 1];
    const curr = nums[i];

    if (curr - prev === 1) {
      pages.push(curr);
    } else {
      pages.push("...");
      pages.push(curr);
    }
  }

  return pages;
}

const PAGE_SIZE = 8;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function getSubjectBadgeClass(subject: string) {
  const normalizedSubject = subject.toLowerCase();

  if (normalizedSubject.includes("chem")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (normalizedSubject.includes("math")) {
    return "bg-orange-50 text-orange-700 border-orange-100";
  }

  if (normalizedSubject.includes("bio")) {
    return "bg-pink-50 text-pink-700 border-pink-100";
  }

  if (normalizedSubject.includes("polit") || normalizedSubject.includes("business")) {
    return "bg-sky-50 text-sky-700 border-sky-100";
  }

  return "bg-violet-50 text-violet-700 border-violet-100";
}

function getQuestionCount(note: AllNote) {
  return Array.isArray(note.generatedContent?.importantQuestions)
    ? note.generatedContent.importantQuestions.length
    : 0;
}

function MyNotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlSearch = searchParams?.get("search") ?? "";
  const rawPage = searchParams?.get("page") ?? "1";
  const parsedPage = Number.parseInt(rawPage, 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const urlSort = searchParams?.get("sort") ?? "newest";

  const [search, setSearch] = useState(urlSearch);

  // keep input in sync with URL when user navigates (back/forward)
  useEffect(() => {
    if (search === urlSearch) return;
    const id = window.setTimeout(() => setSearch(urlSearch), 0);
    return () => window.clearTimeout(id);
  }, [urlSearch]);

  // debounce input -> update URL (page reset to 1)
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if ((search ?? "").trim() === (urlSearch ?? "").trim()) return;

      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      params.set("page", String(1));
      params.set("sort", urlSort);

      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search, urlSearch, urlSort, pathname, router]);

  const { data, isError, isFetching, isLoading } = useNotes({
    search: urlSearch,
    page: currentPage,
    limit: PAGE_SIZE,
    sort: urlSort,
  });
  const notes = data?.notes ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  };
  const visibleNotes = notes;
  const totalNotes = pagination.totalItems;
  const showingStart =
    totalNotes > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const showingEnd = Math.min(pagination.page * pagination.limit, totalNotes);
  const hasSearch = urlSearch.trim().length > 0;

  return (
    <main className="main-container font-jakarta text-[#11172F]">
      <div className="w-full space-y-5">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="notes-page-title text-[28px] font-extrabold leading-tight tracking-tight text-[#11172F]">
              My Notes
            </h1>
            <p className="mt-2 text-[15px] font-medium text-[#5B668A]">
              All your uploaded notes and AI generated results in one place.
            </p>
          </div>

          <div className="flex min-w-[140px] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <NotebookTabs className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[15px] font-extrabold leading-none text-[#11172F]">
                {totalNotes} Notes
              </p>
              <p className="mt-1 text-[12px] font-medium text-[#6E7897]">
                Total
              </p>
            </div>
          </div>
        </section>

        {/* Search + Filters */}
        <section className="notes-page-controls rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {/* Mobile: Search + Newest First in one line */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#53617F]" />
              {isFetching && !isLoading ? (
                <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#53617F]" />
              ) : null}
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes..."
                aria-label="Search notes"
                className="h-11 rounded-xl border-gray-200 bg-white pl-12 pr-12 text-[14px] font-medium text-[#11172F] shadow-sm placeholder:text-[#6E7897] focus-visible:ring-violet-200"
              />
            </div>
            <Select
              value={urlSort}
              onValueChange={(value) => {
                const params = new URLSearchParams();
                if (urlSearch.trim()) params.set("search", urlSearch.trim());
                params.set("page", String(1));
                params.set("sort", value);
                router.push(`${pathname}?${params.toString()}`);
              }}
            >
              <SelectTrigger className="notes-page-select h-11 w-[130px] shrink-0 rounded-xl border-gray-200 bg-white text-[13px] font-bold text-[#1E2643] shadow-sm">
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Full two-row layout */}
          <div className="hidden lg:flex lg:flex-col lg:gap-3">
            {/* Search row */}
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#53617F]" />
              {isFetching && !isLoading ? (
                <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#53617F]" />
              ) : null}
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes by title, subject..."
                aria-label="Search notes by title or subject"
                className="h-11 rounded-xl border-gray-200 bg-white pl-12 pr-12 text-[14px] font-medium text-[#11172F] shadow-sm placeholder:text-[#6E7897] focus-visible:ring-violet-200"
              />
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Select defaultValue="all">
                <SelectTrigger className="notes-page-select h-11 w-[190px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={urlSort}
                onValueChange={(value) => {
                  const params = new URLSearchParams();
                  if (urlSearch.trim()) params.set("search", urlSearch.trim());
                  params.set("page", String(1));
                  params.set("sort", value);

                  router.push(`${pathname}?${params.toString()}`);
                }}
              >
                <SelectTrigger className="notes-page-select h-11 w-[190px]">
                  <SelectValue placeholder="Newest First" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Notes content */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {isLoading ? (
            <>
              {/* Desktop skeleton */}
              <div className="hidden lg:flex min-h-[280px] items-center justify-center px-6 py-12 text-center text-[14px] font-medium text-[#6E7897]">
                Loading notes...
              </div>
              {/* Mobile skeletons */}
              <div className="lg:hidden space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="note-card-skeleton animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#E4E7EC] shrink-0" />
                      <div className="h-4 flex-1 rounded bg-[#E4E7EC]" />
                      <div className="w-8 h-8 rounded-lg bg-[#E4E7EC] shrink-0" />
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-2 ml-12">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-16 rounded bg-[#E4E7EC]" />
                        <div className="h-3 w-14 rounded bg-[#E4E7EC]" />
                        <div className="h-3 w-12 rounded bg-[#E4E7EC]" />
                      </div>
                      <div className="h-7 w-20 rounded-md bg-[#E4E7EC] shrink-0 hide-mobile-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : isError ? (
            <div className="flex min-h-[280px] items-center justify-center px-6 py-12 text-center text-[14px] font-medium text-[#6E7897]">
              Failed to load notes.
            </div>
          ) : notes.length > 0 ? (
            <>
              {/* ── Table (desktop) ── */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 bg-[#FBFCFF] hover:bg-[#FBFCFF]">
                      <TableHead className="h-12 px-5 text-[12.5px] font-extrabold text-[#6B7593]">
                        File Name
                      </TableHead>
                      <TableHead className="h-12 px-5 text-[12.5px] font-extrabold text-[#6B7593]">
                        Subject
                      </TableHead>
                      <TableHead className="h-12 px-5 text-[12.5px] font-extrabold text-[#11172F]">
                        <span className="inline-flex items-center gap-1.5">
                          Uploaded On
                          <ArrowDown className="h-3.5 w-3.5" />
                        </span>
                      </TableHead>
                      <TableHead className="h-12 px-5 text-[12.5px] font-extrabold text-[#6B7593]">
                        Questions
                      </TableHead>
                      <TableHead className="h-12 px-5 text-[12.5px] font-extrabold text-[#6B7593]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleNotes.map((note) => {
                      return (
                        <TableRow
                          key={note._id}
                          className="border-gray-100 hover:bg-violet-50/20"
                        >
                          <TableCell className="px-5 py-4">
                            <div className="flex min-w-[300px] items-center gap-3">
                              <FileTypeIcon fileType={note.fileType} title={note.title} />
                              <div className="min-w-0">
                                <p className="truncate text-[15px] font-extrabold text-[#1B2442]">
                                  {note.title}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-md border px-3 py-1 text-[12.5px] font-bold",
                                getSubjectBadgeClass(note.subject)
                              )}
                            >
                              {note.subject}
                            </span>
                          </TableCell>

                          <TableCell className="px-5 py-4">
                            <p className="text-[14px] font-medium text-[#34405E]">
                              {formatDate(note.createdAt)}
                            </p>
                            <p className="mt-1 text-[12.5px] font-medium text-[#6E7897]">
                              {formatTime(note.createdAt)}
                            </p>
                          </TableCell>

                          <TableCell className="px-5 py-4 text-[14px] font-medium text-[#34405E]">
                            {getQuestionCount(note)} Q&A
                          </TableCell>

                          <TableCell className="px-5 py-4">
                            <div className="flex items-center gap-4">
                              <Button
                                variant="outline"
                                className="h-9 rounded-lg border-violet-200 bg-white px-5 text-[13px] font-extrabold text-violet-700 hover:border-violet-300 hover:bg-violet-50"
                                asChild
                              >
                                <Link href={`/dashboard/notes/${note._id}`}>
                                  View Results
                                </Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    aria-label={`More actions for ${note.title}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#53617F] transition-colors hover:bg-violet-50 hover:text-violet-700"
                                  >
                                    <MoreVertical className="h-4.5 w-4.5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/notes/${note._id}`}>
                                      <Eye size={15} strokeWidth={2} />
                                      View Results
                                    </Link>
                                  </DropdownMenuItem>
                                  <DeleteNoteDialog noteId={note._id} noteTitle={note.title} />
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* ── Cards (mobile) ── */}
              <div className="lg:hidden space-y-3">
                {visibleNotes.map((note) => {
                  const qa = getQuestionCount(note);

                  return (
                    <div key={note._id} className="note-card">
                      {/* Row 1: Icon + Title + Menu */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 shrink-0">
                          <FileTypeIcon fileType={note.fileType} title={note.title} />
                        </div>
                        <span className="table-file-name flex-1 min-w-0 truncate">{note.title}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="btn-icon shrink-0" aria-label={`More actions for ${note.title}`}>
                              <MoreVertical size={16} strokeWidth={1.8} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/notes/${note._id}`}>
                                <Eye size={15} strokeWidth={2} />
                                View Results
                              </Link>
                            </DropdownMenuItem>
                            <DeleteNoteDialog noteId={note._id} noteTitle={note.title} />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {/* Row 2: Metadata + View Results */}
                      <div className="flex items-center justify-between gap-2 mt-2 ml-12">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                          <span className="whitespace-nowrap">{note.subject}</span>
                          <span className="whitespace-nowrap">{formatDate(note.createdAt)}</span>
                          <span className="font-medium whitespace-nowrap">{qa} Q&A</span>
                        </div>
                        <div className="shrink-0 hide-mobile-sm">
                          <Button variant="outline" className="btn-results" asChild>
                            <Link href={`/dashboard/notes/${note._id}`}>
                              View Results
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] font-medium text-[#53617F]">
                  Showing {showingStart} to {showingEnd} of{" "}
                  {totalNotes} notes
                </p>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={currentPage <= 1}
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (urlSearch.trim()) params.set("search", urlSearch.trim());
                      params.set("page", String(Math.max(1, currentPage - 1)));
                      params.set("sort", urlSort);

                      router.push(`${pathname}?${params.toString()}`);
                    }}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border-gray-200 bg-white text-[#53617F]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {getVisiblePages(currentPage, pagination.totalPages).map((p, idx) =>
                    p === "..." ? (
                      <div key={`ellipsis-${idx}`} className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center px-0 text-[13px] font-extrabold text-[#53617F]">
                        ...
                      </div>
                    ) : (
                      <Button
                        key={p}
                        type="button"
                        variant={p === currentPage ? "default" : "outline"}
                        onClick={() => {
                          const params = new URLSearchParams();
                          if (urlSearch.trim()) params.set("search", urlSearch.trim());
                          params.set("page", String(p as number));
                          params.set("sort", urlSort);

                          router.push(`${pathname}?${params.toString()}`);
                        }}
                        className={cn(
                          "h-8 w-8 sm:h-9 sm:w-9 rounded-lg px-0 text-[13px] font-extrabold",
                          p === currentPage
                            ? "bg-violet-600 text-white hover:bg-violet-700"
                            : "border-gray-200 bg-white text-[#11172F]"
                        )}
                      >
                        {p}
                      </Button>
                    )
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (urlSearch.trim()) params.set("search", urlSearch.trim());
                      params.set("page", String(Math.min(pagination.totalPages, currentPage + 1)));
                      params.set("sort", urlSort);

                      router.push(`${pathname}?${params.toString()}`);
                    }}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border-gray-200 bg-white text-[#53617F]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="note-card-empty text-center py-8">
              <p className="text-[13.5px] font-semibold text-gray-700">
                {hasSearch ? "No notes matched your search." : "No study notes generated yet."}
              </p>
              <p className="mt-1 text-[12.5px] text-gray-400">
                {hasSearch
                  ? "Try a different title or subject."
                  : "Upload your first PDF or image to begin."}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function MyNotesPage() {
  return (
    <QueryProvider>
      <MyNotesContent />
    </QueryProvider>
  );
}
