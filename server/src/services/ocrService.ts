import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';

let cachedWorker: any = null;

async function getOcrWorker() {
  if (!cachedWorker) {
    try {
      const worker = await createWorker('eng');
      cachedWorker = worker;
    } catch (e) {
      console.warn('Tesseract worker initialization notice:', e);
    }
  }
  return cachedWorker;
}

export async function performOcrOnBuffer(imageBuffer: Buffer): Promise<string> {
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('Empty image buffer provided for OCR processing.');
  }

  try {
    const worker = await createWorker('eng');
    const ret = await worker.recognize(imageBuffer);
    await worker.terminate();
    return ret.data.text || '';
  } catch (error: any) {
    console.error('OCR recognition error:', error);
    throw new Error(`OCR processing failed: ${error.message || 'Unable to recognize text from image'}`);
  }
}

export async function performOcrOnFile(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Document file not found at path: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.webp', '.bmp'].includes(ext)) {
    const buffer = fs.readFileSync(filePath);
    return await performOcrOnBuffer(buffer);
  }

  // If plain text file
  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  return '';
}
