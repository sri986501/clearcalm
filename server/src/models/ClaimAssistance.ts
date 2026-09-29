import mongoose, { Document, Schema } from 'mongoose';

export interface IClaimAssistanceDoc extends Document {
  claimId: string;
  userId: string;
  verificationId?: string;

  // Pre-filled from extracted policy data
  insuranceCompany: string;
  policyNumber: string;
  policyType: string;

  // User-entered form fields
  fullName: string;
  email?: string;
  phone?: string;
  claimType: string;
  dateOfIncident: string;
  description: string;
  preferredContactMethod: 'email' | 'phone' | 'both';

  // Supporting documents (filenames only — never public paths)
  supportingDocuments: string[];

  // Status tracking
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ADDITIONAL_INFO_REQUIRED' | 'GUIDANCE_PROVIDED' | 'COMPLETED';
  statusHistory: {
    status: string;
    note: string;
    updatedAt: Date;
  }[];

  submittedAt: Date;
  updatedAt: Date;
}

const ClaimAssistanceSchema = new Schema<IClaimAssistanceDoc>(
  {
    claimId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    verificationId: { type: String },

    insuranceCompany: { type: String, required: true },
    policyNumber: { type: String, required: true },
    policyType: { type: String, default: 'General Insurance' },

    fullName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    claimType: { type: String, required: true },
    dateOfIncident: { type: String, required: true },
    description: { type: String, required: true },
    preferredContactMethod: { type: String, enum: ['email', 'phone', 'both'], default: 'email' },

    supportingDocuments: [{ type: String }],

    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_INFO_REQUIRED', 'GUIDANCE_PROVIDED', 'COMPLETED'],
      default: 'SUBMITTED'
    },
    statusHistory: [
      {
        status: String,
        note: String,
        updatedAt: { type: Date, default: Date.now }
      }
    ],

    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model<IClaimAssistanceDoc>('ClaimAssistance', ClaimAssistanceSchema);
