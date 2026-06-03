"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Download,
  Layers3,
  Lightbulb,
  NotebookTabs,
  Share2,
  Zap,
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

const ITEMS_PER_PAGE = 6;

interface NoteStudyTabsProps {
  importantQuestions: StudyMaterial["importantQuestions"];
  quickRevision: StudyMaterial["quickRevision"];
  revisionPoints: string[];
  subject: string;
  title: string;
}

export function NoteStudyTabs({
  importantQuestions,
  quickRevision,
  revisionPoints,
  subject,
  title,
}: NoteStudyTabsProps) {
  const [activeTab, setActiveTab] = useState("questions");
  const [visibleQuestions, setVisibleQuestions] = useState(ITEMS_PER_PAGE);
  const [visibleRevision, setVisibleRevision] = useState(ITEMS_PER_PAGE);

  const shownQuestions = importantQuestions.slice(0, visibleQuestions);
  const shownRevision = quickRevision.slice(0, visibleRevision);
  const canLoadMoreQuestions = visibleQuestions < importantQuestions.length;
  const canLoadMoreRevision = visibleRevision < quickRevision.length;

  const handleDownloadPdf = () => {
    window.print();
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
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-gray-200 bg-white shadow-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-0 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-[58px] border-b-0 bg-transparent p-0">
            <TabsTrigger value="questions" className="h-[58px] px-3 sm:px-5">
              <NotebookTabs className="h-4 w-4" />
              Important Questions
            </TabsTrigger>
            <TabsTrigger value="revision" className="h-[58px] px-3 sm:px-5">
              <Layers3 className="h-4 w-4" />
              Quick Revision
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 pb-4 sm:pb-0">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg border-violet-200 bg-white px-4 text-[13px] font-extrabold text-violet-700 hover:border-violet-300 hover:bg-violet-50"
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg border-violet-200 bg-white px-4 text-[13px] font-extrabold text-violet-700 hover:border-violet-300 hover:bg-violet-50"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <TabsContent value="questions" className="m-0">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.7fr_0.7fr]">
            {importantQuestions.length > 0 ? (
              <div className="space-y-3">
                {shownQuestions.map((item, index) => (
                  <article
                    key={index}
                    className="group grid grid-cols-[34px_1fr_30px] gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-violet-200 hover:shadow-sm sm:grid-cols-[38px_1fr_32px]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-sm font-extrabold text-violet-700">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-[15px] font-extrabold leading-6 text-violet-800">
                        {item.question}
                      </h2>
                      <p className="mt-1.5 text-[13.5px] font-medium leading-6 text-[#42506E]">
                        {item.answer}
                      </p>
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

                {canLoadMoreQuestions ? (
                  <div className="flex justify-center pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-lg border-violet-300 bg-white px-5 text-[13px] font-extrabold text-violet-700 hover:border-violet-400 hover:bg-violet-50"
                      onClick={() =>
                        setVisibleQuestions((count) => count + ITEMS_PER_PAGE)
                      }
                    >
                      Load More
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

              <Card className="rounded-2xl border-gray-200 bg-[#FDFDFF] shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                      <Lightbulb className="h-4.5 w-4.5" />
                    </span>
                    <h2 className="text-[16px] font-extrabold text-[#12162F]">
                      Tip
                    </h2>
                  </div>
                  <p className="text-[13.5px] font-medium leading-6 text-[#42506E]">
                    Focus on understanding {subject} concepts and rewriting the
                    answers in your own words for better retention.
                  </p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="revision" className="m-0" id="revision-content">
          {quickRevision.length > 0 ? (
            <div className="space-y-3 p-5 sm:p-7">
              {shownRevision.map((item, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-violet-200 hover:shadow-sm"
                >
                  <h2 className="flex items-center gap-2 text-[14.5px] font-extrabold text-violet-800">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-xs text-violet-700">
                      {index + 1}
                    </span>
                    {item.heading}
                  </h2>
                  <ul className="mt-3 space-y-2 pl-9 text-[13.5px] font-medium leading-6 text-[#42506E]">
                    {item.points.map((point, pointIndex) => (
                      <li
                        key={pointIndex}
                        className="list-disc marker:text-violet-500"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}

              {canLoadMoreRevision ? (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-lg border-violet-300 bg-white px-5 text-[13px] font-extrabold text-violet-700 hover:border-violet-400 hover:bg-violet-50"
                    onClick={() =>
                      setVisibleRevision((count) => count + ITEMS_PER_PAGE)
                    }
                  >
                    Load More
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="m-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-7 text-center text-sm font-medium text-gray-500">
              Quick revision notes are not available yet for this note.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
