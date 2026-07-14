export interface CreditCalcInput {
  fileType: "pdf" | "image";
  chunkCount?: number;
  pageCount?: number;
  imageCount?: number;
}

export function calculateRequiredCredits(input: CreditCalcInput): number {
  if (input.fileType === "pdf") {
    if (input.chunkCount !== undefined) {
      return input.chunkCount;
    }

    if (input.pageCount !== undefined) {
      return Math.max(1, input.pageCount);
    }

    return 1;
  }

  if (input.imageCount !== undefined) {
    return input.imageCount;
  }

  return 1;
}
