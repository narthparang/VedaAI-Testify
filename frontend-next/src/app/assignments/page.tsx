'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAssignmentStore } from '@/store/assignmentStore';
import AssignmentCard from '@/components/assignments/AssignmentCard';
import EmptyState from '@/components/assignments/EmptyState';

export default function AssignmentsPage() {
  const { assignments, isLoading, loadAssignments } = useAssignmentStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const filtered = assignments.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.subject.toLowerCase().includes(q) ||
      a.className.toLowerCase().includes(q) ||
      a.schoolName.toLowerCase().includes(q)
    );
  });

  if (isLoading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <h1 className="text-lg font-bold text-gray-900">Assignments</h1>
              </div>
              <p className="text-sm text-gray-500">Manage and create assignments for your classes.</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5">
            <button className="flex items-center gap-1.5 text-sm border border-gray-300 bg-white rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filter by
            </button>

            <div className="flex-1 relative max-w-xs">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Assignment"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((assignment) => (
              <AssignmentCard key={assignment._id} assignment={assignment} />
            ))}
          </div>

          {filtered.length === 0 && search && (
            <p className="text-center text-sm text-gray-500 mt-12">
              No assignments match "{search}"
            </p>
          )}

          {/* Floating create button on mobile */}
          <Link
            href="/assignments/create"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Assignment
          </Link>
        </>
      )}
    </div>
  );
}
