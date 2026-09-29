import { Router, Response } from 'express';
import Document from '../models/Document';
import Summary, { SummaryModeType } from '../models/Summary';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { generateDocumentSummary } from '../services/claudeService';
import { SAMPLE_DOCUMENTS } from '../services/sampleDocs';

const router = Router();
const inMemorySummariesMap = new Map<string, any>();

// POST /api/summaries/generate
router.post('/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { documentId, mode } = req.body;
    const summaryMode: SummaryModeType = mode || 'detailed';

    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required' });
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

    // Call Claude API service with anti-hallucination verification
    const summaryResult = await generateDocumentSummary(doc.chunks || [], summaryMode);

    let savedSummary: any = null;
    try {
      savedSummary = await Summary.create({
        documentId: doc._id,
        mode: summaryMode,
        facts: summaryResult.facts,
        generatedAt: new Date()
      });
    } catch (dbErr) {
      savedSummary = {
        _id: 'sum_' + Date.now(),
        documentId: doc._id,
        mode: summaryMode,
        facts: summaryResult.facts,
        generatedAt: new Date()
      };
      inMemorySummariesMap.set(`${documentId}_${summaryMode}`, savedSummary);
    }

    return res.json({
      summary: savedSummary,
      meta: {
        antiHallucinationVerified: summaryResult.antiHallucinationVerified,
        totalFactsFound: summaryResult.totalFactsFound,
        rejectedFactsCount: summaryResult.rejectedFactsCount
      }
    });
  } catch (error: any) {
    console.error('Summary generation route error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
});

// GET /api/summaries/:documentId
router.get('/:documentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const mode = (req.query.mode as SummaryModeType) || 'detailed';

    let summary: any = null;
    try {
      summary = await Summary.findOne({ documentId, mode }).sort({ generatedAt: -1 });
      if (!summary) {
        summary = await Summary.findOne({ documentId }).sort({ generatedAt: -1 });
      }
    } catch (err) {
      summary = inMemorySummariesMap.get(`${documentId}_${mode}`);
    }

    if (!summary) {
      // Auto-generate if not found
      let doc: any = null;
      try {
        doc = await Document.findById(documentId);
      } catch (err) {}

      if (!doc) {
        const sample = SAMPLE_DOCUMENTS.find(s => s._id === documentId);
        if (sample) doc = sample;
      }

      if (doc) {
        const summaryResult = await generateDocumentSummary(doc.chunks || [], mode);
        summary = {
          _id: 'sum_' + Date.now(),
          documentId,
          mode,
          facts: summaryResult.facts,
          generatedAt: new Date()
        };
      }
    }

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found for this document' });
    }

    return res.json({ summary });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
