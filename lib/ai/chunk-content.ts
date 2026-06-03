export interface ExtractedPageChunk {
  page: number;
  text: string;
}

const MAX_CHUNK_LENGTH = 3200;

function splitTextIntoSegments(text: string, maxLength: number): string[] {
  const segments: string[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let endIndex = Math.min(cursor + maxLength, text.length);
    let segment = text.slice(cursor, endIndex);

    if (endIndex < text.length) {
      const lastBreak = Math.max(segment.lastIndexOf("\n"), segment.lastIndexOf(" "));
      if (lastBreak > 0) {
        segment = segment.slice(0, lastBreak);
        endIndex = cursor + lastBreak;
      }
    }

    segments.push(segment.trim());
    cursor = endIndex;
  }

  return segments.filter((segment) => segment.length > 0);
}

export function chunkExtractedContent(
  extractedContent: ExtractedPageChunk[],
  maxChunkLength = MAX_CHUNK_LENGTH,
): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  for (const page of extractedContent) {
    const pageHeader = `Page ${page.page}:\n`;
    const pageBody = `${pageHeader}${page.text.trim()}\n\n`;

    if (pageBody.length > maxChunkLength) {
      if (currentChunk.trim().length) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      const overflowSegments = splitTextIntoSegments(pageBody, maxChunkLength);
      for (const segment of overflowSegments) {
        chunks.push(segment);
      }
      continue;
    }

    if (currentChunk.length + pageBody.length > maxChunkLength) {
      chunks.push(currentChunk.trim());
      currentChunk = pageBody;
      continue;
    }

    currentChunk += pageBody;
  }

  if (currentChunk.trim().length) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
