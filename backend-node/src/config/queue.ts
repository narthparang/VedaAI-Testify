import { Queue } from 'bullmq';
import { createRedisConnection } from './redis';

export const GENERATION_QUEUE = 'paper-generation';

let generationQueue: Queue | null = null;

export function getGenerationQueue(): Queue {
  if (!generationQueue) {
    generationQueue = new Queue(GENERATION_QUEUE, {
      connection: createRedisConnection(),
    });
  }
  return generationQueue;
}
