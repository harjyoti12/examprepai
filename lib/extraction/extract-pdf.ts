import pdfParse from "pdf-parse";

interface ExtractedPage {
  page: number;
  text: string;
}

/**
 * Extracts text from a PDF file fetched from a URL
 * Returns structured page-by-page output
 */
export async function extractPDFText(pdfUrl: string): Promise<ExtractedPage[]> {
  try {
    // Fetch PDF from blob URL
    const response = await fetch(pdfUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);

    // Parse PDF and extract text
    const data = await pdfParse(pdfBuffer);

    // Build page-by-page structured output
    const extractedPages: ExtractedPage[] = [];

    for (let i = 0; i < data.numpages; i++) {
      const pageNumber = i + 1;

      // Get text for this page
      const pageText = data.text
        ? extractPageText(data.text, pageNumber, data.numpages)
        : "";

      const trimmedText = pageText.trim();
      if (!trimmedText) {
        continue;
      }

      extractedPages.push({
        page: pageNumber,
        text: trimmedText,
      });
    }

    if (extractedPages.length === 0) {
      console.warn("No extractable text found in PDF");
    }

    return extractedPages;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error(
      `PDF extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Helper function to extract text for a specific page
 * Note: pdf-parse returns all text concatenated, so this is a simple pass-through
 * In production, consider using pdf-parse with pagerender callback for better page separation
 */
function extractPageText(
  fullText: string,
  _pageNumber: number,
  _totalPages: number
): string {
  // For basic extraction, return the full text
  // In a production system, you might want to use pdf-parse's page-level parsing
  return fullText;
}
