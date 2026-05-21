'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionType, QUESTION_TYPE_OPTIONS } from '@/types';
import { createAssignment, uploadFile } from '@/lib/api';

interface FormState {
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions: string;
  uploadedFileName: string;
  extractedText: string;
}

const defaultQuestionTypes: QuestionType[] = [
  { type: 'mcq', count: 4, marksPerQuestion: 1 },
];

export default function CreateAssignmentForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormState>({
    subject: '',
    className: '',
    schoolName: '',
    dueDate: '',
    questionTypes: defaultQuestionTypes,
    additionalInstructions: '',
    uploadedFileName: '',
    extractedText: '',
  });

  const totalQuestions = form.questionTypes.reduce((s, qt) => s + qt.count, 0);
  const totalMarks = form.questionTypes.reduce(
    (s, qt) => s + qt.count * qt.marksPerQuestion,
    0
  );

  // File upload
  const handleFile = async (file: File) => {
    setIsUploading(true);
    setError('');
    try {
      const result = await uploadFile(file);
      setForm((f) => ({
        ...f,
        uploadedFileName: result.fileName,
        extractedText: result.extractedText,
      }));
    } catch {
      setError('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  // Question type management
  const addQuestionType = () => {
    const usedTypes = new Set(form.questionTypes.map((qt) => qt.type));
    const next = QUESTION_TYPE_OPTIONS.find((o) => !usedTypes.has(o.value));
    if (!next) return;
    setForm((f) => ({
      ...f,
      questionTypes: [
        ...f.questionTypes,
        { type: next.value, count: 4, marksPerQuestion: 1 },
      ],
    }));
  };

  const removeQuestionType = (index: number) => {
    setForm((f) => ({
      ...f,
      questionTypes: f.questionTypes.filter((_, i) => i !== index),
    }));
  };

  const updateQuestionType = (
    index: number,
    field: keyof QuestionType,
    value: string | number
  ) => {
    setForm((f) => ({
      ...f,
      questionTypes: f.questionTypes.map((qt, i) =>
        i === index ? { ...qt, [field]: value } : qt
      ),
    }));
  };

  const adjustCount = (index: number, delta: number) => {
    const current = form.questionTypes[index].count;
    const next = Math.max(1, current + delta);
    updateQuestionType(index, 'count', next);
  };

  const adjustMarks = (index: number, delta: number) => {
    const current = form.questionTypes[index].marksPerQuestion;
    const next = Math.max(1, current + delta);
    updateQuestionType(index, 'marksPerQuestion', next);
  };

  // Validation
  const validate = (): string => {
    if (!form.dueDate) return 'Please set a due date';
    if (form.questionTypes.length === 0) return 'Add at least one question type';
    for (const qt of form.questionTypes) {
      if (qt.count < 1) return 'Question count must be at least 1';
      if (qt.marksPerQuestion < 1) return 'Marks must be at least 1';
    }
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { assignmentId } = await createAssignment(form);
      router.push(`/assignments/${assignmentId}`);
    } catch {
      setError('Failed to create assignment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step header */}
      <div className="mb-6">
        <div className="h-1 bg-gray-200 rounded-full mb-4">
          <div className="h-1 bg-primary rounded-full w-1/2" />
        </div>
        <h2 className="font-semibold text-gray-900">Assignment Details</h2>
        <p className="text-sm text-gray-500 mt-0.5">Basic information about your assignment</p>
      </div>

      {/* File upload */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-4 cursor-pointer ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={onFileChange}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : form.uploadedFileName ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">{form.uploadedFileName}</p>
            <p className="text-xs text-gray-500">
              {form.extractedText ? 'Text extracted successfully' : 'File uploaded (no text extracted)'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              Choose a file or drag &amp; drop it here
            </p>
            <p className="text-xs text-gray-400">JPG, PNG, PDF upto 10MB</p>
            <button
              type="button"
              className="mt-2 text-sm border border-gray-300 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              Browse Files
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 text-center mb-6">
        Upload images of your preferred document/image
      </p>

      {/* Subject / Class / School */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="e.g. Science"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
          <input
            type="text"
            value={form.className}
            onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))}
            placeholder="e.g. Class 8"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">School</label>
          <input
            type="text"
            value={form.schoolName}
            onChange={(e) => setForm((f) => ({ ...f, schoolName: e.target.value }))}
            placeholder="e.g. Delhi Public School"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* Due Date */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
        <div className="relative">
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* Question Types */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Question Type
          </label>
          <div className="grid grid-cols-2 gap-8 text-xs font-semibold text-gray-700 uppercase tracking-wide pr-8">
            <span>No. of Questions</span>
            <span>Marks</span>
          </div>
        </div>

        <div className="space-y-3">
          {form.questionTypes.map((qt, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
            >
              {/* Type selector */}
              <div className="flex-1 min-w-0">
                <select
                  value={qt.type}
                  onChange={(e) => updateQuestionType(index, 'type', e.target.value)}
                  className="w-full border border-gray-200 bg-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {QUESTION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remove */}
              {form.questionTypes.length > 1 && (
                <button
                  onClick={() => removeQuestionType(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Count stepper */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => adjustCount(index, -1)}
                  className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xs font-bold"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-medium">{qt.count}</span>
                <button
                  onClick={() => adjustCount(index, 1)}
                  className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xs font-bold"
                >
                  +
                </button>
              </div>

              {/* Marks stepper */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => adjustMarks(index, -1)}
                  className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xs font-bold"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-medium">{qt.marksPerQuestion}</span>
                <button
                  onClick={() => adjustMarks(index, 1)}
                  className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Question Type */}
        {form.questionTypes.length < QUESTION_TYPE_OPTIONS.length && (
          <button
            onClick={addQuestionType}
            className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Question Type
          </button>
        )}

        {/* Totals */}
        <div className="mt-4 flex justify-end gap-6 text-sm text-gray-600">
          <span>Total Questions: <strong className="text-gray-900">{totalQuestions}</strong></span>
          <span>Total Marks: <strong className="text-gray-900">{totalMarks}</strong></span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mb-8">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Additional Information <span className="text-gray-400">(For better output)</span>
        </label>
        <textarea
          value={form.additionalInstructions}
          onChange={(e) => setForm((f) => ({ ...f, additionalInstructions: e.target.value }))}
          placeholder="e.g. Generate a question paper for 3 hour exam duration..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {error && (
        <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-4 py-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
