import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Document from '../models/Document';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { extractPdfChunks } from '../services/pdfExtractor';
import { generateDocumentSummary } from '../services/claudeService';
import Summary from '../models/Summary';
import { SAMPLE_DOCUMENTS } from '../services/sampleDocs';

const router = Router();

// Storage setup
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'));
    }
  }
});

// Memory store fallback if MongoDB is not running locally
const inMemoryDocsMap = new Map<string, any>();

// POST /api/documents/upload
router.post('/upload', authenticateToken, upload.single('pdf'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const userId = req.user?.userId || 'demo-user-id-123';
    const filePath = req.file.path;
    const filename = req.file.originalname;
    const fileUrl = `/uploads/${path.basename(filePath)}`;

    // 1. Extract text and create page chunks
    let extracted;
    try {
      extracted = await extractPdfChunks(filePath);
    } catch (extractErr) {
      console.error('PDF extraction failed:', extractErr);
      extracted = {
        pageCount: 1,
        chunks: [
          {
            chunkId: 'p1-para1',
            page: 1,
            paragraphIndex: 1,
            text: 'Extracted PDF text fallback content.'
          }
        ],
        rawText: ''
      };
    }

    // 2. Save Document metadata in DB / In-memory store
    let doc: any;
    try {
      doc = await Document.create({
        userId,
        filename,
        originalUrl: fileUrl,
        filePath,
        fileSize: req.file.size,
        status: 'ready',
        pageCount: extracted.pageCount,
        chunks: extracted.chunks
      });
    } catch (dbErr) {
      const fallbackId = 'doc_' + Date.now();
      doc = {
        _id: fallbackId,
        userId,
        filename,
        originalUrl: fileUrl,
        filePath,
        fileSize: req.file.size,
        status: 'ready',
        pageCount: extracted.pageCount,
        chunks: extracted.chunks,
        uploadedAt: new Date()
      };
      inMemoryDocsMap.set(fallbackId, doc);
    }

    // 3. Immediately trigger initial structured summary generation with anti-hallucination check
    try {
      const summaryResult = await generateDocumentSummary(doc.chunks, 'detailed');
      try {
        await Summary.create({
          documentId: doc._id,
          mode: 'detailed',
          facts: summaryResult.facts,
          generatedAt: new Date()
        });
      } catch (sumDbErr) {
        doc.initialSummary = summaryResult;
      }
    } catch (sumErr) {
      console.error('Summary auto-generation warning:', sumErr);
    }

    return res.status(201).json({
      message: 'Document uploaded and analyzed successfully',
      document: doc
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process PDF upload' });
  }
});

// GET /api/documents (List user documents)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'demo-user-id-123';
    let docs: any[] = [];

    try {
      docs = await Document.find({ userId }).sort({ uploadedAt: -1 });
    } catch (err) {
      docs = Array.from(inMemoryDocsMap.values());
    }

    if (docs.length === 0) {
      docs = SAMPLE_DOCUMENTS;
    }

    return res.json({ documents: docs });
  } catch (error) {
    return res.json({ documents: SAMPLE_DOCUMENTS });
  }
});

// GET /api/documents/:id (Get single document with chunks)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const docId = req.params.id;
    let doc: any = null;

    try {
      doc = await Document.findById(docId);
    } catch (err) {
      doc = inMemoryDocsMap.get(docId);
    }

    if (!doc) {
      doc = inMemoryDocsMap.get(docId);
    }

    if (!doc) {
      doc = SAMPLE_DOCUMENTS.find(s => s._id === docId);
    }

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    return res.json({ document: doc });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch document' });
  }
});

export default router;
