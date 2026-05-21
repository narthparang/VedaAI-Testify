import { Router, Request, Response } from 'express';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { getGenerationQueue } from '../config/queue';
import { getRedisClient } from '../config/redis';

const router = Router();

// GET /api/assignments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 }).lean();
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    res.json(assignment);
  } catch {
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// GET /api/assignments/:id/paper
router.get('/:id/paper', async (req: Request, res: Response) => {
  try {
    // Try Redis cache first
    const redis = getRedisClient();
    const cacheKey = `paper:${req.params.id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    if (!assignment.generatedPaperId) {
      res.status(404).json({ error: 'Paper not generated yet', status: assignment.status });
      return;
    }

    const paper = await GeneratedPaper.findById(assignment.generatedPaperId).lean();
    if (!paper) {
      res.status(404).json({ error: 'Generated paper not found' });
      return;
    }

    // Cache for 30 minutes
    await redis.setex(cacheKey, 1800, JSON.stringify(paper));
    res.json(paper);
  } catch {
    res.status(500).json({ error: 'Failed to fetch paper' });
  }
});

// POST /api/assignments
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      subject,
      className,
      schoolName,
      dueDate,
      questionTypes,
      additionalInstructions,
      uploadedFileName,
      extractedText,
    } = req.body;

    if (!dueDate || !questionTypes?.length) {
      res.status(400).json({ error: 'dueDate and questionTypes are required' });
      return;
    }

    for (const qt of questionTypes) {
      if (!qt.type || qt.count < 1 || qt.marksPerQuestion < 1) {
        res.status(400).json({ error: 'Invalid question type: count and marks must be ≥ 1' });
        return;
      }
    }

    const assignment = await Assignment.create({
      subject: subject || '',
      className: className || '',
      schoolName: schoolName || '',
      dueDate: new Date(dueDate),
      questionTypes,
      additionalInstructions: additionalInstructions || '',
      uploadedFileName: uploadedFileName || '',
      extractedText: extractedText || '',
      status: 'pending',
    });

    const queue = getGenerationQueue();
    const job = await queue.add('generate', { assignmentId: assignment._id.toString() });

    await Assignment.findByIdAndUpdate(assignment._id, { jobId: job.id });

    res.status(201).json({ assignmentId: assignment._id.toString(), jobId: job.id });
  } catch (err) {
    console.error('Create assignment error:', err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// POST /api/assignments/:id/regenerate
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    // Invalidate cache
    const redis = getRedisClient();
    await redis.del(`paper:${req.params.id}`);

    await Assignment.findByIdAndUpdate(req.params.id, {
      status: 'pending',
      generatedPaperId: undefined,
      errorMessage: undefined,
    });

    const queue = getGenerationQueue();
    const job = await queue.add('generate', { assignmentId: req.params.id });
    await Assignment.findByIdAndUpdate(req.params.id, { jobId: job.id });

    res.json({ jobId: job.id, message: 'Regeneration queued' });
  } catch {
    res.status(500).json({ error: 'Failed to queue regeneration' });
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    if (assignment.generatedPaperId) {
      await GeneratedPaper.findByIdAndDelete(assignment.generatedPaperId);
      const redis = getRedisClient();
      await redis.del(`paper:${req.params.id}`);
    }
    res.json({ message: 'Assignment deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

export default router;
