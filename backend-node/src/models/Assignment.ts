import { Schema, model, Document, Types } from 'mongoose';

export interface IQuestionType {
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface IAssignment extends Document {
  subject: string;
  className: string;
  schoolName: string;
  dueDate: Date;
  questionTypes: IQuestionType[];
  additionalInstructions: string;
  uploadedFileName: string;
  extractedText: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedPaperId?: Types.ObjectId;
  jobId?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<IQuestionType>({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 1 },
  marksPerQuestion: { type: Number, required: true, min: 1 },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    subject: { type: String, default: '' },
    className: { type: String, default: '' },
    schoolName: { type: String, default: '' },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeSchema], required: true },
    additionalInstructions: { type: String, default: '' },
    uploadedFileName: { type: String, default: '' },
    extractedText: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    generatedPaperId: { type: Schema.Types.ObjectId, ref: 'GeneratedPaper' },
    jobId: { type: String },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const Assignment = model<IAssignment>('Assignment', AssignmentSchema);
