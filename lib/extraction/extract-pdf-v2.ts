import pdfParse from "pdf-parse";

interface ExtractedPage {
  page: number;
  text: string;
}

/**
 * Extracts text from a PDF file fetched from a URL
 * Returns structured page-by-page output using pdf-parse's pagerender callback
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

    // Collect per-page text using pdf-parse's pagerender option
    const pagesText: string[] = [];

    await pdfParse(pdfBuffer, {
      pagerender: (pageData) =>
        pageData.getTextContent().then((textContent: any) => {
          const pageText = (textContent.items || [])
            .map((item: any) => (typeof item.str === "string" ? item.str : ""))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

          pagesText.push(pageText);
          return pageText;
        }),
    });

    const extractedPages: ExtractedPage[] = [];

    for (let i = 0; i < pagesText.length; i++) {
      const pageNumber = i + 1;
      const trimmedText = (pagesText[i] || "").trim();
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
