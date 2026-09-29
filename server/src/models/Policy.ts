import mongoose, { Schema, Document } from 'mongoose';

export interface IPolicy extends Document {
  userId: string;
  policyNumber: string;
  productId: string;
  providerName: string;
  planName: string;
  category: 'health' | 'vehicle' | 'life' | 'travel' | 'property';
  policyHolderName: string;
  policyHolderEmail: string;
  policyHolderPhone: string;
  nomineeName?: string;
  nomineeRelation?: string;
  coverageAmount: number;
  annualPremium: number;
  startDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
  paymentId: string;
  transactionId: string;
  createdAt: Date;
}

const PolicySchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  policyNumber: { type: String, required: true, unique: true, index: true },
  productId: { type: String, required: true },
  providerName: { type: String, required: true },
  planName: { type: String, required: true },
  category: { type: String, required: true, enum: ['health', 'vehicle', 'life', 'travel', 'property'] },
  policyHolderName: { type: String, required: true },
  policyHolderEmail: { type: String, required: true },
  policyHolderPhone: { type: String, required: true },
  nomineeName: { type: String },
  nomineeRelation: { type: String },
  coverageAmount: { type: Number, required: true },
  annualPremium: { type: Number, required: true },
  startDate: { type: String, required: true },
  expiryDate: { type: String, required: true },
  status: { type: String, required: true, enum: ['ACTIVE', 'EXPIRED', 'PENDING', 'CANCELLED'], default: 'ACTIVE' },
  paymentId: { type: String, required: true },
  transactionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPolicy>('Policy', PolicySchema);
