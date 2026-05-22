import { Worker, Job } from 'bullmq';
import { GENERATION_QUEUE } from '../config/queue';
import { createRedisConnection } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { generatePaper } from '../services/aiService';
import { emitToAssignment } from '../socket';

export interface GenerationJobData {
  assignmentId: string;
}

async function processJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId } = job.data;

  emitToAssignment(assignmentId, 'job:progress', {
    progress: 10,
    message: 'Starting question paper generation...',
  });

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

  await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });

  emitToAssignment(assignmentId, 'job:progress', {
    progress: 30,
    message: 'Preparing prompt and contacting AI...',
  });

  const paperData = await generatePaper({
    subject: assignment.subject,
    className: assignment.className,
    schoolName: assignment.schoolName,
    questionTypes: assignment.questionTypes,
    additionalInstructions: assignment.additionalInstructions,
    sourceText: assignment.extractedText,
  });

  emitToAssignment(assignmentId, 'job:progress', {
    progress: 80,
    message: 'Structuring and saving question paper...',
  });

  const paper = await GeneratedPaper.create({
    assignmentId: assignment._id,
    ...paperData,
  });

  await Assignment.findByIdAndUpdate(assignmentId, {
    status: 'completed',
    generatedPaperId: paper._id,
  });

  emitToAssignment(assignmentId, 'job:completed', {
    progress: 100,
    paperId: paper._id.toString(),
    assignmentId,
  });
}

export function startWorker(): Worker<GenerationJobData> {
  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE,
    processJob,
    { connection: createRedisConnection() }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed for assignment ${job.data.assignmentId}`);
  });

  worker.on('failed', async (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
    if (job?.data.assignmentId) {
      await Assignment.findByIdAndUpdate(job.data.assignmentId, {
        status: 'failed',
        errorMessage: err.message,
      });
      emitToAssignment(job.data.assignmentId, 'job:failed', {
        error: err.message,
      });
    }
  });

  console.log('BullMQ generation worker started');
  return worker;
}
