import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentTransaction extends Document {
  userId: string;
  policyId?: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  gateway: string;
  paymentMethod: string;
  verifiedServerSide: boolean;
  planName: string;
  createdAt: Date;
}

const PaymentTransactionSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  policyId: { type: String },
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'SUCCESS' },
  gateway: { type: String, default: 'Razorpay Mock Gateway' },
  paymentMethod: { type: String, default: 'UPI / NetBanking' },
  verifiedServerSide: { type: Boolean, default: true },
  planName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPaymentTransaction>('PaymentTransaction', PaymentTransactionSchema);
