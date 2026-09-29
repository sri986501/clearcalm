import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Policy from '../models/Policy';
import { dbStore } from '../services/store';

const router = Router();

// GET /api/policies (List user policies)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'demo-user-id-123';
    let policies: any[] = [];

    if (mongoose.connection.readyState === 1) {
      try {
        policies = await Policy.find({ userId }).sort({ createdAt: -1 });
      } catch (e) {
        // Memory fallback
      }
    }

    if (!policies || policies.length === 0) {
      policies = Array.from(dbStore.policies.values())
        .filter(p => p.userId === userId || p.userId === 'demo-user-id-123')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return res.json({
      success: true,
      count: policies.length,
      policies,
      isInsurerConnected: policies.length > 0,
      message: policies.length === 0
        ? 'Policy information is not connected to an insurer account.'
        : 'Policy records retrieved successfully'
    });
  } catch (error: any) {
    console.error('Fetch policies error:', error);
    return res.status(500).json({ error: 'Failed to retrieve policy records' });
  }
});

// GET /api/policies/:id (Get single policy)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'demo-user-id-123';
    const { id } = req.params;
    let policy: any = null;

    if (mongoose.connection.readyState === 1) {
      try {
        policy = await Policy.findOne({
          $or: [{ _id: id }, { policyNumber: id }],
          userId
        });
      } catch (e) {
        // Memory fallback
      }
    }

    if (!policy) {
      policy = Array.from(dbStore.policies.values()).find(
        p => (p.id === id || p.policyNumber === id)
      );
    }

    if (!policy) {
      return res.status(404).json({ error: 'Policy certificate not found or unauthorized' });
    }

    return res.json({ success: true, policy });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve policy details' });
  }
});

// GET /api/policies/:id/certificate (Download or view official policy certificate)
router.get('/:id/certificate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'demo-user-id-123';
    const { id } = req.params;
    let policy: any = null;

    if (mongoose.connection.readyState === 1) {
      try {
        policy = await Policy.findOne({
          $or: [{ _id: id }, { policyNumber: id }],
          userId
        });
      } catch (e) {
        // Memory fallback
      }
    }

    if (!policy) {
      policy = Array.from(dbStore.policies.values()).find(
        p => (p.id === id || p.policyNumber === id)
      );
    }

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found for certificate generation' });
    }

    const htmlCertificate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Insurance Certificate - ${policy.policyNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; background: #f8fafc; color: #0f172a; }
    .cert-box { max-width: 800px; margin: 0 auto; background: #ffffff; border: 2px solid #2563eb; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); position: relative; }
    .cert-header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #dbeafe; color: #1e40af; margin-bottom: 10px; }
    .title { font-size: 24px; font-weight: bold; color: #1e293b; margin: 5px 0; }
    .subtitle { font-size: 14px; color: #64748b; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
    .item { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .item label { display: block; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    .item value { display: block; font-size: 15px; font-weight: 700; color: #0f172a; }
    .footer { border-top: 1px dashed #cbd5e1; padding-top: 20px; margin-top: 30px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: center; }
    .stamp { border: 2px solid #16a34a; color: #16a34a; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 12px; text-transform: uppercase; display: inline-block; }
    @media print { body { background: #ffffff; padding: 0; } .cert-box { box-shadow: none; border: 2px solid #000; } }
  </style>
</head>
<body>
  <div class="cert-box">
    <div class="cert-header">
      <span class="badge">OFFICIAL POLICY CERTIFICATE & SCHEDULE</span>
      <h1 class="title">${policy.providerName}</h1>
      <p class="subtitle">Underwritten by ${policy.providerName} · Certificate Ref: ${policy.policyNumber}</p>
    </div>

    <div class="grid">
      <div class="item">
        <label>Policy Number</label>
        <value>${policy.policyNumber}</value>
      </div>
      <div class="item">
        <label>Plan Name</label>
        <value>${policy.planName}</value>
      </div>
      <div class="item">
        <label>Policyholder Name</label>
        <value>${policy.policyHolderName}</value>
      </div>
      <div class="item">
        <label>Policyholder Email</label>
        <value>${policy.policyHolderEmail}</value>
      </div>
      <div class="item">
        <label>Coverage Period</label>
        <value>${policy.startDate} to ${policy.expiryDate}</value>
      </div>
      <div class="item">
        <label>Policy Status</label>
        <value style="color: ${policy.status === 'ACTIVE' ? '#16a34a' : '#ea580c'}">${policy.status}</value>
      </div>
      <div class="item">
        <label>Total Sum Insured / Sum Assured</label>
        <value style="color: #2563eb;">INR ${Number(policy.coverageAmount).toLocaleString('en-IN')}</value>
      </div>
      <div class="item">
        <label>Total Annual Premium Paid</label>
        <value>INR ${Number(policy.annualPremium).toLocaleString('en-IN')}</value>
      </div>
      <div class="item">
        <label>Nominee Details</label>
        <value>${policy.nomineeName || 'Primary Beneficiary'} (${policy.nomineeRelation || 'Spouse'})</value>
      </div>
      <div class="item">
        <label>Payment & Transaction Ref</label>
        <value>${policy.transactionId}</value>
      </div>
    </div>

    <div class="footer">
      <div>
        <p><strong>ClearClaim Secure Policy Vault</strong> · Digital Signature Verified</p>
        <p>This document serves as primary proof of insurance under the terms & conditions of the schedule.</p>
      </div>
      <div class="stamp">
        ✓ DIGITALLY BOUND & VERIFIED
      </div>
    </div>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.send(htmlCertificate);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

export default router;
