import { Router, Response } from 'express';
import Document from '../models/Document';
import QAHistory from '../models/QAHistory';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { answerDocumentQuestion } from '../services/claudeService';
import { SAMPLE_DOCUMENTS } from '../services/sampleDocs';

const router = Router();
const inMemoryQAArray: any[] = [];

// POST /api/qa/ask
router.post('/ask', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ error: 'documentId and question are required' });
    }

    let doc: any = null;
    try {
      doc = await Document.findById(documentId);
    } catch (err) {}

    if (!doc) {
      const sample = SAMPLE_DOCUMENTS.find(s => s._id === documentId);
      if (sample) doc = sample;
    }

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { answer, sourceChunkIds } = await answerDocumentQuestion(doc.chunks || [], question);

    let qaItem: any = null;
    try {
      qaItem = await QAHistory.create({
        documentId: doc._id,
        question,
        answer,
        sourceChunkIds,
        askedAt: new Date()
      });
    } catch (dbErr) {
      qaItem = {
        _id: 'qa_' + Date.now(),
        documentId: doc._id,
        question,
        answer,
        sourceChunkIds,
        askedAt: new Date()
      };
      inMemoryQAArray.push(qaItem);
    }

    return res.status(201).json({ qa: qaItem });
  } catch (error: any) {
    console.error('Q&A route error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process question' });
  }
});

// GET /api/qa/:documentId (Get QA history for document)
router.get('/:documentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    let qaHistory: any[] = [];

    try {
      qaHistory = await QAHistory.find({ documentId }).sort({ askedAt: 1 });
    } catch (err) {
      qaHistory = inMemoryQAArray.filter(q => q.documentId.toString() === documentId.toString());
    }

    return res.json({ history: qaHistory });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch Q&A history' });
  }
});

export default router;
