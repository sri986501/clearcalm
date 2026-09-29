import mongoose, { Schema, Document } from 'mongoose';

export type VerificationStatus = 'Verified / Likely Original' | 'Suspicious' | 'Potentially Altered' | 'Unable to Verify' | 'CONSISTENT' | 'NEEDS_REVIEW';

export interface IVerificationResultDoc extends Document {
  verificationId: string;
  userId: mongoose.Types.ObjectId | string;
  documentId?: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: VerificationStatus;
  statusCode: 'VERIFIED_ORIGINAL' | 'SUSPICIOUS' | 'POTENTIALLY_ALTERED' | 'UNABLE_TO_VERIFY';
  anomalyScore: number;
  confidenceScore: number;
  processingTimeMs: number;
  extractedFields: any;
  validationChecks: any[];
  detectedIssues: any[];
  passedChecksCount: number;
  totalChecksCount: number;
  trustedRegistryMatch: {
    matched: boolean;
    providerName?: string;
    accreditationStatus?: string;
    details?: string;
  };
  officialVerificationStatus: 'PENDING_INSURER_CONFIRMATION' | 'CONFIRMED_BY_INSURER' | 'UNAVAILABLE';
  recommendation: string;
  plainEnglishSummary?: string;
  detailedExplanation?: string;
  reviewerGuidance?: string;
  disclaimer: string;
  modelInfo: {
    name: string;
    type: string;
    version: string;
  };
  visualAnalysis?: any;
  verifiedAt: Date;
}

const VerificationResultSchema = new Schema<IVerificationResultDoc>({
  verificationId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.Mixed, required: true, ref: 'User' },
  documentId: { type: String },
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, default: 'application/pdf' },
  fileSize: { type: Number, default: 0 },
  status: { type: String, required: true },
  statusCode: { type: String, enum: ['VERIFIED_ORIGINAL', 'SUSPICIOUS', 'POTENTIALLY_ALTERED', 'UNABLE_TO_VERIFY'], default: 'VERIFIED_ORIGINAL' },
  anomalyScore: { type: Number, required: true },
  confidenceScore: { type: Number, required: true },
  processingTimeMs: { type: Number, required: true },
  extractedFields: { type: Schema.Types.Mixed, required: true },
  validationChecks: [Schema.Types.Mixed],
  detectedIssues: [Schema.Types.Mixed],
  passedChecksCount: { type: Number, default: 0 },
  totalChecksCount: { type: Number, default: 0 },
  trustedRegistryMatch: { type: Schema.Types.Mixed },
  officialVerificationStatus: { type: String, default: 'PENDING_INSURER_CONFIRMATION' },
  recommendation: { type: String, required: true },
  plainEnglishSummary: { type: String },
  detailedExplanation: { type: String },
  reviewerGuidance: { type: String },
  disclaimer: { type: String, default: 'AI-assisted verification identifies inconsistencies and risk indicators. It does not guarantee authenticity unless the policy is independently confirmed through an authorized insurer or trusted source.' },
  modelInfo: {
    name: { type: String, default: 'ClearClaim Multi-Layer Authenticity & Consistency Engine' },
    type: { type: String, default: 'Hybrid OCR + Underwriting Rule Engine + Anomaly Ensemble' },
    version: { type: String, default: 'v3.0.0-production' }
  },
  visualAnalysis: { type: Schema.Types.Mixed },
  verifiedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IVerificationResultDoc>('VerificationResult', VerificationResultSchema);
