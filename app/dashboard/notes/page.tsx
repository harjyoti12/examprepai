import Link from "next/link";
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  FileImage,
  FileText,
  Grid2X2,
  List,
  MoreVertical,
  NotebookTabs,
  Search,
  SlidersHorizontal,
} from "lucide-react";

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
import { getAllNotes, type AllNote } from "@/lib/actions/get-all-notes";
import { cn } from "@/lib/utils";

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

function getFileTypeLabel(note: AllNote) {
  const extension = note.title.split(".").pop()?.toLowerCase();

  if (extension === "png") {
    return "png";
  }

  if (extension === "jpg" || extension === "jpeg") {
    return extension;
  }

  return note.fileType;
}

function getFileStyle(type: string) {
  const normalizedType = type.toLowerCase();

  if (normalizedType === "pdf") {
    return {
      icon: FileText,
      label: "PDF",
      className: "bg-red-500 text-white",
    };
  }

  if (normalizedType === "png") {
    return {
      icon: FileImage,
      label: "PNG",
      className: "bg-pink-500 text-white",
    };
  }

  if (
    normalizedType === "image" ||
    normalizedType === "jpg" ||
    normalizedType === "jpeg"
  ) {
    return {
      icon: FileImage,
      label: normalizedType === "jpeg" ? "JPG" : normalizedType.toUpperCase(),
      className: "bg-emerald-500 text-white",
    };
  }

  return {
    icon: FileText,
    label: normalizedType.toUpperCase(),
    className: "bg-gray-500 text-white",
  };
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

export default async function MyNotesPage() {
  const notes = await getAllNotes();
  const visibleNotes = notes.slice(0, PAGE_SIZE);
  const totalNotes = notes.length;
  const showingEnd = Math.min(PAGE_SIZE, totalNotes);

  return (
    <main className="main-container font-jakarta text-[#11172F]">
      <div className="w-full space-y-5">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-[#11172F]">
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

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#53617F]" />
              <Input
                placeholder="Search notes by title, subject..."
                className="h-11 rounded-xl border-gray-200 bg-white pl-12 text-[14px] font-medium text-[#11172F] shadow-sm placeholder:text-[#6E7897] focus-visible:ring-violet-200"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                className="h-11 rounded-xl border-gray-200 bg-white px-4 text-[14px] font-bold text-[#1E2643] shadow-sm hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-4 w-4 text-[#53617F]" />
                Filter
              </Button>

              <Select defaultValue="all">
                <SelectTrigger className="h-11 w-[190px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="newest">
                <SelectTrigger className="h-11 w-[190px]">
                  <SelectValue placeholder="Newest First" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-50"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg text-[#53617F] hover:bg-gray-50"
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {notes.length > 0 ? (
            <>
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
                    const fileType = getFileTypeLabel(note);
                    const fileStyle = getFileStyle(fileType);
                    const FileIcon = fileStyle.icon;

                    return (
                      <TableRow
                        key={note._id}
                        className="border-gray-100 hover:bg-violet-50/20"
                      >
                        <TableCell className="px-5 py-4">
                          <div className="flex min-w-[300px] items-center gap-3">
                            <div
                              className={cn(
                                "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                                fileStyle.className
                              )}
                            >
                              <FileIcon className="h-4.5 w-4.5" />
                              <span className="absolute bottom-1 text-[8px] font-extrabold leading-none">
                                {fileStyle.label}
                              </span>
                            </div>
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
                            <button
                              type="button"
                              aria-label={`More actions for ${note.title}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#53617F] transition-colors hover:bg-violet-50 hover:text-violet-700"
                            >
                              <MoreVertical className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] font-medium text-[#53617F]">
                  Showing {totalNotes > 0 ? 1 : 0} to {showingEnd} of{" "}
                  {totalNotes} notes
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg border-gray-200 bg-white text-[#53617F]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {[1, 2, 3].map((page) => (
                    <Button
                      key={page}
                      variant={page === 1 ? "default" : "outline"}
                      className={cn(
                        "h-9 w-9 rounded-lg px-0 text-[13px] font-extrabold",
                        page === 1
                          ? "bg-violet-600 text-white hover:bg-violet-700"
                          : "border-gray-200 bg-white text-[#11172F]"
                      )}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg border-gray-200 bg-white text-[#53617F]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <NotebookTabs className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-[18px] font-extrabold text-[#11172F]">
                No study notes found
              </h2>
              <p className="mt-2 text-[14px] font-medium text-[#6E7897]">
                Upload your first PDF or image to begin.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
