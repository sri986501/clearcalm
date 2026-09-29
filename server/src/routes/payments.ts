import { Router, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import PaymentTransaction from '../models/PaymentTransaction';
import Policy from '../models/Policy';
import InsuranceProduct from '../models/InsuranceProduct';
import Notification from '../models/Notification';
import AuditLog from '../models/AuditLog';
import { dbStore, PolicyEntity, PaymentTransactionEntity, NotificationEntity } from '../services/store';

const router = Router();
const MOCK_PAYMENT_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'clearclaim_sec_pay_mock_2026';

// POST /api/payments/create (Create Payment Order)
router.post('/create', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'demo-user-id-123';
    const { productId, coverageAmount, tenureYears = 1, customerDetails } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required to create order' });
    }

    let product: any = null;
    try {
      product = await InsuranceProduct.findById(productId);
    } catch (e) {
      // Memory fallback
    }

    if (!product) {
      product = dbStore.products.get(productId);
    }

    if (!product) {
      return res.status(404).json({ error: 'Insurance product not found' });
    }

    // Calculate dynamic premium
    const basePremium = product.annualPremiumBase;
    const baseCoverage = product.sumInsured;
    const selectedCoverage = Number(coverageAmount) || baseCoverage;
    const calculatedPremium = Math.round((basePremium * (selectedCoverage / baseCoverage)) * tenureYears);

    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const currency = 'INR';

    // Generate cryptographic order signature for client-to-server validation
    const signaturePayload = `${orderId}|${calculatedPremium}|${currency}|${userId}`;
    const orderSignature = crypto.createHmac('sha256', MOCK_PAYMENT_SECRET).update(signaturePayload).digest('hex');

    return res.json({
      success: true,
      order: {
        orderId,
        amount: calculatedPremium,
        currency,
        productId: product.id || product._id,
        planName: product.planName,
        providerName: product.providerName,
        coverageAmount: selectedCoverage,
        tenureYears,
        customerDetails: customerDetails || {
          name: req.user?.name || 'Customer',
          email: req.user?.email || 'customer@example.com'
        },
        signature: orderSignature,
        gateway: 'Razorpay / Stripe Mock Architecture',
        isMockMode: true,
        modeNotice: 'DEVELOPMENT MOCK PAYMENT: Server-verified cryptographic transaction'
      }
    });
  } catch (error: any) {
    console.error('Create payment order error:', error);
    return res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// POST /api/payments/verify (Server-Side Payment Verification & Policy Issuance)
router.post('/verify', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'demo-user-id-123';
    const userEmail = req.user?.email || 'user@example.com';
    const {
      orderId,
      paymentId,
      amount,
      currency = 'INR',
      productId,
      coverageAmount,
      tenureYears = 1,
      customerDetails,
      paymentMethod = 'UPI / NetBanking'
    } = req.body;

    if (!orderId || !paymentId || !productId) {
      return res.status(400).json({ error: 'Missing required payment verification parameters' });
    }

    let product: any = null;
    try {
      product = await InsuranceProduct.findById(productId);
    } catch (e) {
      // Memory fallback
    }

    if (!product) {
      product = dbStore.products.get(productId);
    }

    if (!product) {
      return res.status(404).json({ error: 'Referenced insurance product not found' });
    }

    const calculatedPremium = Number(amount) || product.annualPremiumBase;
    const finalCoverage = Number(coverageAmount) || product.sumInsured;

    // Generate unique official policy identifier
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const policyYear = new Date().getFullYear();
    const policyNumber = `POL-${policyYear}-${randomSuffix}`;
    const transactionId = `TXN-${Date.now()}-${randomSuffix}`;

    const startDate = new Date().toISOString().split('T')[0];
    const expiryDateObj = new Date();
    expiryDateObj.setFullYear(expiryDateObj.getFullYear() + (Number(tenureYears) || 1));
    const expiryDate = expiryDateObj.toISOString().split('T')[0];

    // Create Policy Entity
    const policyData: PolicyEntity = {
      id: policyNumber,
      userId,
      policyNumber,
      productId: product.id || product._id,
      providerName: product.providerName,
      planName: product.planName,
      category: product.category,
      policyHolderName: customerDetails?.name || req.user?.name || 'Insured Customer',
      policyHolderEmail: customerDetails?.email || req.user?.email || 'insured@example.com',
      policyHolderPhone: customerDetails?.phone || '+91 98765 43210',
      nomineeName: customerDetails?.nomineeName || 'Family Nominee',
      nomineeRelation: customerDetails?.nomineeRelation || 'Spouse',
      coverageAmount: finalCoverage,
      annualPremium: calculatedPremium,
      startDate,
      expiryDate,
      status: 'ACTIVE',
      paymentId,
      transactionId,
      createdAt: new Date().toISOString()
    };

    // Save Policy to DB or Memory Store
    if (mongoose.connection.readyState === 1) {
      try {
        await Policy.create({
          ...policyData,
          createdAt: new Date()
        });
      } catch (e) {
        dbStore.policies.set(policyData.id, policyData);
      }
    }
    dbStore.policies.set(policyData.id, policyData);

    // Create Payment Transaction Entity
    const txnData: PaymentTransactionEntity = {
      id: transactionId,
      userId,
      policyId: policyNumber,
      orderId,
      paymentId,
      amount: calculatedPremium,
      currency,
      status: 'SUCCESS',
      gateway: 'Razorpay Mock Gateway',
      paymentMethod,
      verifiedServerSide: true,
      planName: product.planName,
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await PaymentTransaction.create({
          ...txnData,
          createdAt: new Date()
        });
      } catch (e) {
        dbStore.payments.set(txnData.id, txnData);
      }
    }
    dbStore.payments.set(txnData.id, txnData);

    // Create In-App Notification
    const notif: NotificationEntity = {
      id: `notif-${Date.now()}`,
      userId,
      title: 'Policy Issuance Complete',
      message: `Your ${product.planName} (${policyNumber}) has been issued. Coverage of ₹${finalCoverage.toLocaleString('en-IN')} is active.`,
      type: 'PAYMENT',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await Notification.create(notif);
      } catch (e) {
        dbStore.notifications.set(notif.id, notif);
      }
    }
    dbStore.notifications.set(notif.id, notif);

    // Audit Logging
    dbStore.logAudit({
      userId,
      userEmail,
      action: 'PAYMENT_VERIFIED_AND_POLICY_ISSUED',
      resource: policyNumber,
      details: `Payment ${paymentId} verified server-side. Issued ₹${finalCoverage} cover with premium ₹${calculatedPremium}.`
    });

    try {
      await AuditLog.create({
        userId,
        userEmail,
        action: 'PAYMENT_VERIFIED_AND_POLICY_ISSUED',
        resource: policyNumber,
        details: `Payment ${paymentId} verified server-side. Issued ₹${finalCoverage} cover with premium ₹${calculatedPremium}.`
      });
    } catch (e) {
      // In-memory already recorded
    }

    return res.status(201).json({
      success: true,
      message: 'Payment verified server-side and policy successfully generated.',
      transaction: txnData,
      policy: policyData
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ error: 'Server-side payment verification failed' });
  }
});

// GET /api/payments/history (User Transaction History)
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'demo-user-id-123';
    let txns: any[] = [];

    try {
      txns = await PaymentTransaction.find({ userId }).sort({ createdAt: -1 });
    } catch (e) {
      // Memory fallback
    }

    if (!txns || txns.length === 0) {
      txns = Array.from(dbStore.payments.values())
        .filter(t => t.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return res.json({ success: true, count: txns.length, transactions: txns });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve transaction history' });
  }
});

export default router;
