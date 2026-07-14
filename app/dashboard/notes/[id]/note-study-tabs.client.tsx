"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Download,
  Layers3,
  Lightbulb,
  NotebookTabs,
  Share2,
  Zap,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StudyMaterial } from "@/lib/ai/generate-study-material";
import { useInfiniteQuery } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/use-permissions";

const ITEMS_PER_PAGE = 6;

export interface NoteStudyTabsProps {
  noteId: string;
  importantQuestionsCount: number;
  quickRevisionCount: number;
  revisionPoints: string[];
  subject: string;
  title: string;
  initialQuestionsData?: { pages: ApiPage<QuestionItem>[]; pageParams: number[] };
  initialRevisionData?: { pages: ApiPage<RevisionItem>[]; pageParams: number[] };
}

type QuestionItem = StudyMaterial["importantQuestions"][number];
type RevisionItem = StudyMaterial["quickRevision"][number];

type ApiPage<T> = {
  items: T[];
  nextCursor: number;
  hasMore: boolean;
  total: number;
};

export function NoteStudyTabs({
  noteId,
  importantQuestionsCount,
  quickRevisionCount,
  revisionPoints,
  subject,
  title,
  initialQuestionsData,
  initialRevisionData,
}: NoteStudyTabsProps) {
  const permissionsResult = usePermissions();
  const { permissions } = permissionsResult;
  const [activeTab, setActiveTab] = useState("questions");

  // Questions infinite query
  const {
    data: questionsData,
    isLoading: isQuestionsLoading,
    isFetchingNextPage: isFetchingNextQuestions,
    fetchNextPage: fetchNextQuestions,
    hasNextPage: hasMoreQuestions,
  } = useInfiniteQuery<ApiPage<QuestionItem>, Error>({
    queryKey: ["note-questions", noteId],
    queryFn: async ({ pageParam = 0 }) => {
      const url = `/api/notes/${noteId}/questions?cursor=${pageParam}&limit=${ITEMS_PER_PAGE}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch questions");
      return (await res.json()) as ApiPage<QuestionItem>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: ApiPage<QuestionItem>) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!noteId,
    initialData: initialQuestionsData as any,
  });

  const questionItems = useMemo<QuestionItem[]>(
    () => questionsData?.pages.flatMap((page) => page.items) ?? [],
    [questionsData],
  );

  // Revision infinite query
  const {
    data: revisionData,
    isLoading: isRevisionLoading,
    isFetchingNextPage: isFetchingNextRevision,
    fetchNextPage: fetchNextRevision,
    hasNextPage: hasMoreRevision,
  } = useInfiniteQuery<ApiPage<RevisionItem>, Error>({
    queryKey: ["note-revision", noteId],
    queryFn: async ({ pageParam = 0 }) => {
      const url = `/api/notes/${noteId}/revision?cursor=${pageParam}&limit=${ITEMS_PER_PAGE}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch revision items");
      return (await res.json()) as ApiPage<RevisionItem>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: ApiPage<RevisionItem>) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!noteId,
    initialData: initialRevisionData as any,
  });

  const revisionItems = useMemo<RevisionItem[]>(
    () => revisionData?.pages.flatMap((page) => page.items) ?? [],
    [revisionData],
  );

  const handleDownloadPdf = () => {
    if (!questionItems.length && !revisionItems.length && !revisionPoints.length) {
      alert("Study content is still loading. Please wait and try again.");
      return;
    }

    const qHtml = questionItems
      .map(
        (item: QuestionItem, i: number) => `
        <div class="q-item">
          <div class="q-num">${i + 1}</div>
          <div class="q-body">
            <h3>${item.question}</h3>
            <p>${item.answer}</p>
          </div>
        </div>`
      )
      .join("");

    const rHtml = revisionItems
      .map(
        (item: RevisionItem, i: number) => `
        <div class="r-item">
          <h3>${i + 1}. ${item.heading}</h3>
          <ul>${item.points.map((p: string) => `<li>${p}</li>`).join("")}</ul>
        </div>`
      )
      .join("");

    const rpHtml = revisionPoints.map((p: string) => `<li>${p}</li>`).join("");

    const pw = window.open("", "_blank");
    if (!pw) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    pw.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>${title} - ${subject}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#111}
        h1{font-size:24px;margin-bottom:4px}
        .sub{font-size:14px;color:#666;margin-bottom:24px}
        h2{font-size:18px;margin:24px 0 12px;border-bottom:1px solid #ddd;padding-bottom:4px}
        .q-item{display:flex;gap:12px;margin-bottom:16px;page-break-inside:avoid}
        .q-num{width:28px;height:28px;border-radius:50%;background:#f0f0ff;display:flex;align-items:center;justify-content:center;font-weight:700;color:#6d28d9;flex-shrink:0}
        .q-body h3{font-size:15px;margin:0 0 4px;color:#5b21b6}
        .q-body p{font-size:13px;margin:0;color:#444;line-height:1.5}
        .r-item{margin-bottom:16px;page-break-inside:avoid}
        .r-item h3{font-size:14px;color:#5b21b6;margin:0 0 8px}
        .r-item ul,.rp-list{margin:4px 0;padding-left:20px}
        .r-item li,.rp-list li{font-size:13px;color:#444;margin-bottom:4px;line-height:1.5}
        @media print{body{padding:20px}@page{margin:20mm}}
      </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="sub">${subject}</p>
        <h2>Important Questions</h2>
        ${qHtml || "<p>No questions available.</p>"}
        <h2>Quick Revision</h2>
        ${rHtml || "<p>No revision items available.</p>"}
        <h2>Revision Points</h2>
        ${rpHtml ? `<ul class="rp-list">${rpHtml}</ul>` : "<p>No revision points available.</p>"}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    pw.document.close();
  };

  const handleShare = async () => {
    const shareData = {
      title,
      text: `${title} - ${subject}`,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-gray-200 bg-white shadow-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-0 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-[58px] border-b-0 bg-transparent p-0">
            <TabsTrigger value="questions" className="h-[58px] px-3 sm:px-5">
              <NotebookTabs className="h-4 w-4" />
              Important Questions
              <span className="ml-2 text-[13px] font-medium text-[#42506E]">({importantQuestionsCount})</span>
            </TabsTrigger>
            {permissions.canRevisionNotes && (
              <TabsTrigger value="revision" className="h-[58px] px-3 sm:px-5">
                <Layers3 className="h-4 w-4" />
                Quick Revision
                <span className="ml-2 text-[13px] font-medium text-[#42506E]">({quickRevisionCount})</span>
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex items-center gap-3 pb-4 sm:pb-0">
            {permissions.canExportPdf && (
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-violet-200 bg-white px-4 text-[13px] font-extrabold text-violet-700 hover:border-violet-300 hover:bg-violet-50"
                onClick={handleDownloadPdf}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            )}
            {permissions.canShare && (
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-violet-200 bg-white px-4 text-[13px] font-extrabold text-violet-700 hover:border-violet-300 hover:bg-violet-50"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="questions" className="m-0">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.7fr_0.7fr]">
            {importantQuestionsCount > 0 ? (
              <div className="space-y-3">
                {/* Initial loading skeletons */}
                {isQuestionsLoading && (
                  <>
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                      <article
                        key={idx}
                        className="group grid grid-cols-[34px_1fr_30px] gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-all sm:grid-cols-[38px_1fr_32px] animate-pulse"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-sm font-extrabold text-violet-700" />
                        <div className="min-w-0">
                          <h2 className="text-[15px] font-extrabold leading-6 text-violet-800">
                            <span className="inline-block h-4 w-48 rounded bg-gray-200" />
                          </h2>
                          <p className="mt-1.5 text-[13.5px] font-medium leading-6 text-[#42506E]">
                            <span className="inline-block h-3 w-full rounded bg-gray-200" />
                          </p>
                        </div>
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-[#435173] transition-colors">
                          <span className="inline-block h-4 w-4 rounded bg-gray-200" />
                        </div>
                      </article>
                    ))}
                  </>
                )}

                {/* Loaded questions */}
                {!isQuestionsLoading && questionItems.map((item, index) => (
                  <article
                    key={index}
                    className="group grid grid-cols-[34px_1fr_30px] gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-violet-200 hover:shadow-sm sm:grid-cols-[38px_1fr_32px]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-sm font-extrabold text-violet-700">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-[15px] font-extrabold leading-6 text-violet-800">{item.question}</h2>
                      <p className="mt-1.5 text-[13.5px] font-medium leading-6 text-[#42506E]">{item.answer}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Bookmark question ${index + 1}`}
                      className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-[#435173] transition-colors hover:bg-violet-50 hover:text-violet-700"
                    >
                      <Bookmark className="h-4.5 w-4.5" />
                    </button>
                  </article>
                ))}

                {/* Load more button */}
                {questionItems.length < importantQuestionsCount ? (
                  <div className="flex justify-center pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-lg border-violet-300 bg-white px-5 text-[13px] font-extrabold text-violet-700 hover:border-violet-400 hover:bg-violet-50"
                      onClick={() => fetchNextQuestions()}
                      disabled={isFetchingNextQuestions || isQuestionsLoading}
                    >
                      {isFetchingNextQuestions ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Loading more...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="m-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-7 text-center text-sm font-medium text-gray-500">
                AI results are still processing or unavailable for this note.
              </div>
            )}

            <aside className="space-y-4">
              {permissions.canRevisionNotes && (
              <Card className="sticky top-6 rounded-2xl border-gray-200 bg-white shadow-sm">
                <CardHeader className="px-5 pb-3 pt-5">
                  <CardTitle className="flex items-center gap-3 text-[17px] font-extrabold text-[#12162F]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                      <Zap className="h-4.5 w-4.5" />
                    </span>
                    Quick Revision
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {revisionPoints.length > 0 ? (
                    <ul className="space-y-3 text-[13.5px] font-medium leading-6 text-[#42506E]">
                      {revisionPoints.slice(0, 5).map((point, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13.5px] font-medium leading-6 text-gray-500">
                      Quick revision notes are not available yet for this note.
                    </p>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-5 h-10 w-full rounded-lg border-violet-300 bg-white text-[13px] font-extrabold text-violet-700 hover:border-violet-400 hover:bg-violet-50"
                    onClick={() => setActiveTab("revision")}
                  >
                    View All Revision Points
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              )}
              <Card className="rounded-2xl border-gray-200 bg-[#FDFDFF] shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                      <Lightbulb className="h-4.5 w-4.5" />
                    </span>
                    <h2 className="text-[16px] font-extrabold text-[#12162F]">Tip</h2>
                  </div>
                  <p className="text-[13.5px] font-medium leading-6 text-[#42506E]">
                    Focus on understanding {subject} concepts and rewriting the answers in your own words for better retention.
                  </p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        {permissions.canRevisionNotes && (
        <TabsContent value="revision" className="m-0" id="revision-content">
          {quickRevisionCount > 0 ? (
            <div className="space-y-3 p-5 sm:p-7">
              {/* initial loading skeletons for revision */}
              {isRevisionLoading && (
                <>
                  {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                    <article
                      key={idx}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all sm:hover:border-violet-200 animate-pulse"
                    >
                      <h2 className="flex items-center gap-2 text-[14.5px] font-extrabold text-violet-800">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs text-violet-700" />
                        <span className="inline-block h-4 w-48 rounded bg-gray-200" />
                      </h2>
                      <ul className="mt-3 space-y-2 pl-9 text-[13.5px] font-medium leading-6 text-[#42506E]">
                        <li className="list-disc marker:text-violet-500">
                          <span className="inline-block h-3 w-full rounded bg-gray-200" />
                        </li>
                      </ul>
                    </article>
                  ))}
                </>
              )}

              {/* loaded revision items */}
              {!isRevisionLoading && revisionItems.map((item, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-violet-200 hover:shadow-sm"
                >
                  <h2 className="flex items-center gap-2 text-[14.5px] font-extrabold text-violet-800">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-xs text-violet-700">{index + 1}</span>
                    {item.heading}
                  </h2>
                  <ul className="mt-3 space-y-2 pl-9 text-[13.5px] font-medium leading-6 text-[#42506E]">
                    {item.points.map((point: string, pointIndex: number) => (
                      <li key={pointIndex} className="list-disc marker:text-violet-500">{point}</li>
                    ))}
                  </ul>
                </article>
              ))}

              {revisionItems.length < quickRevisionCount ? (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-lg border-violet-300 bg-white px-5 text-[13px] font-extrabold text-violet-700 hover:border-violet-400 hover:bg-violet-50"
                    onClick={() => fetchNextRevision()}
                    disabled={isFetchingNextRevision || isRevisionLoading}
                  >
                    {isFetchingNextRevision ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Loading more...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="m-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-7 text-center text-sm font-medium text-gray-500">
              Quick revision notes are not available yet for this note.
            </div>
          )}
        </TabsContent>)}
      </Tabs>
    </Card>
  );
}
