'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const breadcrumbMap: Record<string, string> = {
  '/assignments': 'Assignment',
  '/assignments/create': 'Create Assignment',
};

export default function Header() {
  const pathname = usePathname();

  const label = Object.entries(breadcrumbMap).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] ?? 'Home';

  return (
    <header className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button
          onClick={() => window.history.back()}
          className="hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="font-medium text-gray-700">{label}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-1.5 text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-primary text-xs font-bold">JD</span>
          </div>
          <span className="text-gray-700 font-medium hidden sm:block">John Doe</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </header>
  );
}
