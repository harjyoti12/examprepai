'use client'

import Link from "next/link";
import {
  Search,
  Upload,
  Play,
  Zap,
  Sun,
  User,
  SlidersHorizontal,
  ArrowRight,
  MoreVertical,
  Eye,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { FileTypeIcon } from "@/components/ui/file-type-icon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DeleteNoteDialog } from "@/components/ui/delete-note-dialog";
import { useNotes } from "@/hooks/use-notes";
import { useDebounce } from "@/hooks/use-debounce";
import type { AllNote } from "@/lib/actions/get-all-notes";

// ── Helpers (same as Notes page) ──────────────────────────────────────────────

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getQuestionCount(note: AllNote) {
  return Array.isArray(note.generatedContent?.importantQuestions)
    ? note.generatedContent.importantQuestions.length
    : 0;
}

// ── Hero illustration (unchanged) ─────────────────────────────────────────────

function HeroIllustration() {
  return (
    <div className="relative">
     <svg width="332" height="208" viewBox="0 0 332 208" fill="none" xmlns="http://www.w3.org/2000/svg">
   <defs>
     <linearGradient id="bgGrad" x1="0" y1="0" x2="332" y2="208" gradientUnits="userSpaceOnUse">
       <stop offset="0" stopColor="#F5F4FE"/>
       <stop offset="1" stopColor="#ECE7FC"/>
     </linearGradient>
     <linearGradient id="folderGrad" x1="85" y1="100" x2="225" y2="178" gradientUnits="userSpaceOnUse">
       <stop offset="0" stopColor="#DCD0FD"/>
       <stop offset="1" stopColor="#AF92F2"/>
     </linearGradient>
     <linearGradient id="backTabGrad" x1="210" y1="95" x2="240" y2="150" gradientUnits="userSpaceOnUse">
       <stop offset="0" stopColor="#8B63E8"/>
       <stop offset="1" stopColor="#6936CC"/>
     </linearGradient>
     <linearGradient id="capGrad" x1="165" y1="128" x2="257" y2="153" gradientUnits="userSpaceOnUse">
       <stop offset="0" stopColor="#4A4470"/>
       <stop offset="1" stopColor="#1C1A33"/>
     </linearGradient>
     <linearGradient id="capBaseGrad" x1="186" y1="150" x2="240" y2="175" gradientUnits="userSpaceOnUse">
       <stop offset="0" stopColor="#262345"/>
       <stop offset="1" stopColor="#100F1E"/>
     </linearGradient>
     <linearGradient id="tasselGrad" x1="238" y1="142" x2="252" y2="172" gradientUnits="userSpaceOnUse">
       <stop offset="0" stopColor="#F6C667"/>
       <stop offset="1" stopColor="#E08F2A"/>
     </linearGradient>
     <radialGradient id="shadowGrad" cx="0.5" cy="0.5" r="0.5">
       <stop offset="0" stopColor="#7C5CD6" stopOpacity="0.35"/>
       <stop offset="1" stopColor="#7C5CD6" stopOpacity="0"/>
     </radialGradient>
   </defs>
   <rect width="332" height="208" rx="10" fill="url(#bgGrad)"/>


   <path d="M37 119 Q39 129 47 132 Q39 135 37 145 Q35 135 27 132 Q35 129 37 119 Z" fill="#FFFFFF"/>
   <path d="M58 147 Q59.3 153 65 155 Q59.3 157 58 163 Q56.7 157 51 155 Q56.7 153 58 147 Z" fill="#FFFFFF"/>
   <path d="M97 78 Q98.5 84.5 105 87 Q98.5 89.5 97 96 Q95.5 89.5 89 87 Q95.5 84.5 97 78 Z" fill="#FFD981"/>
   <path d="M255 64 Q257 73 266 76 Q257 79 255 88 Q253 79 244 76 Q253 73 255 64 Z" fill="#FFFFFF"/>
   <path d="M240 92 Q241.2 97 246.5 99 Q241.2 101 240 106 Q238.8 101 233.5 99 Q238.8 97 240 92 Z" fill="#FFFFFF"/>

   <ellipse cx="220" cy="178" rx="46" ry="9" fill="url(#shadowGrad)"/>

   <path
     d="M213 147
        L213 122
        C213 122 211 104 222 97
        C231 91.5 240 97.5 240 109
        C240 118 236 122 236 130
        L236 147
        Z"
     fill="url(#backTabGrad)"
   />


   <path
     d="M112 110
        L112 35
        C112 32.8 113.8 31 116 31
        L186 31
        L203 48
        L203 110
        Z"
     fill="#FFFFFF"
   />
   <path d="M186 31 L186 44 C186 46.2 187.8 48 190 48 L203 48 Z" fill="#E7E5F5"/>
   <rect x="129" y="65" width="58" height="3" rx="1.5" fill="#D7D5EC"/>
   <rect x="129" y="75" width="68" height="3" rx="1.5" fill="#D7D5EC"/>
   <rect x="129" y="85" width="63" height="3" rx="1.5" fill="#D7D5EC"/>
   <rect x="129" y="95" width="50" height="3" rx="1.5" fill="#D7D5EC"/>

  
   <path
     d="M85 108
        C85 103.6 88.6 100 93 100
        L116 100
        C118.5 100 120.7 101.2 122 103
        L128 111
        C129.3 112.8 131.5 114 134 114
        L210 114
        C214.4 114 218 117.6 218 122
        L218 170
        C218 174.4 214.4 178 210 178
        L93 178
        C88.6 178 85 174.4 85 170
        Z"
     fill="url(#folderGrad)"
   />


   <path
     d="M186 152
        C186 148 196 145 213 145
        C230 145 240 148 240 152
        L240 166
        C240 172 230 176 213 176
        C196 176 186 172 186 166
        Z"
     fill="url(#capBaseGrad)"
   />
   <path d="M213 142 L246 148" stroke="#E8B23C" strokeWidth="1.6" strokeLinecap="round"/>
   <path
     d="M244 148
        C244 146 246 145 248 145
        C250 145 252 146 252 148
        L252 165
        C252 168 250 171 248 171
        C246 171 244 168 244 165
        Z"
     fill="url(#tasselGrad)"
   />
   <ellipse cx="248" cy="171" rx="3.4" ry="2" fill="#E08F2A"/>
   <path
     d="M213 128
        L257 144.5
        C259 145.3 259 147.7 257 148.5
        L215 162
        C214 162.3 212.7 162.3 211.7 162
        L165 146.5
        C163 145.7 163 143 165 142.2
        L210.7 128.3
        C211.4 128.1 212.3 128.1 213 128.3 Z"
     fill="url(#capGrad)"
   />
   <circle cx="213" cy="145" r="2.6" fill="#16152A"/>
 </svg>
       {/* Floating mini cards */}
       <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-md p-2 border border-gray-200">
         <div className="text-xs font-semibold text-purple-600">25 Questions Generated</div>
       </div>
       <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-md p-2 border border-gray-200">
         <div className="text-xs font-semibold text-green-600">Ready in 15s</div>
       </div>
     </div>
   );
}

// ── My Notes section (client, searchable) ─────────────────────────────────────

function MyNotesSection() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isFetching } = useNotes({
    search: debouncedSearch,
    page: 1,
    limit: 5,
    sort: "newest",
  });

  const notes = data?.notes ?? [];
  const hasSearch = debouncedSearch.trim().length > 0;

  const viewAllHref = hasSearch
    ? `/dashboard/notes?search=${encodeURIComponent(debouncedSearch.trim())}`
    : "/dashboard/notes";

  return (
    <div className="section-container">
      {/* Section header */}
      <div className="section-header flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="section-title">My Notes</h2>
          <p className="section-description">
            Your previously uploaded notes and generated documents
          </p>
        </div>
        <div className="section-controls flex flex-row gap-2 w-full">
          {/* Search */}
          <div className="search-wrapper flex-[4] min-w-0">
            <Search size={13} strokeWidth={2} className="search-icon" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your notes..."
              className="input-search"
            />
            {isFetching && !isLoading && (
              <Loader2 size={12} className="animate-spin text-gray-400 shrink-0" />
            )}
          </div>
          {/* Filter */}
          <Button variant="outline" className="btn-filter flex-[1] shrink-0">
            <SlidersHorizontal size={13} strokeWidth={2} />
            Filter
          </Button>
        </div>
      </div>

      {/* ── Table (desktop) ── */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableBody>
            {isLoading ? (
              /* Skeleton rows matching actual table layout */
              [1, 2, 3].map((i) => (
                <TableRow key={i} className="table-row">
                  <TableCell className="table-cell-py px-table w-10">
                    <div className="w-9 h-9 rounded-lg bg-[#E4E7EC] animate-pulse" />
                  </TableCell>
                  <TableCell className="table-cell-py px-table">
                    <div className="h-3.5 w-44 rounded bg-[#E4E7EC] animate-pulse" />
                  </TableCell>
                  <TableCell className="table-cell-py px-table">
                    <div className="h-3.5 w-28 rounded bg-[#E4E7EC] animate-pulse" />
                  </TableCell>
                  <TableCell className="table-cell-py px-table">
                    <div className="h-3.5 w-24 rounded bg-[#E4E7EC] animate-pulse" />
                  </TableCell>
                  <TableCell className="table-cell-py px-table">
                    <div className="h-5 w-14 rounded-md bg-[#E4E7EC] animate-pulse" />
                  </TableCell>
                  <TableCell className="table-cell-py px-table">
                    <div className="h-7 w-22 rounded-lg bg-[#E4E7EC] animate-pulse" />
                  </TableCell>
                  <TableCell className="table-cell-py px-table">
                    <div className="h-8 w-8 rounded-lg bg-[#E4E7EC] animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : notes.length > 0 ? (
              notes.map((note) => {
                const qa = getQuestionCount(note);

                return (
                  <TableRow key={note._id} className="table-row">
                    {/* File icon */}
                    <TableCell className="table-cell-py px-table w-10">
                      <FileTypeIcon fileType={note.fileType} title={note.title} />
                    </TableCell>
                    {/* Name */}
                    <TableCell className="table-cell-py px-table">
                      <span className="table-file-name">{note.title}</span>
                    </TableCell>
                    {/* Subject */}
                    <TableCell className="table-cell-py px-table table-subject">
                      {note.subject}
                    </TableCell>
                    {/* Date */}
                    <TableCell className="table-cell-py px-table table-date">
                      {formatDate(note.createdAt)}
                    </TableCell>
                    {/* Q&A */}
                    <TableCell className="table-cell-py px-table table-qa">
                      {qa} Q&A
                    </TableCell>
                    {/* View Results */}
                    <TableCell className="table-cell-py px-table">
                        <Button variant="outline" className="btn-results" asChild>
                        <Link href={`/dashboard/notes/${note._id}`}>
                          View Results
                        </Link>
                      </Button>
                    </TableCell>
                    {/* More */}
                    <TableCell className="table-cell-py px-table text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="btn-icon">
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
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="table-row">
                <TableCell colSpan={7} className="py-10 text-center">
                  <p className="text-[13.5px] font-semibold text-gray-700">
                    {hasSearch ? "No notes matched your search." : "No study notes generated yet."}
                  </p>
                  <p className="mt-1 text-[12.5px] text-gray-400">
                    {hasSearch
                      ? "Try a different title or subject."
                      : "Upload your first PDF or image to begin."}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Note Cards (mobile) ── */}
      <div className="lg:hidden space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
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
          ))
        ) : notes.length > 0 ? (
          notes.map((note) => {
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
                      <button className="btn-icon shrink-0" aria-label="More options">
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
          })
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
      </div>

      {/* View all */}
      <Link href={viewAllHref} className="table-view-all">
        {hasSearch ? `View all results for "${debouncedSearch.trim()}"` : "View all notes"}
        <ArrowRight size={15} strokeWidth={2} />
      </Link>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  return (
    <main className="main-container font-jakarta">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-0">
        {/* ── HERO ── */}
        <div className="hero-section flex items-center justify-between gap-8 lg:gap-0">
          {/* Left */}
          <div className="hero-left flex-1 max-w-none lg:max-w-md">
            <h1 className="hero-title text-[24px] lg:text-[26px] font-bold text-gray-900 leading-tight mb-1">
              Turn Your Notes into
              <span className="hero-title-accent text-violet-600 block lg:inline">
                Exam-Ready Answers in Seconds
              </span>
            </h1>
            <p className="hero-description text-[13px] text-[#344054] leading-relaxed my-2.5 mb-5 max-w-none lg:max-w-85">
              Upload your class notes, and our AI will generate important
              questions, short answers, and quick revision notes for you.
            </p>

            {/* Buttons */}
            <div className="hero-buttons flex items-center gap-2 mb-5 lg:mb-5">
              <Link href="/dashboard/generate">
                <Button className="btn-primary-violet">
                  <Upload size={14} strokeWidth={2.5} />
                  Upload Notes
                </Button>
              </Link>
              <a href="https://youtu.be/KVHHEDiFjCc" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="btn-secondary-outline">
                  <div className="btn-play">
                    <Play
                      size={8}
                      className="fill-violet-600 text-violet-600"
                      stroke="none"
                    />
                  </div>
                  How it Works
                </Button>
              </a>
            </div>

            {/* Badges */}
            <div className="hero-badges flex items-center gap-3 lg:gap-5">
              {[
                {
                  icon: <Zap size={9} className="text-violet-600" strokeWidth={2.5} />,
                  label: "Instant Results",
                },
                {
                  icon: <Sun size={9} className="text-violet-600" strokeWidth={2.5} />,
                  label: "AI-Powered",
                },
                {
                  icon: <User size={9} className="text-violet-600" strokeWidth={2.5} />,
                  label: "Exam Focused",
                },
              ].map(({ icon, label }) => (
                <div key={label} className="hero-badge-item flex items-center gap-1.5 text-[11px] lg:text-xs text-[#344054] font-medium whitespace-nowrap">
                  <div className="hero-badge-icon w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center">{icon}</div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div className="hero-illustration shrink-0 w-full lg:w-auto">
            <div className="w-full max-w-[332px] mx-auto lg:mx-0">
              <HeroIllustration />
            </div>
          </div>
        </div>

        {/* ── MY NOTES ── */}
        <MyNotesSection />
      </div>
    </main>
  );
}