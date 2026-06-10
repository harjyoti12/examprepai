'use client'

import { useCallback, useRef, useState } from 'react'
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
      className="pointer-events-none absolute right-0 top-0 h-full"
      style={{ width: 340 }}
    >
      <span
        className="absolute font-black text-[#F9C529] select-none"
        style={{ right: 28, top: 28, fontSize: 38, lineHeight: 1 }}
      >*</span>

      <span
        className="absolute font-black text-[#A78BFA] select-none"
        style={{ right: 248, top: 72, fontSize: 20, lineHeight: 1 }}
      >+</span>

      <span
        className="absolute font-black text-[#A78BFA] select-none"
        style={{ right: 278, top: 118, fontSize: 16, lineHeight: 1 }}
      >+</span>

      <div
        className="absolute rounded-full bg-[#C4B5FD] opacity-60"
        style={{ right: 230, top: 60, width: 18, height: 18 }}
      />

      <div
        className="absolute rounded-xl bg-white border border-[#DDD6FE]"
        style={{
          right: 110,
          top: 32,
          width: 130,
          height: 100,
          transform: 'rotate(-6deg)',
          boxShadow: '0 8px 24px rgba(109,61,242,0.10)',
        }}
      />

      <div
        className="absolute rounded-t-xl bg-[#EDE9FE]"
        style={{ right: 78, top: 58, width: 60, height: 22 }}
      />

      <div
        className="absolute rounded-b-xl rounded-tr-xl bg-[#C4B5FD]"
        style={{
          right: 68,
          top: 72,
          width: 148,
          height: 78,
          clipPath: 'polygon(0 22%, 35% 22%, 43% 0, 100% 0, 100% 100%, 0 100%)',
        }}
      />

      <div
        className="absolute flex items-center justify-center rounded-full bg-white"
        style={{
          right: 148,
          top: 24,
          width: 58,
          height: 58,
          boxShadow: '0 8px 24px rgba(109,61,242,0.22)',
        }}
      >
        <CloudUpload size={28} className="text-[#6D28D9]" fill="#6D28D9" strokeWidth={0} />
      </div>

      <div
        className="absolute rounded-lg bg-[#6D28D9]"
        style={{
          right: 70,
          top: 86,
          width: 30,
          height: 50,
          transform: 'skewX(7deg)',
        }}
      />
    </div>
  )
}

export default function GenerateNotesUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
const router = useRouter();
  const {
    formState: { errors, isSubmitting },
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
      setSubmitSuccess('')
      const incomingFiles = Array.from(fileList)
      const allowedFiles = incomingFiles.filter(file => file.size <= MAX_FILE_SIZE)

      if (allowedFiles.length !== incomingFiles.length) {
        setSubmitError('Some files exceed the 60 MB limit and were not added.')
      }

      syncFiles(allowedFiles.map(toUploadedFile))
    },
    [syncFiles],
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

  const onSubmit = async (values: NoteUploadInput) => {
    setSubmitError('')
    setSubmitSuccess('')

    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('subject', values.subject)
    values.files.forEach(file => formData.append('files', file))

    const response = await fetch('/api/notes/upload', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
const noteId = result?.note?._id
    if (!response.ok) {
      setSubmitError(result.error || 'Upload failed. Please try again.')
      return
    }

    reset()
    syncFiles([])
    setSubmitSuccess('Note uploaded successfully.')
    router.push(`/dashboard/notes/${noteId}`)
  }

  const totalSize = files.reduce((total, file) => total + file.file.size, 0)

  return (
    <div className="min-h-screen bg-[#EDEDF8] p-6 font-[family-name:var(--font-jakarta,_'Plus_Jakarta_Sans',_'DM_Sans',_sans-serif)]">
      <div className="mx-auto max-w-[980px]">
        <div className="rounded-2xl bg-white overflow-hidden shadow-[0_2px_16px_rgba(99,56,238,0.07)]">
          <div
            className="relative overflow-hidden px-10 py-9 min-h-[178px] flex items-start"
            style={{
              background: 'linear-gradient(110deg, #EEEAFA 0%, #EAE5F8 50%, #F5F3FF 100%)',
            }}
          >
            <div className="relative z-10 max-w-[460px]">
              <h1
                className="text-[28px] font-extrabold text-[#111827] leading-tight mb-2.5"
                style={{ letterSpacing: '-0.02em' }}
              >
                Generate Exam Notes
              </h1>
              <p className="text-[14px] text-[#5C6A85] leading-[1.65] font-medium">
                Upload your notes and our AI will generate important questions,<br />
                short answers, and quick revision notes.
              </p>
            </div>

            <HeaderIllustration />
          </div>

          <form className="px-10 py-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-7 max-w-[560px]">
              <label
                htmlFor="title"
                className="block mb-2 text-[13px] font-extrabold text-[#111827]"
              >
                Title
              </label>

              <div className="flex h-[40px] items-center gap-2.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5">
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

            <div className="mb-7 max-w-[560px]">
              <label
                htmlFor="subject"
                className="block mb-2 text-[13px] font-extrabold text-[#111827]"
              >
                Subject
              </label>

              <div className="flex h-[40px] items-center gap-2.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5">
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
                'mb-6 flex h-[196px] flex-col items-center justify-center rounded-xl transition-colors',
                dragging
                  ? 'border-2 border-[#7C3AED] bg-[#EDE9FE]'
                  : 'border-[1.8px] border-dashed border-[#7C3AED] bg-[#F5F3FF]',
              )}
            >
              <div className="mb-3 flex h-[64px] w-[64px] items-center justify-center rounded-full">
                <CloudUpload
                  size={52}
                  className="text-[#6D28D9]"
                  fill="#6D28D9"
                  strokeWidth={0}
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

            <div className="mb-3 flex items-center justify-between">
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
                      'flex h-[52px] items-center justify-between px-1',
                      idx < files.length - 1 && 'border-b border-[#F3F4F6]',
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-[36px] w-[36px] shrink-0 flex-col items-center justify-center rounded-lg gap-[2px]"
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

                    <div className="flex items-center gap-8 shrink-0 ml-4">
                      <span className="text-[13px] font-medium text-[#9CA3AF] min-w-[52px] text-right">
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
              className="h-[54px] w-full gap-2.5 rounded-xl border-0 text-[15px] font-extrabold text-white shadow-none transition-colors hover:opacity-90"
              style={{ background: '#5B21B6' }}
            >
              <Zap size={16} fill="white" strokeWidth={0} />
              {isSubmitting ? 'Uploading Notes...' : 'Generate Exam Notes'}
            </Button>

            {(submitError || submitSuccess) && (
              <p
                className={cn(
                  'mt-3 text-center text-[12px] font-semibold',
                  submitError ? 'text-red-500' : 'text-emerald-600',
                )}
              >
                {submitError || submitSuccess}
              </p>
            )}

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#9CA3AF]">
              <Lock size={12} strokeWidth={2.2} />
              Your files are secure and private. They will only be used to generate your results.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
