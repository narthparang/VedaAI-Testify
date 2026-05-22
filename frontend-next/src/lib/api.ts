import axios from 'axios';
import { Assignment, GeneratedPaper, QuestionType } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

export interface CreateAssignmentPayload {
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions: string;
  uploadedFileName: string;
  extractedText: string;
}

export async function fetchAssignments(): Promise<Assignment[]> {
  const { data } = await api.get<Assignment[]>('/api/assignments');
  return data;
}

export async function fetchAssignment(id: string): Promise<Assignment> {
  const { data } = await api.get<Assignment>(`/api/assignments/${id}`);
  return data;
}

export async function fetchPaper(assignmentId: string): Promise<GeneratedPaper> {
  const { data } = await api.get<GeneratedPaper>(`/api/assignments/${assignmentId}/paper`);
  return data;
}

export async function createAssignment(
  payload: CreateAssignmentPayload
): Promise<{ assignmentId: string; jobId: string }> {
  const { data } = await api.post('/api/assignments', payload);
  return data;
}

export async function regenerateAssignment(
  assignmentId: string
): Promise<{ jobId: string }> {
  const { data } = await api.post(`/api/assignments/${assignmentId}/regenerate`);
  return data;
}

export async function deleteAssignment(id: string): Promise<void> {
  await api.delete(`/api/assignments/${id}`);
}

export async function uploadFile(
  file: File
): Promise<{ fileName: string; storedName: string; extractedText: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
