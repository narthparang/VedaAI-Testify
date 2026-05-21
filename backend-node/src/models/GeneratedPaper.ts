import { Schema, model, Document, Types } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'challenging';
  marks: number;
  options?: string[];
  answer: string;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IGeneratedPaper extends Document {
  assignmentId: Types.ObjectId;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  sections: ISection[];
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'hard', 'challenging'],
    required: true,
  },
  marks: { type: Number, required: true },
  options: [String],
  answer: { type: String, required: true },
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
});

const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    schoolName: { type: String, default: '' },
    subject: { type: String, default: '' },
    className: { type: String, default: '' },
    timeAllowed: { type: String, default: '' },
    maxMarks: { type: Number, default: 0 },
    sections: { type: [SectionSchema], required: true },
  },
  { timestamps: true }
);

export const GeneratedPaper = model<IGeneratedPaper>('GeneratedPaper', GeneratedPaperSchema);
