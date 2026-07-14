import Link from "next/link";
import {
  BookOpen,
  Clock3,
  FileText,
  Folder,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { getNoteById } from "@/lib/actions/get-note-by-id";
import { getPermissions } from "@/lib/business/permissions";
import { getUserSubscription } from "@/lib/business/get-user-subscription";
import type { StudyMaterial } from "@/lib/ai/generate-study-material";
import { NoteStudyTabs } from "./note-study-tabs";

export const dynamic = "force-dynamic";

interface NoteDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getRevisionPoints(quickRevision: StudyMaterial["quickRevision"]) {
  return quickRevision.flatMap((item) => item.points.filter(Boolean));
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${label} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

function NoteUnavailable({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="main-container py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Note unavailable
        </p>
        <h1 className="mt-6 text-3xl font-semibold text-slate-900">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link href="/dashboard/notes">Back to notes</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default async function NoteDetailsPage({
  params,
}: NoteDetailsPageProps) {
  const { id } = await params;

  const { userId } = await auth();

  if (!userId) {
    return (
      <NoteUnavailable
        title="We could not locate this study note."
        message="The note may have been deleted or the link is invalid. Return to your notes to continue."
      />
    );
  }

  let note;
  try {
    note = await withTimeout(getNoteById(id, userId), 10_000, "Loading note results");
  } catch (error) {
    console.error("[NoteDetailsPage] Failed to load note:", error);
    return (
      <NoteUnavailable
        title="The results page is taking too long to load."
        message="The server could not load this note in time. Refresh the page after restarting the dev server, or check the database and Clerk session configuration."
      />
    );
  }

  if (!note) {
    return (
      <NoteUnavailable
        title="We could not locate this study note."
        message="The note may have been deleted or the link is invalid. Return to your notes to continue."
      />
    );
  }

  const generatedContent = note.generatedContent as StudyMaterial | undefined;
  const importantQuestions = generatedContent?.importantQuestions ?? [];
  const quickRevision = generatedContent?.quickRevision ?? [];
  const revisionPoints = getRevisionPoints(
    generatedContent?.quickRevision ?? [],
  );

  const subscription = await getUserSubscription();
  const permissions = getPermissions(subscription);

  const createdAt = new Date(note.createdAt);
  const totalPages = note.totalPages || 1;
  const sourceFileHref = note.fileUrls[0] ?? "#";

  return (
    <main className="main-container pb-7 font-jakarta text-[#11172F]">
      <div className="w-full space-y-5">
        <section className="overflow-hidden rounded-3xl border border-violet-100 bg-[#F5F3FF] px-5 py-5 shadow-sm sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-33 w-44.5 shrink-0 max-sm:h-28 max-sm:w-full">
                <div className="absolute left-7 top-2 h-26 w-20.5 rotate-[-7deg] rounded-xl border border-violet-200 bg-white shadow-sm">
                  <div className="mx-auto mt-4 flex h-6 w-14 items-center justify-center rounded-md bg-violet-500 text-[10px] font-extrabold uppercase tracking-wide text-white">
                    Notes
                  </div>
                  <div className="mx-4 mt-4 space-y-2">
                    <span className="block h-1.5 rounded-full bg-violet-100" />
                    <span className="block h-1.5 rounded-full bg-violet-100" />
                    <span className="block h-1.5 w-8 rounded-full bg-violet-100" />
                  </div>
                </div>
                <div className="absolute left-20.5 top-9 h-23 w-18 -rotate-12deg rounded-xl bg-violet-500 shadow-sm">
                  <div className="mx-auto mt-4 h-3 w-11 rounded-sm bg-violet-200" />
                  <BookOpen className="absolute bottom-5 left-5 h-7 w-7 text-yellow-300" />
                </div>
                <Sparkles className="absolute left-2 top-6 h-3.5 w-3.5 text-yellow-400" />
                <Sparkles className="absolute right-5 top-3 h-4 w-4 text-yellow-400" />
                <GraduationCap className="absolute bottom-5 left-3 h-8 w-8 text-violet-400" />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[26px] font-extrabold leading-tight tracking-tight text-[#12162F] sm:text-[30px]">
                  {note.title}
                </h1>
                <div className="mt-4 grid gap-2 text-[13.5px] font-medium text-[#34405E]">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#34405E]" />
                    <span className="font-bold text-[#1E2643]">Subject:</span>
                    <span>{note.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#34405E]" />
                    <span className="font-bold text-[#1E2643]">Pages:</span>
                    <span>{totalPages} pages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-[#34405E]" />
                    <span className="font-bold text-[#1E2643]">Generated:</span>
                    <span>{formatDate(createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="h-11 rounded-xl border-violet-100 bg-white px-5 text-[13.5px] font-bold text-[#27314D] shadow-sm hover:border-violet-200 hover:bg-white"
              asChild
            >
              <Link
                href={sourceFileHref}
                target={sourceFileHref === "#" ? undefined : "_blank"}
                rel={sourceFileHref === "#" ? undefined : "noreferrer"}
                className="inline-flex items-center justify-center gap-2"
              >
                <Folder className="h-4 w-4" />
                View Source Files
              </Link>
            </Button>
          </div>
        </section>

        <NoteStudyTabs
          importantQuestions={importantQuestions}
          quickRevision={quickRevision}
          revisionPoints={revisionPoints}
          subject={note.subject}
          title={note.title}
          canShare={permissions.canShare}
          canExportPdf={permissions.canExportPdf}
        />
      </div>
    </main>
  );
}
