'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  BookOpen,
  CloudUpload,
  FileImage,
  FileText,
  Lock,
  X,
  Zap,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  noteUploadSchema,
  type NoteUploadInput,
} from '@/lib/validations/note'
import { useRouter } from 'next/navigation'
import { ProcessingOverlay } from '@/components/ui/processing-overlay'
import type { ProcessingPhase } from '@/components/ui/processing-overlay'
import type { CreditAnalysis } from '@/components/ui/processing-overlay'
import { useNoteStatus } from '@/hooks/use-note-status'
import { useUserPlan } from '@/hooks/use-user-plan'
import { calculateRequiredCredits } from '@/lib/business/calculate-required-credits'

interface UploadedFile {
  id: string
  name: string
  size: string
  type: 'PDF' | 'JPG' | 'PNG'
  file: File
}



const MAX_FILE_SIZE = 60 * 1024 * 1024

const FILE_STYLES: Record<string, { bg: string; color: string; icon: typeof FileText }> = {
  PDF: { bg: '#EDE8FF', color: '#7C3AED', icon: FileText },
  JPG: { bg: '#D1FAE5', color: '#059669', icon: FileImage },
  PNG: { bg: '#FFE4F0', color: '#E11D75', icon: FileImage },
}

function formatFileSize(size: number) {
  if (size <= 0) return '0 KB'
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function getDisplayType(file: File): UploadedFile['type'] {
  if (file.type === 'application/pdf') return 'PDF'
  if (file.type === 'image/png') return 'PNG'
  return 'JPG'
}

function toUploadedFile(file: File): UploadedFile {
  return {
    id: `${file.name}-${file.lastModified}-${file.size}`,
    name: file.name,
    size: formatFileSize(file.size),
    type: getDisplayType(file),
    file,
  }
}

function HeaderIllustration() {
  return (
    <div
      aria-hidden
      className="generate-notes-header-illustration pointer-events-none absolute right-0 top-0 flex h-full items-center pr-2"
      style={{ width: 440 }}
    >
       <svg width="380" height="124" viewBox="0 0 256 83" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="256" y2="83" gradientUnits="userSpaceOnUse">
      <stop offset="0%"  stopColor="#EBE5FD"/>
      <stop offset="100%" stopColor="#F5F4FE"/>
    </linearGradient>
    <linearGradient id="folderBack" x1="37" y1="29" x2="150" y2="46" gradientUnits="userSpaceOnUse">
      <stop offset="0%"  stopColor="#C0AEF8"/>
      <stop offset="60%" stopColor="#9E85EF"/>
      <stop offset="100%" stopColor="#9078EC"/>
    </linearGradient>
    <linearGradient id="folderFront" x1="60" y1="42" x2="168" y2="83" gradientUnits="userSpaceOnUse">
      <stop offset="0%"  stopColor="#C8B8F7"/>
      <stop offset="50%" stopColor="#DAD1F9"/>
      <stop offset="100%" stopColor="#EDE7FD"/>
    </linearGradient>
    <linearGradient id="cloudPurple" x1="116" y1="18" x2="140" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0%"  stopColor="#7B5CF2"/>
      <stop offset="100%" stopColor="#5438E6"/>
    </linearGradient>
    <filter id="cloudShadow">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#B8A4F6" floodOpacity="0.4"/>
    </filter>
    <filter id="folderShadow">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#9B82EE" floodOpacity="0.22"/>
    </filter>
  </defs>

 
  <rect width="256" height="83" fill="url(#bg)"/>

  
  <path d="M12 53 Q13.5 59 19 61.5 Q13.5 64 12 70 Q10.5 64 5 61.5 Q10.5 59 12 53Z"
        fill="white" opacity="0.95"/>

 
  <path d="M165 24 Q166.5 28.5 171 30.5 Q166.5 32.5 165 37 Q163.5 32.5 159 30.5 Q163.5 28.5 165 24Z"
        fill="#FDCA40"/>

  
  <path d="M218 47 Q221 55.5 229 58.5 Q221 61.5 218 70 Q215 61.5 207 58.5 Q215 55.5 218 47Z"
        fill="#FDCA40"/>

  
  <path d="M242 44 Q243.2 48 247 49.5 Q243.2 51 242 55 Q240.8 51 237 49.5 Q240.8 48 242 44Z"
        fill="white" opacity="0.92"/>

  <g filter="url(#folderShadow)">
    <path d="M38 33 C38 33 38 29.5 42 29.5 L70 29.5 C74 29.5 76 31 77.5 33 Z" fill="#C4B3F8"/>
    <rect x="38" y="33" width="112" height="13" rx="2.5" fill="url(#folderBack)"/>
  </g>


  <g filter="url(#folderShadow)">
    <path d="M61 45 C61 43.3 62.3 42 64 42 L94 42 C96.2 42 98 43.1 99.2 44.8
             L102.5 49.5 C103.7 51.2 105.5 52.2 107.5 52.2 L163 52.2
             C164.7 52.2 166 53.5 166 55.2 L166 79.5
             C166 81.2 164.7 82.5 163 82.5 L64 82.5
             C62.3 82.5 61 81.2 61 79.5 Z"
          fill="url(#folderFront)"/>
  </g>

 
  <g filter="url(#cloudShadow)">
    <path d="M113 42 L113 36.5 C113 33.8 111 32 108.5 32 C106 32 104 33.8 104 36.5
             C104 37 104.1 37.5 104.3 37.9 C103.2 38.5 102.5 39.6 102.5 40.9
             C102.5 43 104.2 44.7 106.3 44.7 L147.5 44.7
             C149.2 44.7 150.5 43.4 150.5 41.7 C150.5 40.3 149.6 39.1 148.3 38.6
             C148.4 38.2 148.5 37.8 148.5 37.3 C148.5 34.5 146.2 32.3 143.5 32.3
             C141.8 32.3 140.3 33.1 139.3 34.4 C137.8 29.8 133.5 26.5 128.3 26.5
             C122 26.5 117 31.2 116.2 37.2 C115 36.8 113.8 37.4 113 38.3 Z"
          fill="white"/>
  </g>


  <circle cx="128" cy="36" r="9.5" fill="url(#cloudPurple)"/>
  <line x1="128" y1="31.5" x2="128" y2="38.5" stroke="white" strokeWidth="1.7" strokeLinecap="round"/>
  <polyline points="124.8,34.5 128,31 131.2,34.5" stroke="white" strokeWidth="1.7"
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  <line x1="124.5" y1="39.5" x2="131.5" y2="39.5" stroke="white" strokeWidth="1.7" strokeLinecap="round"/>
</svg>
    </div>
  )
}

export default function GenerateNotesUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [processingNoteId, setProcessingNoteId] = useState<string | null>(null)
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase | null>(null)
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [processingErrorCode, setProcessingErrorCode] = useState<string | null>(null)
  const [processingErrorDetails, setProcessingErrorDetails] = useState<Record<string, unknown> | null>(null)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: userPlan } = useUserPlan()

  const { status, creditsUsed, fileType, totalPages, totalChunks, failureReason } = useNoteStatus(processingNoteId || '')

  // Derive credit analysis from polling data + user plan
  const creditAnalysis = useMemo<CreditAnalysis | null>(() => {
    if (!fileType || !userPlan || !processingNoteId) return null
    if (fileType === "pdf") {
      const isScanned = (totalChunks ?? 0) === 0 && (totalPages ?? 0) > 0
      const required = calculateRequiredCredits({
        fileType: "pdf",
        chunkCount: isScanned ? undefined : totalChunks,
        pageCount: isScanned ? totalPages : undefined,
      })
      return {
        fileType,
        isScannedPdf: isScanned,
        totalPages: totalPages ?? 0,
        totalChunks: totalChunks ?? 0,
        requiredCredits: required,
        remainingCredits: userPlan.remainingCredits,
      }
    }
    if (fileType === "image") {
      const required = calculateRequiredCredits({
        fileType: "image",
        imageCount: totalPages ?? 0,
      })
      return {
        fileType,
        isScannedPdf: false,
        totalPages: totalPages ?? 0,
        totalChunks: 0,
        requiredCredits: required,
        remainingCredits: userPlan.remainingCredits,
      }
    }
    return null
  }, [fileType, totalPages, totalChunks, userPlan, processingNoteId])

  const prevStatusRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!processingPhase || !status) return

    if (status === "completed" && prevStatusRef.current !== "completed") {
      queryClient.invalidateQueries({ queryKey: ["user-plan"] })

      if (creditsUsed && creditsUsed > 0) {
        toast.success(`Study material generated successfully.`)
      }
    }

    if (processingPhase === "preparing" || processingPhase === "uploading") {
      if (status === "completed") {
        setProcessingPhase("completed")
      }
      else if (status === "failed") {
        setProcessingPhase("failed")
        setProcessingError("Processing failed. Please try again.")
        setProcessingErrorCode(failureReason || null)
        setProcessingErrorDetails(null)
      } else if (status !== "uploaded") {
        setProcessingPhase("processing")
      }
      prevStatusRef.current = status
      return
    }
    if (status === "completed") {
      setProcessingPhase("completed")
    }
    else if (status === "failed") {
      setProcessingPhase("failed")
      setProcessingError("Processing failed. Please try again.")
      setProcessingErrorCode(failureReason || null)
      setProcessingErrorDetails(null)
    }
    prevStatusRef.current = status
  }, [status, processingPhase, creditsUsed, failureReason, queryClient])
  const {
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
    trigger,
  } = useForm<NoteUploadInput>({
    resolver: zodResolver(noteUploadSchema as any),
    defaultValues: {
      title: '',
      subject: '',
      files: [],
    },
  })

  const syncFiles = useCallback(
    (nextFiles: UploadedFile[]) => {
      setFiles(nextFiles)
      setValue(
        'files',
        nextFiles.map(file => file.file),
        { shouldDirty: true, shouldValidate: true },
      )
    },
    [setValue],
  )

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      setSubmitError('')
      const incomingFiles = Array.from(fileList)
      const allowedFiles = incomingFiles.filter(file => file.size <= MAX_FILE_SIZE)

      if (allowedFiles.length !== incomingFiles.length) {
        setSubmitError('Some files exceed the 60 MB limit and were not added.')
      }

      if (allowedFiles.length === 0) {
        syncFiles([])
        return
      }

      const isPdf = allowedFiles[0].type === 'application/pdf'

      if (userPlan) {
        if (isPdf) {
          const fileSizeMB = allowedFiles[0].size / (1024 * 1024)
          if (fileSizeMB > userPlan.maxPdfSizeMB) {
            setSubmitError(
              `PDF exceeds your plan limit. PDFs up to ${userPlan.maxPdfSizeMB} MB are allowed.`,
            )
            syncFiles([])
            return
          }
        } else {
          if (allowedFiles.length > userPlan.maxImages) {
            setSubmitError(
              `Your plan allows up to ${userPlan.maxImages} images per upload.`,
            )
            syncFiles([])
            return
          }
        }
      }

      syncFiles(allowedFiles.map(toUploadedFile))
    },
    [syncFiles, userPlan],
  )

  const removeFile = (id: string) => {
    syncFiles(files.filter(f => f.id !== id))
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setDragging(false), [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  // Returns to upload form — keeps selected files
  const handleCancel = useCallback(() => {
    setProcessingPhase(null)
    setProcessingNoteId(null)
    setProcessingError(null)
    setProcessingErrorCode(null)
    setProcessingErrorDetails(null)
    setSubmitError('')
  }, [])

  // Re-submits the current form — does NOT clear files
  const handleRetryUpload = () => {
    if (processingNoteId) {
      fetch(`/api/notes/${processingNoteId}`, { method: "DELETE" }).catch(() => {})
    }
    setProcessingNoteId(null)
    setProcessingError(null)
    setProcessingErrorCode(null)
    setProcessingErrorDetails(null)
    const currentValues = getValues()
    onSubmit(currentValues as NoteUploadInput)
  }

  const handleRetry = useCallback(async () => {
    const failedNoteId = processingNoteId;
    setProcessingPhase(null)
    setProcessingNoteId(null)
    setProcessingError(null)
    setProcessingErrorCode(null)
    setProcessingErrorDetails(null)
    setSubmitError('')
    if (failedNoteId) {
      try {
        await fetch(`/api/notes/${failedNoteId}`, { method: "DELETE" });
      } catch {
        // Cleanup is best-effort
      }
    }
  }, [processingNoteId])

  const handleComplete = useCallback(() => {
    if (processingNoteId) {
      const targetUrl = `/dashboard/notes/${processingNoteId}`;
      router.push(targetUrl);
    }
  }, [processingNoteId, router])

  const onSubmit = async (values: NoteUploadInput) => {
    setSubmitError('')
    setProcessingPhase("preparing")
    setProcessingError(null)

    await new Promise((resolve) => setTimeout(resolve, 0))

    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('subject', values.subject)
    values.files.forEach(file => formData.append('files', file))

    setProcessingPhase("uploading")

    const response = await fetch('/api/notes/upload', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    const noteId = result?.note?._id
    
    if (!response.ok) {
      setProcessingPhase("failed")
      setProcessingError(result.error || 'Upload failed. Please try again.')
      setProcessingErrorCode(result.errorCode || null)
      setProcessingErrorDetails(result.errorDetails || null)
      return
    }

    setProcessingNoteId(noteId)
  }

  const totalSize = files.reduce((total, file) => total + file.file.size, 0)

  return (
    <div className="generate-notes-wrapper min-h-screen bg-[#EDEDF8] p-6 font-(family-name:--font-jakarta,'Plus_Jakarta_Sans','DM_Sans',sans-serif)">
      <div className="mx-auto max-w-245">
        <div className="rounded-2xl bg-white overflow-hidden shadow-[0_2px_16px_rgba(99,56,238,0.07)]">
          <div
            className="generate-notes-header relative overflow-hidden px-10 py-9 min-h-44.5 flex items-start"
            style={{
              background: 'linear-gradient(110deg, #EEEAFA 0%, #EAE5F8 50%, #F5F3FF 100%)',
            }}
          >
            <div className="relative z-10 max-w-115">
              <h1
                className="generate-notes-title text-[28px] font-extrabold text-[#111827] leading-tight mb-2.5"
                style={{ letterSpacing: '-0.02em' }}
              >
                Generate Exam Notes
              </h1>
              <p className="generate-notes-description text-[14px] text-[#5C6A85] leading-[1.65] font-medium">
                Upload your notes and our AI will generate important questions,<br />
                short answers, and quick revision notes.
              </p>
            </div>

            <HeaderIllustration />
          </div>

          {processingPhase ? (
            <div className="generate-notes-processing px-10 py-12 min-h-100 flex flex-col items-center justify-center">
              <ProcessingOverlay
                phase={processingPhase}
                status={status ?? null}
                fileType={fileType ?? null}
                error={processingError}
                errorCode={processingErrorCode}
                errorDetails={processingErrorDetails}
                creditAnalysis={creditAnalysis}
                isPro={userPlan?.isPro ?? false}
                onCancel={handleCancel}
                onRetryUpload={handleRetryUpload}
                onRetry={handleRetry}
                onComplete={handleComplete}
              />
            </div>
          ) : (
            <form className="generate-notes-form px-10 py-8" onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-7 max-w-140">
                <label
                  htmlFor="title"
                  className="block mb-2 text-[13px] font-extrabold text-[#111827]"
                >
                  Title
                </label>

                <div className="flex h-10 items-center gap-2.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5">
                  <FileText size={14} className="text-[#9CA3AF] shrink-0" />
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter note title"
                    className="h-auto border-0 p-0 text-[13px] font-medium text-[#374151] shadow-none placeholder:text-[#9CA3AF] focus-visible:ring-0"
                  />
                </div>

                {errors.title && (
                  <p className="mt-1.5 text-[12px] font-semibold text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="mb-7 max-w-140">
                <label
                  htmlFor="subject"
                  className="block mb-2 text-[13px] font-extrabold text-[#111827]"
                >
                  Subject
                </label>

                <div className="flex h-10 items-center gap-2.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5">
                  <BookOpen size={14} className="text-[#9CA3AF] shrink-0" />
                  <Input
                    id="subject"
                    {...register('subject')}
                    placeholder="Enter subject name (e.g., Thermodynamics, Organic Chemistry..."
                    className="h-auto border-0 p-0 text-[13px] font-medium text-[#374151] shadow-none placeholder:text-[#9CA3AF] focus-visible:ring-0"
                  />
                </div>

                {errors.subject ? (
                  <p className="mt-1.5 text-[12px] font-semibold text-red-500">
                    {errors.subject.message}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[12px] font-medium text-[#9CA3AF]">
                    Helps you search and organize your notes easily.
                  </p>
                )}
              </div>

              <p className="mb-3 text-[13px] font-extrabold text-[#111827]">
                Upload Notes
              </p>

              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                  'generate-notes-dropzone mb-6 flex h-49 flex-col items-center justify-center rounded-xl transition-colors',
                  dragging
                    ? 'border-2 border-[#7C3AED] bg-[#EDE9FE]'
                    : 'border-[1.8px] border-dashed border-[#7C3AED] bg-[#F5F3FF]',
                )}
              >
                <div className="generate-notes-dropzone-icon mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F3FF]">
                  <CloudUpload
                    size={48}
                    className="text-[#6D28D9]"
                    strokeWidth={1.2}
                  />
                </div>
                <p className="text-[14px] font-extrabold text-[#111827]">
                  Drag &amp; drop your files here
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 bg-transparent border-0 p-0 text-[13px] font-bold text-[#6D28D9] cursor-pointer hover:underline"
                >
                  or browse to upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="application/pdf,image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      addFiles(e.target.files)
                      void trigger('files')
                    }
                  }}
                />
                <p className="mt-3 text-[12px] font-medium text-[#9CA3AF]">
                  Supports PDF, JPG, JPEG, PNG (Multiple files allowed)
                </p>
              </div>

              {errors.files && (
                <p className="-mt-3 mb-4 text-[12px] font-semibold text-red-500">
                  {errors.files.message}
                </p>
              )}

              <div className="mb-3 flex items-center justify-between generate-notes-file-header">
                <span className="text-[13px] font-bold text-[#374151]">
                  Uploaded Files{' '}
                  <span className="text-[#6B7280] font-semibold">({files.length})</span>
                </span>
                <span className="text-[12.5px] font-semibold text-[#6B7280]">
                  Total size:{' '}
                  <span className="text-[#6D28D9] font-bold">{formatFileSize(totalSize)}</span>
                </span>
              </div>

              <div className="mb-7">
                {files.map((file, idx) => {
                  const style = FILE_STYLES[file.type]
                  const Icon = style.icon
                  return (
                    <div
                      key={file.id}
                      className={cn(
                        'generate-notes-file-row flex h-13 items-center justify-between px-1',
                        idx < files.length - 1 && 'border-b border-[#F3F4F6]',
                      )}
                    >
                      <div className="generate-notes-file-info flex items-center gap-3 min-w-0">
                        <div
                          className="generate-notes-file-icon flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg gap-0.5"
                          style={{ background: style.bg, color: style.color }}
                        >
                          <Icon size={12} strokeWidth={2.5} />
                          <span
                            style={{
                              fontSize: '6px',
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                              lineHeight: 1,
                            }}
                          >
                            {file.type}
                          </span>
                        </div>
                        <span className="truncate text-[13.5px] font-semibold text-[#1F2937]">
                          {file.name}
                        </span>
                      </div>

                      <div className="generate-notes-file-gap flex items-center gap-8 shrink-0 ml-4">
                        <span className="generate-notes-file-size text-[13px] font-medium text-[#9CA3AF] min-w-13 text-right">
                          {file.size}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="flex items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X size={15} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="generate-notes-submit h-13.5 w-full gap-2.5 rounded-xl border-0 text-[15px] font-extrabold text-white shadow-none transition-colors hover:opacity-90"
                style={{ background: '#5B21B6' }}
              >
                <Zap size={16} fill="white" strokeWidth={0} />
                {isSubmitting ? 'Uploading Notes...' : 'Generate Exam Notes'}
              </Button>

              {submitError && (
                <p className="mt-3 text-center text-[12px] font-semibold text-red-500">
                  {submitError}
                </p>
              )}

              <p className="generate-notes-privacy mt-3 flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#9CA3AF]">
                <Lock size={12} strokeWidth={2.2} />
                Your files are secure and private. They will only be used to generate your results.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
