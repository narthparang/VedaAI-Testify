'use client';

import { create } from 'zustand';
import { Assignment, GeneratedPaper, JobProgress } from '@/types';
import {
  fetchAssignments,
  fetchAssignment,
  fetchPaper,
  deleteAssignment,
} from '@/lib/api';

interface AssignmentStore {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  currentPaper: GeneratedPaper | null;
  jobProgress: JobProgress | null;
  isLoading: boolean;
  error: string | null;

  loadAssignments: () => Promise<void>;
  loadAssignment: (id: string) => Promise<void>;
  loadPaper: (assignmentId: string) => Promise<void>;
  removeAssignment: (id: string) => Promise<void>;
  setJobProgress: (progress: JobProgress | null) => void;
  updateAssignmentStatus: (id: string, status: Assignment['status']) => void;
  setError: (error: string | null) => void;
  clearCurrent: () => void;
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  currentAssignment: null,
  currentPaper: null,
  jobProgress: null,
  isLoading: false,
  error: null,

  loadAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const assignments = await fetchAssignments();
      set({ assignments, isLoading: false });
    } catch {
      set({ error: 'Failed to load assignments', isLoading: false });
    }
  },

  loadAssignment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const assignment = await fetchAssignment(id);
      set({ currentAssignment: assignment, isLoading: false });
    } catch {
      set({ error: 'Failed to load assignment', isLoading: false });
    }
  },

  loadPaper: async (assignmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const paper = await fetchPaper(assignmentId);
      set({ currentPaper: paper, isLoading: false });
    } catch {
      set({ error: 'Paper not available yet', isLoading: false });
    }
  },

  removeAssignment: async (id: string) => {
    try {
      await deleteAssignment(id);
      set((state) => ({
        assignments: state.assignments.filter((a) => a._id !== id),
      }));
    } catch {
      set({ error: 'Failed to delete assignment' });
    }
  },

  setJobProgress: (progress) => set({ jobProgress: progress }),

  updateAssignmentStatus: (id, status) => {
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a._id === id ? { ...a, status } : a
      ),
      currentAssignment:
        state.currentAssignment?._id === id
          ? { ...state.currentAssignment, status }
          : state.currentAssignment,
    }));
  },

  setError: (error) => set({ error }),

  clearCurrent: () =>
    set({ currentAssignment: null, currentPaper: null, jobProgress: null }),
}));
