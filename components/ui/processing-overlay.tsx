"use client"

import { useEffect, useState, useRef } from "react"
import { CheckCircle2, Loader2, XCircle, FileText, FileImage, FileSearch, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProcessingStatus } from "@/hooks/use-note-status"

export type ProcessingPhase = "preparing" | "uploading" | "processing" | "completed" | "failed"

interface StepDef {
  id: string
  label: string
}

const STEPS: StepDef[] = [
  { id: "preparing", label: "Preparing Your Notes" },
  { id: "uploading", label: "Uploading Files" },
  { id: "reading",   label: "Reading Your Notes" },
  { id: "checking",  label: "Checking Credits" },
  { id: "generating",label: "Generating Study Material" },
  { id: "finishing", label: "Finishing Up" },
]

const DESCRIPTIONS: Record<string, string> = {
  preparing: "Setting up your files...",
  uploading: "Uploading your files to secure storage...",
  reading: "Extracting text from your files...",
  checking: "Analyzing your upload to calculate credits...",
  generating: "AI is generating your study material...",
  finishing: "Finalizing your generated content...",
}

export interface CreditAnalysis {
  fileType: string | null
  isScannedPdf: boolean
  totalPages: number
  totalChunks: number
  requiredCredits: number
  remainingCredits: number
}

interface ProcessingOverlayProps {
  phase: ProcessingPhase
  status: ProcessingStatus | null
  fileType: string | null
  error: string | null
  errorCode?: string | null
  errorDetails?: Record<string, unknown> | null
  creditAnalysis?: CreditAnalysis | null
  isPro?: boolean
  onCancel: () => void
  onRetryUpload: () => void
  onRetry: () => void
  onComplete: () => void
}

function StepIcon({ state }: { state: "completed" | "active" | "pending" | "failed" }) {
  if (state === "completed") {
    return <CheckCircle2 size={22} className="text-emerald-500" strokeWidth={2} />
  }
  if (state === "active") {
    return (
      <span className="flex h-[22px] w-[22px] items-center justify-center">
        <Loader2 size={20} className="text-[#6D42F5] animate-spin" strokeWidth={2.5} />
      </span>
    )
  }
  if (state === "failed") {
    return <XCircle size={22} className="text-red-500" strokeWidth={2} />
  }
  return (
    <span className="flex h-[22px] w-[22px] items-center justify-center">
      <span className="h-[10px] w-[10px] rounded-full border-2 border-gray-300" />
    </span>
  )
}

function getActiveStepIndex(phase: ProcessingPhase, status: ProcessingStatus | null, creditStepDone: boolean): number {
  if (phase === "preparing") return 0
  if (phase === "uploading") return 1
  if (phase === "processing") {
    if (!status || status === "uploaded" || status === "extracting") return 2
    if (status === "processing") return creditStepDone ? 4 : 3
    if (status === "completed") return 5
    return 2
  }
  if (phase === "completed") return 5
  return 0
}

function CreditAnalysisCard({ analysis }: { analysis: CreditAnalysis }) {
  const { fileType, isScannedPdf, totalPages, totalChunks, requiredCredits, remainingCredits } = analysis

  if (fileType === "pdf" && !isScannedPdf) {
    return (
      <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4 text-[13px]">
        <div className="flex items-center gap-2 font-semibold text-violet-800">
          <FileText size={16} />
          Searchable PDF Detected
        </div>
        <div className="mt-3 space-y-1.5 text-gray-600">
          <div className="flex justify-between"><span>Chunks</span><span className="font-semibold text-gray-800">{totalChunks}</span></div>
          <div className="flex justify-between"><span>Required Credits</span><span className="font-semibold text-gray-800">{requiredCredits}</span></div>
          <div className="flex justify-between"><span>Remaining Credits</span><span className="font-semibold text-gray-800">{remainingCredits}</span></div>
        </div>
      </div>
    )
  }

  if (fileType === "pdf" && isScannedPdf) {
    return (
      <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4 text-[13px]">
        <div className="flex items-center gap-2 font-semibold text-violet-800">
          <FileSearch size={16} />
          Scanned PDF Detected
        </div>
        <div className="mt-3 space-y-1.5 text-gray-600">
          <div className="flex justify-between"><span>Pages</span><span className="font-semibold text-gray-800">{totalPages}</span></div>
          <div className="flex justify-between"><span>Required Credits</span><span className="font-semibold text-gray-800">{requiredCredits}</span></div>
          <div className="flex justify-between"><span>Remaining Credits</span><span className="font-semibold text-gray-800">{remainingCredits}</span></div>
        </div>
      </div>
    )
  }

  if (fileType === "image") {
    return (
      <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4 text-[13px]">
        <div className="flex items-center gap-2 font-semibold text-violet-800">
          <FileImage size={16} />
          Images Detected
        </div>
        <div className="mt-3 space-y-1.5 text-gray-600">
          <div className="flex justify-between"><span>Images</span><span className="font-semibold text-gray-800">{totalPages}</span></div>
          <div className="flex justify-between"><span>Required Credits</span><span className="font-semibold text-gray-800">{requiredCredits}</span></div>
          <div className="flex justify-between"><span>Remaining Credits</span><span className="font-semibold text-gray-800">{remainingCredits}</span></div>
        </div>
      </div>
    )
  }

  return null
}

