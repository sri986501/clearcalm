import mongoose, { Schema, Document } from 'mongoose';

export type CategoryType = 'coverage' | 'penalty' | 'eligibility' | 'renewal' | 'liability' | 'general';
export type RiskLevelType = 'none' | 'low' | 'high';
export type SummaryModeType = 'short' | 'detailed' | 'bullet' | 'timeline';

export interface IFact {
  statement: string;
  sourceChunkId: string;
  category: CategoryType;
  riskLevel: RiskLevelType;
  riskExplanation?: string;
  verified?: boolean; // True if verified during anti-hallucination check
}

export interface ISummary extends Document {
  documentId: mongoose.Types.ObjectId | string;
  mode: SummaryModeType;
  facts: IFact[];
  generatedAt: Date;
}

const FactSchema = new Schema<IFact>({
  statement: { type: String, required: true },
  sourceChunkId: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['coverage', 'penalty', 'eligibility', 'renewal', 'liability', 'general'], 
    default: 'general' 
  },
  riskLevel: { type: String, enum: ['none', 'low', 'high'], default: 'none' },
  riskExplanation: { type: String },
  verified: { type: Boolean, default: true }
});

const SummarySchema = new Schema<ISummary>({
  documentId: { type: Schema.Types.Mixed, required: true, ref: 'Document' },
  mode: { type: String, enum: ['short', 'detailed', 'bullet', 'timeline'], default: 'detailed' },
  facts: [FactSchema],
  generatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISummary>('Summary', SummarySchema);
