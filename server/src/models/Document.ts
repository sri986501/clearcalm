import mongoose, { Schema, Document } from 'mongoose';

export interface IDocChunk {
  chunkId: string; // e.g. "p1-para1"
  page: number;
  paragraphIndex?: number;
  text: string;
  bbox?: { x: number; y: number; width: number; height: number };
}

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  filename: string;
  originalUrl: string;
  filePath: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'failed';
  pageCount: number;
  chunks: IDocChunk[];
}

const DocChunkSchema = new Schema<IDocChunk>({
  chunkId: { type: String, required: true },
  page: { type: Number, required: true },
  paragraphIndex: { type: Number },
  text: { type: String, required: true },
  bbox: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  }
});

const DocumentSchema = new Schema<IDocument>({
  userId: { type: Schema.Types.Mixed, required: true, ref: 'User' },
  filename: { type: String, required: true },
  originalUrl: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
  pageCount: { type: Number, default: 1 },
  chunks: [DocChunkSchema]
});

export default mongoose.model<IDocument>('Document', DocumentSchema);
