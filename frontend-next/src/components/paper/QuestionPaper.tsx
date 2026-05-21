'use client';

import { GeneratedPaper, DIFFICULTY_COLORS } from '@/types';
import { exportPaperToPDF } from '@/lib/pdfExport';

interface Props {
  paper: GeneratedPaper;
  onRegenerate?: () => void;
}

export default function QuestionPaper({ paper, onRegenerate }: Props) {
  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => exportPaperToPDF(paper)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download as PDF
        </button>

        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
          </button>
        )}
      </div>

      {/* Paper */}
      <div
        id="question-paper"
        className="bg-white border border-gray-200 rounded-xl p-8 max-w-3xl shadow-sm"
      >
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-5 mb-6">
          <h1 className="text-xl font-bold text-gray-900">{paper.schoolName}</h1>
          <p className="text-sm text-gray-600 mt-1">Subject: {paper.subject}</p>
          <p className="text-sm text-gray-600">Class: {paper.className}</p>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
          <span>
            <span className="font-medium">Time Allowed:</span> {paper.timeAllowed}
          </span>
          <span>
            <span className="font-medium">Maximum Marks:</span> {paper.maxMarks}
          </span>
        </div>
        <p className="text-xs text-gray-500 italic mb-6">
          All questions are compulsory unless stated otherwise.
        </p>

        {/* Student info */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 mb-8 border-t border-gray-100 pt-4">
          {['Name', 'Roll Number', 'Class & Section'].map((label) => (
            <div key={label} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-medium">{label}:</span>
              <span className="border-b border-gray-400 w-32 inline-block" />
            </div>
          ))}
        </div>

        {/* Sections */}
        {paper.sections.map((section, si) => (
          <div key={si} className="mb-8">
            <div className="flex items-baseline gap-3 mb-1">
              <h2 className="text-base font-bold text-gray-900">{section.title}</h2>
            </div>
            <p className="text-xs text-gray-500 italic mb-4">{section.instruction}</p>

            <div className="space-y-5">
              {section.questions.map((q, qi) => {
                const globalNum = paper.sections
                  .slice(0, si)
                  .reduce((acc, s) => acc + s.questions.length, 0) + qi + 1;

                return (
                  <div key={qi} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-gray-700 flex-shrink-0 mt-0.5 w-5">
                        {globalNum}.
                      </span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start gap-2">
                          <p className="text-sm text-gray-900 flex-1">{q.text}</p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${
                                DIFFICULTY_COLORS[q.difficulty] || 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              [{q.marks} Mark{q.marks !== 1 ? 's' : ''}]
                            </span>
                          </div>
                        </div>

                        {/* MCQ options */}
                        {q.options && q.options.length > 0 && (
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {q.options.map((opt, oi) => (
                              <p key={oi} className="text-sm text-gray-700">
                                {opt}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {si < paper.sections.length - 1 && (
              <div className="border-b border-dashed border-gray-200 mt-6" />
            )}
          </div>
        ))}

        {/* End of Question Paper */}
        <p className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100">
          End of Question Paper
        </p>

        {/* Answer Key */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <h2 className="text-base font-bold text-gray-900 mb-4">Answer Key</h2>
          <div className="space-y-4">
            {paper.sections.map((section, si) => (
              <div key={si}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{section.title}</h3>
                <div className="space-y-2">
                  {section.questions.map((q, qi) => {
                    const globalNum = paper.sections
                      .slice(0, si)
                      .reduce((acc, s) => acc + s.questions.length, 0) + qi + 1;
                    return (
                      <div key={qi} className="flex gap-3 text-sm">
                        <span className="font-medium text-gray-700 flex-shrink-0 w-5">
                          {globalNum}.
                        </span>
                        <p className="text-gray-600">{q.answer}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
