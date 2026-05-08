'use client'

import { Search, Upload, Play, Zap, Sun, User, SlidersHorizontal, ArrowRight, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

const notes = [
  { name: 'Thermodynamics Notes.pdf',         type: 'pdf',  subject: 'Physics',           date: 'May 25, 2024', qa: 25,  color: 'bg-red-100 text-red-600' },
  { name: 'Organic Chemistry - Short Notes.jpg', type: 'jpg', subject: 'Chemistry',        date: 'May 24, 2024', qa: 18,  color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Indian Polity Complete Notes.pdf',  type: 'pdf',  subject: 'Political Science', date: 'May 23, 2024', qa: 30,  color: 'bg-red-100 text-red-600' },
  { name: 'Business Studies Important Topics.pdf', type: 'pdf', subject: 'Business Studies', date: 'May 22, 2024', qa: 22, color: 'bg-amber-100 text-amber-600' },
  { name: 'Biology Diagrams and Notes.png',    type: 'png',  subject: 'Biology',           date: 'May 21, 2024', qa: 15,  color: 'bg-pink-100 text-pink-600' },
]

function HeroIllustration() {
  return (
    <div className="relative">
      <svg width="250" height="200" viewBox="0 0 250 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Folder */}
        <rect x="37.5" y="55" width="175" height="105" rx="12.5" fill="#C4B5FD"/>
        <path d="M37.5 67.5 Q37.5 55 50 55 L112.5 55 Q122.5 55 127.5 65 L137.5 77.5 L212.5 77.5 Q225 77.5 225 87.5 L225 160 Q225 160 212.5 160 L50 160 Q37.5 160 37.5 147.5 Z" fill="#7C3AED"/>
        {/* Paper */}
        <rect x="62.5" y="32.5" width="125" height="115" rx="10" fill="white" opacity="0.95"/>
        <rect x="77.5" y="52.5" width="95" height="5" rx="2.5" fill="#E5E7EB"/>
        <rect x="77.5" y="67.5" width="80" height="5" rx="2.5" fill="#E5E7EB"/>
        <rect x="77.5" y="82.5" width="85" height="5" rx="2.5" fill="#E5E7EB"/>
        <rect x="77.5" y="97.5" width="65" height="5" rx="2.5" fill="#E5E7EB"/>
        {/* Graduation cap */}
        <polygon points="125,95 100,110 125,125 150,110" fill="#1F2937"/>
        <rect x="122.5" y="110" width="7.5" height="20" fill="#1F2937"/>
        <circle cx="122.5" cy="130" r="6.25" fill="#1F2937"/>
        <line x1="150" y1="110" x2="156.25" y2="127.5" stroke="#D97706" strokeWidth="2.5"/>
        <circle cx="156.25" cy="130" r="3.75" fill="#D97706"/>
        {/* Sparkles */}
        <text x="35" y="82.5" fontSize="18.75" fill="#FBBF24">✦</text>
        <text x="187.5" y="55" fontSize="12.5" fill="#FBBF24">✦</text>
        <text x="200" y="117.5" fontSize="10" fill="#C4B5FD">✦</text>
        <text x="47.5" y="147.5" fontSize="8.75" fill="#C4B5FD">✦</text>
      </svg>
      {/* Floating mini cards */}
      <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-md p-2 border border-gray-200">
        <div className="text-xs font-semibold text-purple-600">25 Questions Generated</div>
      </div>
      <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-md p-2 border border-gray-200">
        <div className="text-xs font-semibold text-green-600">Ready in 15s</div>
      </div>
    </div>
  )
}

export function DashboardHome() {
  return (
    <main className="main-container font-jakarta">
      <div className="max-w-350 mx-auto">
        {/* ── HERO ── */}
        <div className="hero-section">
          {/* Left */}
          <div className="hero-left">
            <h1 className="hero-title">
              Turn Your Notes into
              <span className="hero-title-accent">
                Exam-Ready Answers in Seconds
              </span>
            </h1>
            <p className="hero-description">
              Upload your class notes, and our AI will generate important questions,
              short answers, and quick revision notes for you.
            </p>

            {/* Buttons */}
            <div className="hero-buttons">
              <Button className="btn-primary-violet">
                <Upload size={14} strokeWidth={2.5} />
                Upload Notes
              </Button>
              <Button
                variant="outline"
                className="btn-secondary-outline"
              >
                <div className="btn-play">
                  <Play size={8} className="fill-violet-600 text-violet-600" stroke="none" />
                </div>
                How it Works
              </Button>
            </div>

            {/* Badges */}
            <div className="hero-badges">
              {[
                { icon: <Zap size={9} className="text-violet-600" strokeWidth={2.5}/>, label: 'Instant Results' },
                { icon: <Sun size={9} className="text-violet-600" strokeWidth={2.5}/>,  label: 'AI-Powered' },
                { icon: <User size={9} className="text-violet-600" strokeWidth={2.5}/>, label: 'Exam Focused' },
              ].map(({ icon, label }) => (
                <div key={label} className="hero-badge-item">
                  <div className="hero-badge-icon">
                    {icon}
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div className="hero-illustration">
            <HeroIllustration />
          </div>
        </div>

      {/* ── MY NOTES ── */}
      <div className="section-container">
        {/* Section header */}
        <div className="section-header">
          <div>
            <h2 className="section-title">
              My Notes
            </h2>
            <p className="section-description">
              Your previously uploaded notes and generated documents
            </p>
          </div>
          <div className="section-controls">
            {/* Search */}
            <div className="search-wrapper">
              <Search size={13} strokeWidth={2} className="search-icon" />
              <Input
                placeholder="Search your notes..."
                className="input-search"
              />
            </div>
            {/* Filter */}
            <Button
              variant="outline"
              className="btn-filter"
              onClick={() => console.log('Filter clicked')}
            >
              <SlidersHorizontal size={13} strokeWidth={2} />
              Filter
            </Button>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableBody>
            {notes.map((note, i) => (
              <TableRow key={i} className="table-row">
                {/* File icon */}
                <TableCell className="table-cell-py px-table w-10">
                  <div className={`table-file-icon ${note.color}`}>
                    {note.type.toUpperCase()}
                  </div>
                </TableCell>
                {/* Name */}
                <TableCell className="table-cell-py px-table">
                  <span className="table-file-name">
                    {note.name}
                  </span>
                </TableCell>
                {/* Subject */}
                <TableCell className="table-cell-py px-table table-subject">
                  {note.subject}
                </TableCell>
                {/* Date */}
                <TableCell className="table-cell-py px-table table-date">
                  {note.date}
                </TableCell>
                {/* Q&A */}
                <TableCell className="table-cell-py px-table table-qa">
                  {note.qa} Q&A
                </TableCell>
                {/* View Results */}
                <TableCell className="table-cell-py px-table">
                  <Button
                    variant="outline"
                    className="btn-results"
                  >
                    View Results
                  </Button>
                </TableCell>
                {/* More */}
                <TableCell className="table-cell-py px-table text-center">
                  <button className="btn-icon">
                    <MoreVertical size={16} strokeWidth={1.8} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* View all */}
        <div className="table-view-all">
          View all notes
          <ArrowRight size={15} strokeWidth={2} />
        </div>
      </div>
      </div>
    </main>
  )
}

export default DashboardHome;