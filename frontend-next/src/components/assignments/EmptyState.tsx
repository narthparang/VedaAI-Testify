import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-4">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-2">No assignments yet</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-8">
        Create your first assignment to start collecting and grading student submissions.
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      <Link
        href="/assignments/create"
        className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create Your First Assignment
      </Link>
    </div>
  );
}
