export interface QuestionType {
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface Assignment {
  _id: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions: string;
  uploadedFileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedPaperId?: string;
  jobId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  text: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'challenging';
  marks: number;
  options?: string[];
  answer: string;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  _id: string;
  assignmentId: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  sections: Section[];
  createdAt: string;
}

export interface JobProgress {
  progress: number;
  message: string;
}

export const QUESTION_TYPE_OPTIONS = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short', label: 'Short Questions' },
  { value: 'diagram', label: 'Diagram/Graph-Based Questions' },
  { value: 'numerical', label: 'Numerical Problems' },
  { value: 'long', label: 'Long Answer Questions' },
];

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-orange-100 text-orange-700',
  challenging: 'bg-red-100 text-red-700',
};
