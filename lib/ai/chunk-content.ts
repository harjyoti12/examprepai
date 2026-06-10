export interface ExtractedPageChunk {
  page: number;
  text: string;
}

export interface NoteChunkInput {
  chunkIndex: number;
  pageStart: number;
  pageEnd: number;
  content: string;
  wordCount: number;
}

const MAX_WORDS_PER_CHUNK = 1500;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getPageRange(chunkContent: string): { pageStart: number; pageEnd: number } {
  const pageNumbers = Array.from(chunkContent.matchAll(/Page (\d+):/g), (match) =>
    Number(match[1])
  ).filter(Number.isFinite);

  if (pageNumbers.length === 0) {
    return {
      pageStart: 0,
      pageEnd: 0,
    };
  }

  return {
    pageStart: Math.min(...pageNumbers),
    pageEnd: Math.max(...pageNumbers),
  };
}

function splitTextIntoWordSegments(text: string, maxWords: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const segments: string[] = [];

  for (let startIndex = 0; startIndex < words.length; startIndex += maxWords) {
    segments.push(words.slice(startIndex, startIndex + maxWords).join(" "));
  }

  return segments;
}

export function chunkExtractedContent(
  extractedContent: ExtractedPageChunk[],
  maxWordsPerChunk = MAX_WORDS_PER_CHUNK,
): string[] {
  const chunks: string[] = [];
  let currentChunk = "";
  let currentWordCount = 0;

  for (const page of extractedContent) {
    const pageHeader = `Page ${page.page}:\n`;
    const pageBody = `${pageHeader}${page.text.trim()}\n\n`;
    const pageWordCount = countWords(pageBody);

    if (pageWordCount > maxWordsPerChunk) {
      if (currentChunk.trim().length) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
        currentWordCount = 0;
      }

      const overflowSegments = splitTextIntoWordSegments(page.text.trim(), maxWordsPerChunk);
      for (const segment of overflowSegments) {
        chunks.push(`${pageHeader}${segment}`.trim());
      }
      continue;
    }

    if (currentWordCount > 0 && currentWordCount + pageWordCount > maxWordsPerChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = pageBody;
      currentWordCount = pageWordCount;
      continue;
    }

    currentChunk += pageBody;
    currentWordCount += pageWordCount;
  }

  if (currentChunk.trim().length) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export function createNoteChunksFromPages(
  extractedContent: ExtractedPageChunk[],
  maxWordsPerChunk = MAX_WORDS_PER_CHUNK,
): NoteChunkInput[] {
  return chunkExtractedContent(extractedContent, maxWordsPerChunk).map((content, chunkIndex) => {
    const { pageStart, pageEnd } = getPageRange(content);

    return {
      chunkIndex,
      pageStart,
      pageEnd,
      content,
      wordCount: countWords(content),
    };
  });
}
