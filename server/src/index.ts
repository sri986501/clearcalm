import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import documentRoutes from './routes/documents';
import summaryRoutes from './routes/summaries';
import qaRoutes from './routes/qa';
import verifyRoutes, { seedInitialVerifications } from './routes/verify';
import productRoutes from './routes/products';
import paymentRoutes from './routes/payments';
import policyRoutes from './routes/policies';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import providerRoutes from './routes/providers';
import claimRoutes from './routes/claims';

import { SAMPLE_DOCUMENTS } from './services/sampleDocs';
import Document from './models/Document';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/verifications', verifyRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/categories', providerRoutes); // mounts /categories directly as well
app.use('/api', providerRoutes); // mounts /api/categories & /api/providers
app.use('/api/insurance-products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/claims', claimRoutes);

// Seed in-memory demo records on startup
seedInitialVerifications().catch(e => console.warn('Demo seed notice:', e));

// Preset sample docs endpoint for out-of-the-box demo testing
app.get('/api/samples', (_req, res) => {
  return res.json({ samples: SAMPLE_DOCUMENTS });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  return res.json({
    status: 'ok',
    service: 'ClearClaim Document Intelligence & Insurance Platform API',
    version: '3.0.0',
    anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here'),
    timestamp: new Date()
  });
});

// MongoDB Connection with silent offline fallback
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clearclaim';

mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log('MongoDB connected successfully');
    // Seed sample documents if empty
    try {
      const count = await Document.countDocuments();
      if (count === 0) {
        for (const sample of SAMPLE_DOCUMENTS) {
          await Document.create({
            userId: 'demo-user-id-123',
            filename: sample.filename,
            originalUrl: sample.originalUrl,
            filePath: sample.originalUrl,
            fileSize: 1024 * 50,
            status: 'ready',
            pageCount: sample.pageCount,
            chunks: sample.chunks,
            uploadedAt: sample.uploadedAt
          });
        }
      }
    } catch (e) {
      console.warn('Seeding warning:', e);
    }
  })
  .catch((err) => {
    console.warn('MongoDB connection unavailable (running in resilient in-memory mode):', err.message);
  });

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` ClearClaim Insurance Platform API running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
