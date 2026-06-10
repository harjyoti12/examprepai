import pdfParse from "pdf-parse";

interface ExtractedPage {
  page: number;
  text: string;
}

interface PdfTextItem {
  str: string;
  transform?: number[];
}

interface PdfPageData {
  getTextContent(options: {
    normalizeWhitespace: boolean;
    disableCombineTextItems: boolean;
  }): Promise<{ items: PdfTextItem[] }>;
}

/**
 * Extracts text from a PDF file fetched from a URL
 * Returns real page-by-page output, with each page captured from its own render pass.
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

    const extractedPages: ExtractedPage[] = [];
    let currentPageNumber = 0;

    await pdfParse(pdfBuffer, {
      pagerender: async (pageData: PdfPageData) => {
        currentPageNumber += 1;
        const pageNumber = currentPageNumber;
        const textContent = await pageData.getTextContent({
          normalizeWhitespace: false,
          disableCombineTextItems: false,
        });

        let lastY: number | undefined;
        let text = "";

        for (const item of textContent.items) {
          const currentY = item.transform?.[5];
          text += lastY === currentY || lastY === undefined ? item.str : `\n${item.str}`;
          lastY = currentY;
        }

        const trimmedText = text.trim();
        extractedPages.push({
          page: pageNumber,
          text: trimmedText,
        });

        return trimmedText;
      },
    });

    extractedPages.sort((firstPage, secondPage) => firstPage.page - secondPage.page);

    if (extractedPages.length === 0 || extractedPages.every((page) => !page.text)) {
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
