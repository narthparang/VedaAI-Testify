'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Assignment } from '@/types';
import { useAssignmentStore } from '@/store/assignmentStore';
import { format } from 'date-fns';

interface Props {
  assignment: Assignment;
}

const STATUS_STYLES: Record<Assignment['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function AssignmentCard({ assignment }: Props) {
  const router = useRouter();
  const { removeAssignment } = useAssignmentStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const assignedDate = format(new Date(assignment.createdAt), 'dd-MM-yyyy');
  const dueDate = format(new Date(assignment.dueDate), 'dd-MM-yyyy');

  const handleView = () => {
    setMenuOpen(false);
    router.push(`/assignments/${assignment._id}`);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (confirm('Delete this assignment?')) {
      await removeAssignment(assignment._id);
    }
  };

  const title =
    [assignment.subject, assignment.className]
      .filter(Boolean)
      .join(' — ') || 'Untitled Assignment';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all relative">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{title}</h3>
        </div>

        {/* Three-dot menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[140px]">
                <button
                  onClick={handleView}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Assignment
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-500 space-y-0.5">
          <p>
            <span className="font-medium">Assigned on:</span>{' '}
            <span className="text-gray-700">{assignedDate}</span>
          </p>
          <p>
            <span className="font-medium">Due:</span>{' '}
            <span className="text-gray-700">{dueDate}</span>
          </p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[assignment.status]}`}
        >
          {assignment.status}
        </span>
      </div>
    </div>
  );
}
