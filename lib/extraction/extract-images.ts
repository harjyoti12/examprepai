interface ExtractedPage {
  page: number;
  text: string;
}

/**
 * Image OCR is currently disabled. Image notes are preserved as direct URLs
 * for future multimodal AI processing instead of text extraction.
 */
export async function extractImagesText(
  imageUrls: string[]
): Promise<ExtractedPage[]> {
  // Image OCR is currently disabled.
  // Image notes are stored by URL and handled by future multimodal AI processing.
  return imageUrls.map((_, index) => ({
    page: index + 1,
    text: "",
  }));
}
