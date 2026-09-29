import mongoose, { Schema, Document } from 'mongoose';

export interface IQAHistory extends Document {
  documentId: mongoose.Types.ObjectId | string;
  question: string;
  answer: string;
  sourceChunkIds: string[];
  askedAt: Date;
}

const QAHistorySchema = new Schema<IQAHistory>({
  documentId: { type: Schema.Types.Mixed, required: true, ref: 'Document' },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  sourceChunkIds: [{ type: String }],
  askedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IQAHistory>('QAHistory', QAHistorySchema);
