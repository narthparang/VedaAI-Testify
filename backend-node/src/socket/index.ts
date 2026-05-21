import { Server as SocketServer } from 'socket.io';

let io: SocketServer | null = null;

export function setIO(server: SocketServer): void {
  io = server;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function emitToAssignment(
  assignmentId: string,
  event: string,
  data: Record<string, unknown>
): void {
  if (!io) return;
  io.to(`assignment:${assignmentId}`).emit(event, data);
}
