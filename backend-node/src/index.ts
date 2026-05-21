import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import { connectDatabase } from './config/database';
import { setIO } from './socket';
import { startWorker } from './workers/generationWorker';
import assignmentsRouter from './routes/assignments';
import uploadRouter from './routes/upload';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
].filter(Boolean);

const io = new SocketServer(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
});

setIO(io);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

app.use('/api/assignments', assignmentsRouter);
app.use('/api/upload', uploadRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

io.on('connection', (socket) => {
  socket.on('join:assignment', (assignmentId: string) => {
    socket.join(`assignment:${assignmentId}`);
  });
  socket.on('leave:assignment', (assignmentId: string) => {
    socket.leave(`assignment:${assignmentId}`);
  });
});

async function bootstrap(): Promise<void> {
  await connectDatabase();
  startWorker();

  const port = parseInt(process.env.PORT || '3001', 10);
  httpServer.listen(port, () => {
    console.log(`VedaAI backend running on http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
