import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import crypto from 'crypto';
import ClaimAssistance from '../models/ClaimAssistance';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { dbStore } from '../services/store';

const router = Router();

// Upload destination for supporting claim documents
const claimUploadsDir = path.join(__dirname, '../../uploads/claims');
if (!fs.existsSync(claimUploadsDir)) {
  fs.mkdirSync(claimUploadsDir, { recursive: true });
}

const claimStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, claimUploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
  }
});

const claimUpload = multer({
  storage: claimStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format for claim documents.'));
    }
  }
});

// In-memory fallback for claims
const claimsMemStore: Map<string, any> = new Map();

function generateClaimId(): string {
  const num = crypto.randomInt(100000, 999999);
  return `CLM-${num}`;
}

// ─── POST /api/claims — Submit Claim Assistance Request ───────────────────────
router.post('/', authenticateToken, claimUpload.array('supportingDocuments', 5), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'demo-user-id-123';
    const {
      insuranceCompany, policyNumber, policyType,
      fullName, email, phone, claimType, dateOfIncident,
      description, preferredContactMethod, verificationId
    } = req.body;

    // Validation
    if (!insuranceCompany || !policyNumber || !fullName || !claimType || !dateOfIncident || !description) {
      return res.status(400).json({ error: 'Missing required fields. Please fill in all mandatory fields.' });
    }

    if (!email && !phone) {
      return res.status(400).json({ error: 'Please provide at least one contact method (email or phone).' });
    }

    // Sanitize: Store only filename, not the full path
    const files = (req.files as Express.Multer.File[]) || [];
    const supportingDocuments = files.map(f => path.basename(f.filename));

    const claimId = generateClaimId();
    const payload: any = {
      claimId,
      userId,
      verificationId: verificationId || undefined,
      insuranceCompany: insuranceCompany.trim(),
      policyNumber: policyNumber.trim(),
      policyType: (policyType || 'General Insurance').trim(),
      fullName: fullName.trim(),
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      claimType: claimType.trim(),
      dateOfIncident: dateOfIncident.trim(),
      description: description.trim(),
      preferredContactMethod: preferredContactMethod || 'email',
      supportingDocuments,
      status: 'SUBMITTED',
      statusHistory: [
        { status: 'SUBMITTED', note: 'Claim assistance request received and logged.', updatedAt: new Date() }
      ],
      submittedAt: new Date()
    };

    // Persist to MongoDB if available
    if (mongoose.connection.readyState === 1) {
      try {
        await ClaimAssistance.create(payload);
      } catch (dbErr) {
        // Fall through to memory store
      }
    }
    claimsMemStore.set(claimId, payload);

    // Audit
    dbStore.logAudit({
      userId,
      action: 'CLAIM_ASSISTANCE_SUBMITTED',
      resource: claimId,
      details: `Policy: ${policyNumber}, Insurer: ${insuranceCompany}, Type: ${claimType}`
    });

    return res.status(201).json({
      success: true,
      claimId,
      message: 'Your claim assistance request has been received.',
      claim: {
        claimId: payload.claimId,
        insuranceCompany: payload.insuranceCompany,
        policyNumber: payload.policyNumber,
        status: payload.status,
        submittedAt: payload.submittedAt
      }
    });
  } catch (error: any) {
    console.error('Claim submission error:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit claim assistance request.' });
  }
});

// ─── GET /api/claims — List user's claim requests ─────────────────────────────
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'demo-user-id-123';
    let claims: any[] = [];

    if (mongoose.connection.readyState === 1) {
      try {
        claims = await ClaimAssistance.find({ userId }).sort({ submittedAt: -1 }).limit(50).lean();
      } catch (e) { /* fallback */ }
    }

    if (!claims.length) {
      claims = Array.from(claimsMemStore.values())
        .filter(c => c.userId === userId)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }

    return res.json({ success: true, count: claims.length, claims });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch claim records.' });
  }
});

// ─── GET /api/claims/:claimId — Get single claim ──────────────────────────────
router.get('/:claimId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { claimId } = req.params;
    const userId = req.user?.userId || 'demo-user-id-123';

    let claim: any = null;

    if (mongoose.connection.readyState === 1) {
      try {
        claim = await ClaimAssistance.findOne({ claimId, userId }).lean();
      } catch (e) { /* fallback */ }
    }

    if (!claim) {
      claim = claimsMemStore.get(claimId);
    }

    if (!claim) {
      return res.status(404).json({ error: 'Claim assistance request not found.' });
    }

    // Security: Mask policy number in response (show last 4 only)
    const safeResponse = {
      ...claim,
      policyNumber: claim.policyNumber
        ? `****${String(claim.policyNumber).slice(-4)}`
        : 'Not specified'
    };

    return res.json({ success: true, claim: safeResponse });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch claim record.' });
  }
});

export default router;
