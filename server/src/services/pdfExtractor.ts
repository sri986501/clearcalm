import pdfParse from 'pdf-parse';
import fs from 'fs';
import { IDocChunk } from '../models/Document';

export interface ExtractionResult {
  pageCount: number;
  chunks: IDocChunk[];
  rawText: string;
}

export async function extractPdfChunks(filePath: string): Promise<ExtractionResult> {
  const dataBuffer = fs.readFileSync(filePath);

  const pageTexts: string[] = [];

  // Define custom render options to capture page boundaries
  const options = {
    pagerender: function (pageData: any) {
      return pageData.getTextContent().then(function (textContent: any) {
        let lastY, text = '';
        for (let item of textContent.items) {
          if (lastY == item.transform[5] || !lastY) {
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }
        pageTexts.push(text);
        return text;
      });
    }
  };

  const pdfData = await pdfParse(dataBuffer, options);
  const totalPages = pdfData.numpages || pageTexts.length || 1;
  const chunks: IDocChunk[] = [];

  let chunkCounter = 0;

  // Process pages
  const actualPages = pageTexts.length > 0 ? pageTexts : [pdfData.text];

  actualPages.forEach((pageContent, pageIdx) => {
    const pageNum = pageIdx + 1;
    // Split page content into paragraphs
    const paragraphs = pageContent
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 15); // Filter out tiny header noise

    if (paragraphs.length === 0 && pageContent.trim().length > 0) {
      paragraphs.push(pageContent.trim());
    }

    paragraphs.forEach((paraText, paraIdx) => {
      chunkCounter++;
      const chunkId = `p${pageNum}-para${paraIdx + 1}`;
      chunks.push({
        chunkId,
        page: pageNum,
        paragraphIndex: paraIdx + 1,
        text: paraText
      });
    });
  });

  // If no chunks generated (e.g. scanned image PDF or blank), return single dummy chunk to trigger OCR fallback if needed
  if (chunks.length === 0) {
    chunks.push({
      chunkId: 'p1-para1',
      page: 1,
      paragraphIndex: 1,
      text: pdfData.text.trim() || 'Scanned or unreadable document content.'
    });
  }

  return {
    pageCount: totalPages,
    chunks,
    rawText: pdfData.text
  };
}
