'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore } from '@/store/assignmentStore';

export function useAssignmentSocket(assignmentId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const { setJobProgress, updateAssignmentStatus, loadPaper } = useAssignmentStore();

  useEffect(() => {
    if (!assignmentId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(apiUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join:assignment', assignmentId);
    });

    socket.on('job:progress', (data: { progress: number; message: string }) => {
      setJobProgress({ progress: data.progress, message: data.message });
      updateAssignmentStatus(assignmentId, 'processing');
    });

    socket.on('job:completed', (data: { progress: number; paperId: string }) => {
      setJobProgress({ progress: 100, message: 'Question paper ready!' });
      updateAssignmentStatus(assignmentId, 'completed');
      loadPaper(assignmentId);
    });

    socket.on('job:failed', (data: { error: string }) => {
      setJobProgress({ progress: 0, message: `Generation failed: ${data.error}` });
      updateAssignmentStatus(assignmentId, 'failed');
    });

    return () => {
      socket.emit('leave:assignment', assignmentId);
      socket.disconnect();
    };
  }, [assignmentId, setJobProgress, updateAssignmentStatus, loadPaper]);

  return socketRef;
}
