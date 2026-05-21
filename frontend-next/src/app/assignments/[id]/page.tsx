'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useAssignmentSocket } from '@/hooks/useWebSocket';
import QuestionPaper from '@/components/paper/QuestionPaper';
import { regenerateAssignment } from '@/lib/api';
import Link from 'next/link';

export default function AssignmentOutputPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    currentAssignment,
    currentPaper,
    jobProgress,
    isLoading,
    error,
    loadAssignment,
    loadPaper,
    setJobProgress,
    clearCurrent,
  } = useAssignmentStore();

  const hasStartedRef = useRef(false);

  // Connect WebSocket for real-time updates
  useAssignmentSocket(id);

  useEffect(() => {
    if (!id) return;
    loadAssignment(id);
    return () => clearCurrent();
  }, [id]);

  // Load paper once assignment is completed
  useEffect(() => {
    if (
      currentAssignment?.status === 'completed' &&
      currentAssignment.generatedPaperId &&
      !currentPaper &&
      !hasStartedRef.current
    ) {
      hasStartedRef.current = true;
      loadPaper(id);
    }
  }, [currentAssignment, currentPaper, id, loadPaper]);

  const handleRegenerate = async () => {
    if (!id) return;
    setJobProgress({ progress: 0, message: 'Queuing regeneration...' });
    try {
      await regenerateAssignment(id);
      await loadAssignment(id);
    } catch {
      setJobProgress({ progress: 0, message: 'Failed to queue regeneration' });
    }
  };

  const assignmentTitle =
    [currentAssignment?.subject, currentAssignment?.className]
      .filter(Boolean)
      .join(' — ') || 'Assignment';

  // --- Loading state ---
  if (isLoading && !currentAssignment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --- Error state ---
  if (error && !currentAssignment) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-600 text-sm">{error}</p>
        <Link href="/assignments" className="text-sm text-primary underline">
          Back to Assignments
        </Link>
      </div>
    );
  }

  // --- Processing / pending state ---
  const isProcessing =
    currentAssignment?.status === 'pending' ||
    currentAssignment?.status === 'processing';

  if (isProcessing && !currentPaper) {
    const progress = jobProgress?.progress ?? 0;
    const message =
      jobProgress?.message ?? 'Your question paper is being generated...';

    return (
      <div>
        <div className="mb-6">
          <Link href="/assignments" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{assignmentTitle}</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-lg">
          {/* AI Generating message */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">AI</span>
              </div>
              <p>
                Certainly! Here are customized Question Paper settings on the NCERT chapters.
                Generating your paper — this usually takes 15–30 seconds.
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{message}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
            <span>AI is generating your question paper...</span>
          </div>
        </div>
      </div>
    );
  }

  // --- Failed state ---
  if (currentAssignment?.status === 'failed') {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">{assignmentTitle}</h1>
        </div>

        <div className="bg-white border border-red-200 rounded-xl p-8 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Generation Failed</h2>
              <p className="text-sm text-red-600">
                {currentAssignment.errorMessage || 'An error occurred during generation'}
              </p>
            </div>
          </div>

          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- Completed: show paper ---
  return (
    <div>
      <div className="mb-6">
        <Link href="/assignments" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Assignments
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{assignmentTitle}</h1>
      </div>

      {/* AI intro */}
      {currentPaper && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 max-w-3xl">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-bold">AI</span>
            </div>
            <p className="text-sm text-gray-700">
              Certainly! Here are customized Question Paper for your{' '}
              <strong>{currentPaper.subject}</strong>{' '}
              {currentPaper.className} classes on the NCERT chapters:
            </p>
          </div>
        </div>
      )}

      {isLoading && !currentPaper && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading question paper...
        </div>
      )}

      {currentPaper && (
        <QuestionPaper paper={currentPaper} onRegenerate={handleRegenerate} />
      )}
    </div>
  );
}
