import mongoose, { Schema, Document } from 'mongoose';

export interface IInsuranceProduct extends Document {
  providerName: string;
  isDemoProvider: boolean;
  category: 'health' | 'vehicle' | 'life' | 'travel' | 'property';
  planName: string;
  tagline: string;
  description: string;
  sumInsured: number;
  annualPremiumBase: number;
  deductible: number;
  claimSettlementRatio: string;
  rating: string;
  features: string[];
  exclusions: string[];
  popular?: boolean;
}

const InsuranceProductSchema: Schema = new Schema({
  providerName: { type: String, required: true },
  isDemoProvider: { type: Boolean, default: true },
  category: { type: String, required: true, enum: ['health', 'vehicle', 'life', 'travel', 'property'] },
  planName: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  sumInsured: { type: Number, required: true },
  annualPremiumBase: { type: Number, required: true },
  deductible: { type: Number, default: 0 },
  claimSettlementRatio: { type: String, required: true },
  rating: { type: String, default: '4.8 / 5' },
  features: [{ type: String }],
  exclusions: [{ type: String }],
  popular: { type: Boolean, default: false }
});

export default mongoose.model<IInsuranceProduct>('InsuranceProduct', InsuranceProductSchema);