function ErrorCard({
  errorCode,
  errorDetails,
  creditAnalysis,
  isPro,
  onCancel,
  onRetryUpload,
}: {
  errorCode: string | null | undefined
  errorDetails?: Record<string, unknown> | null
  creditAnalysis?: CreditAnalysis | null
  isPro?: boolean
  onCancel: () => void
  onRetryUpload: () => void
}) {
  // -- INSUFFICIENT_CREDITS --
  if (errorCode === "INSUFFICIENT_CREDITS") {
    const required = (errorDetails?.requiredCredits ?? creditAnalysis?.requiredCredits) as number | undefined
    const remaining = (errorDetails?.remainingCredits ?? creditAnalysis?.remainingCredits) as number | undefined

    return (
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
        <AlertTriangle size={24} className="mx-auto mb-2 text-amber-500" />
        <h3 className="text-[15px] font-bold text-amber-900">
          {isPro ? "Monthly Credit Limit Reached" : "Not Enough Credits"}
        </h3>
        <div className="mt-4 space-y-1.5 text-[13px] text-amber-800 text-left max-w-60 mx-auto">
          <div className="flex justify-between">
            <span>This upload requires</span>
            <span className="font-semibold">{required ?? "?"} Credits</span>
          </div>
          <div className="flex justify-between">
            <span>You currently have</span>
            <span className="font-semibold">{remaining ?? "?"} Credits</span>
          </div>
        </div>
        {isPro ? (
          <>
            <p className="mt-3 text-[12px] text-amber-700 leading-relaxed">
              Your monthly AI credits have been exhausted. Renew your Pro subscription to continue.
            </p>
            <div className="mt-4 flex gap-3 justify-center">
              <Button
                onClick={onCancel}
                variant="outline"
                size="lg"
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const clerk = (window as any).Clerk
                  if (clerk?.billing?.getSubscription) {
                    clerk.billing.getSubscription({}).then((sub: any) => {
                      sub?.manage?.()
                    })
                  }
                }}
                size="lg"
                className="rounded-xl bg-[#6D42F5] font-bold text-white hover:bg-[#5B32E0]"
              >
                Manage Subscription
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-[12px] text-amber-700 leading-relaxed">
              Upgrade to Pro to receive
            </p>
            <ul className="mt-1 text-[12px] text-emerald-700 text-left max-w-52 mx-auto space-y-0.5">
              <li className="flex items-center gap-1.5">✓ 100 Monthly AI Credits</li>
              <li className="flex items-center gap-1.5">✓ 20 MB PDF Uploads</li>
              <li className="flex items-center gap-1.5">✓ 5 Image Uploads</li>
            </ul>
            <div className="mt-4 flex gap-3 justify-center">
              <Button
                onClick={onCancel}
                variant="outline"
                size="lg"
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={() => { window.location.href = "/dashboard/pricing" }}
                size="lg"
                className="rounded-xl bg-[#6D42F5] font-bold text-white hover:bg-[#5B32E0]"
              >
                Upgrade to Pro
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }

  // -- PDF_SIZE_EXCEEDED --
  if (errorCode === "PDF_SIZE_EXCEEDED") {
    const maxSize = errorDetails?.maxSizeMB as number | undefined
    const actualSize = errorDetails?.actualSizeMB as number | undefined

    return (
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
        <AlertTriangle size={24} className="mx-auto mb-2 text-amber-500" />
        <h3 className="text-[15px] font-bold text-amber-900">File Too Large</h3>
        <div className="mt-4 space-y-1.5 text-[13px] text-amber-800 text-left max-w-60 mx-auto">
          <div className="flex justify-between">
            <span>Your current plan allows PDFs up to</span>
            <span className="font-semibold">{maxSize ?? "?"} MB</span>
          </div>
          <div className="flex justify-between">
            <span>Selected file</span>
            <span className="font-semibold">{actualSize ?? "?"} MB</span>
          </div>
        </div>
        {isPro ? (
          <div className="mt-4">
            <Button
              onClick={onCancel}
              size="lg"
              className="rounded-xl bg-[#6D42F5] font-bold text-white hover:bg-[#5B32E0]"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-3 text-[12px] text-amber-700 leading-relaxed">
              Upgrade to Pro to upload PDFs up to 20 MB.
            </p>
            <div className="mt-4 flex gap-3 justify-center">
              <Button
                onClick={onCancel}
                variant="outline"
                size="lg"
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={() => { window.location.href = "/dashboard/pricing" }}
                size="lg"
                className="rounded-xl bg-[#6D42F5] font-bold text-white hover:bg-[#5B32E0]"
              >
                Upgrade to Pro
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }

  // -- IMAGE_COUNT_EXCEEDED --
  if (errorCode === "IMAGE_COUNT_EXCEEDED") {
    const maxImages = errorDetails?.maxImages as number | undefined
    const actualCount = errorDetails?.actualCount as number | undefined

    return (
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
        <AlertTriangle size={24} className="mx-auto mb-2 text-amber-500" />
        <h3 className="text-[15px] font-bold text-amber-900">Too Many Images</h3>
        <div className="mt-4 space-y-1.5 text-[13px] text-amber-800 text-left max-w-60 mx-auto">
          <div className="flex justify-between">
            <span>Your current plan supports</span>
            <span className="font-semibold">{maxImages ?? "?"} Images</span>
          </div>
          <div className="flex justify-between">
            <span>You selected</span>
            <span className="font-semibold">{actualCount ?? "?"} Images</span>
          </div>
        </div>
        {isPro ? (
          <div className="mt-4">
            <Button
              onClick={onCancel}
              size="lg"
              className="rounded-xl bg-[#6D42F5] font-bold text-white hover:bg-[#5B32E0]"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-3 text-[12px] text-amber-700 leading-relaxed">
              Upgrade to Pro for up to 5 images.
            </p>
            <div className="mt-4 flex gap-3 justify-center">
              <Button
                onClick={onCancel}
                variant="outline"
                size="lg"
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={() => { window.location.href = "/dashboard/pricing" }}
                size="lg"
                className="rounded-xl bg-[#6D42F5] font-bold text-white hover:bg-[#5B32E0]"
              >
                Upgrade to Pro
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }

  // -- GENERATION_FAILED --
  if (errorCode === "GENERATION_FAILED") {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-center">
        <AlertTriangle size={24} className="mx-auto mb-2 text-red-500" />
        <h3 className="text-[15px] font-bold text-red-900">Generation Failed</h3>
        <p className="mt-2 text-[13px] text-red-700 leading-relaxed">
          We couldn&apos;t generate study material this time. No credits were deducted. Please try again.
        </p>
        <div className="mt-4 flex gap-3 justify-center">
          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            className="rounded-xl font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={onRetryUpload}
            size="lg"
            className="rounded-xl bg-[#6D42F5] font-bold text-white hover:bg-[#5B32E0]"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // -- UNKNOWN_ERROR --
  if (errorCode === "UNKNOWN_ERROR") {
    return (
      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
        <AlertTriangle size={24} className="mx-auto mb-2 text-gray-400" />
        <h3 className="text-[15px] font-bold text-gray-900">Something Went Wrong</h3>
        <p className="mt-2 text-[13px] text-gray-600 leading-relaxed">
          An unexpected error occurred. No credits were deducted. Please try again.
        </p>
        <div className="mt-4">
          <Button
            onClick={onRetryUpload}
            size="lg"
            className="rounded-xl bg-[#6D42F5] font-bold text-white hover:bg-[#5B32E0]"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return null
}

export function ProcessingOverlay({
  phase,
  status,
  fileType,
  error,
  errorCode,
  errorDetails,
  creditAnalysis,
  isPro,
  onCancel,
  onRetryUpload,
  onRetry,
  onComplete,
}: ProcessingOverlayProps) {
  const [visible, setVisible] = useState(false)
  const [creditStepDone, setCreditStepDone] = useState(false)
  const creditTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // Credit step timer: after ~1.5s in checking step, transition to generating
  // Stops and stays on checking step if credits are insufficient
  useEffect(() => {
    if (phase === "processing" && status === "processing" && !creditStepDone && !creditTimerRef.current) {
      // Do NOT auto-advance if credits are insufficient
      if (creditAnalysis && creditAnalysis.requiredCredits > creditAnalysis.remainingCredits) {
        return
      }
      creditTimerRef.current = setTimeout(() => {
        setCreditStepDone(true)
        creditTimerRef.current = null
      }, 1500)
    }
    return () => {
      if (creditTimerRef.current) {
        clearTimeout(creditTimerRef.current)
        creditTimerRef.current = null
      }
    }
  }, [phase, status, creditStepDone, creditAnalysis])

  // Reset credit step when a new upload starts
  useEffect(() => {
    if (phase === "preparing") {
      setCreditStepDone(false)
    }
  }, [phase])

  // Completed timer: navigate on completion
  useEffect(() => {
    if (phase === "completed" && !completedTimerRef.current) {
      completedTimerRef.current = setTimeout(() => {
        onComplete()
      }, 600)
    }
    return () => {
      if (completedTimerRef.current) {
        clearTimeout(completedTimerRef.current)
        completedTimerRef.current = null
      }
    }
  }, [phase, onComplete])

  const activeIndex = getActiveStepIndex(phase, status, creditStepDone)
  const isFailed = phase === "failed"

  // Use failureReason from processing as the effective error code if none set
  const effectiveErrorCode = errorCode

  const isCheckingCredit = phase === "processing" && status === "processing" && !creditStepDone
  const insufficientCredits = isCheckingCredit && creditAnalysis && creditAnalysis.requiredCredits > creditAnalysis.remainingCredits
  const showCreditCard = isCheckingCredit && creditAnalysis

  const currentDescription = (() => {
    if (isFailed || insufficientCredits) {
      if (effectiveErrorCode === "INSUFFICIENT_CREDITS" || effectiveErrorCode === "PDF_SIZE_EXCEEDED" || effectiveErrorCode === "IMAGE_COUNT_EXCEEDED" || effectiveErrorCode === "GENERATION_FAILED" || effectiveErrorCode === "UNKNOWN_ERROR" || insufficientCredits) {
        return ""
      }
      return error || "Upload failed. Please try again."
    }
    if (phase === "processing" && status === "processing" && !creditStepDone) {
      return "Checking your available credits..."
    }
    return DESCRIPTIONS[STEPS[activeIndex]?.id] ?? "Processing..."
  })()

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          {/* Progress bar */}
          <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${
                isFailed || insufficientCredits
                  ? "w-full bg-red-400"
                  : phase === "completed"
                    ? "w-full bg-emerald-400"
                    : "w-1/2 bg-[#6D42F5]"
              } ${!isFailed && !insufficientCredits && phase !== "completed" ? "animate-[indeterminate_2s_ease-in-out_infinite]" : "transition-all duration-500"}`}
            />
          </div>

          {/* Header */}
          <p className="mt-6 text-[15px] font-semibold text-gray-800">
            {isFailed || insufficientCredits ? "Upload failed" : phase === "completed" ? "Complete" : "Processing your upload..."}
          </p>
          {currentDescription && (
            <p className="mt-1 text-[13px] font-medium text-gray-400">{currentDescription}</p>
          )}

          {/* Credit analysis card (only when checking, not when insufficient) */}
          {showCreditCard && !insufficientCredits && <CreditAnalysisCard analysis={creditAnalysis} />}

          {/* Steps list */}
          <div className="mt-7 space-y-1">
            {STEPS.map((step, i) => {
              let state: "completed" | "active" | "pending" | "failed"

              if (isFailed) {
                if (i < activeIndex) state = "completed"
                else if (i === activeIndex && !effectiveErrorCode) state = "failed"
                else state = "pending"
              } else if (insufficientCredits && i === 3) {
                state = "failed"
              } else if (i < activeIndex) {
                state = "completed"
              } else if (i === activeIndex) {
                state = "active"
              } else {
                state = "pending"
              }

              return (
                <div key={step.id} className="flex items-center gap-3 py-2">
                  <StepIcon state={state} />
                  <span
                    className={`text-[13px] transition-colors duration-300 ${
                      state === "completed"
                        ? "text-gray-800"
                        : state === "active"
                          ? "font-semibold text-[#6D42F5]"
                          : state === "failed"
                            ? "text-red-500"
                            : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Error card — shown on failed phase OR on checking step when credits insufficient */}
          {(isFailed || insufficientCredits) && (
            <ErrorCard
              errorCode={effectiveErrorCode || "INSUFFICIENT_CREDITS"}
              errorDetails={errorDetails}
              creditAnalysis={creditAnalysis}
              isPro={isPro}
              onCancel={onCancel}
              onRetryUpload={onRetryUpload}
            />
          )}

          {/* Generic retry button (only for truly unknown failures without error code) */}
          {isFailed && !effectiveErrorCode && !insufficientCredits && (
            <div className="mt-6">
              <Button
                onClick={onRetry}
                size="lg"
                className="w-full rounded-xl bg-[#6D42F5] font-bold text-white hover:bg-[#5B32E0]"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Credits available confirmation */}
          {phase === "processing" && status === "processing" && creditStepDone && creditAnalysis && creditAnalysis.requiredCredits <= creditAnalysis.remainingCredits && (
            <div className="mt-4 flex items-center gap-2 justify-center text-[13px] font-semibold text-emerald-600">
              <CheckCircle2 size={16} />
              Credits Available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
