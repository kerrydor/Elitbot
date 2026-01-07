/** Broadcast queue system with rate limiting and retry handling */
import TelegramBot from 'node-telegram-bot-api';
import { logger } from './logger';

interface BroadcastJob {
  userId: number;
  message: string;
  retries: number;
  maxRetries: number;
}

interface BroadcastQueue {
  jobs: BroadcastJob[];
  isProcessing: boolean;
  batchSize: number;
  delayBetweenBatches: number;
  delayBetweenMessages: number;
}

class BroadcastQueueManager {
  private queue: BroadcastQueue = {
    jobs: [],
    isProcessing: false,
    batchSize: 25, // Send 25 messages per batch (under Telegram's 30/sec limit)
    delayBetweenBatches: 1000, // 1 second between batches
    delayBetweenMessages: 50, // 50ms between individual messages
  };

  private sendMessageFn?: (userId: number, message: string) => Promise<void>;

  /**
   * Add broadcast jobs to queue
   */
  addJobs(userIds: number[], message: string, maxRetries: number = 3): void {
    const jobs: BroadcastJob[] = userIds.map(userId => ({
      userId,
      message,
      retries: 0,
      maxRetries,
    }));
    
    this.queue.jobs.push(...jobs);
    logger.info(`Added ${jobs.length} broadcast jobs to queue`);
    
    // Start processing if not already running
    if (!this.queue.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process the broadcast queue
   */
  private async processQueue(): Promise<void> {
    if (this.queue.isProcessing || this.queue.jobs.length === 0) {
      return;
    }

    if (!this.sendMessageFn) {
      logger.error('Send message function not set. Cannot process queue.');
      return;
    }

    this.queue.isProcessing = true;
    logger.info(`Starting to process ${this.queue.jobs.length} broadcast jobs`);

    while (this.queue.jobs.length > 0) {
      // Get batch of jobs
      const batch = this.queue.jobs.splice(0, this.queue.batchSize);
      
      // Process batch
      await this.processBatch(batch);
      
      // Delay between batches if there are more jobs
      if (this.queue.jobs.length > 0) {
        await this.delay(this.queue.delayBetweenBatches);
      }
    }

    this.queue.isProcessing = false;
    logger.info('Broadcast queue processing completed');
  }

  /**
   * Process a batch of jobs
   */
  private async processBatch(batch: BroadcastJob[]): Promise<void> {
    const promises = batch.map(job => this.sendMessage(job));
    await Promise.allSettled(promises);
  }

  /**
   * Send message to a user (with retry logic)
   */
  private async sendMessage(job: BroadcastJob): Promise<void> {
    if (!this.sendMessageFn) {
      logger.error('Send message function not set');
      return;
    }

    try {
      await this.sendMessageFn(job.userId, job.message);
      logger.debug(`Successfully sent broadcast to user ${job.userId}`);
    } catch (error: any) {
      logger.error(`Failed to send broadcast to user ${job.userId}`, error);
      
      // Retry logic
      if (job.retries < job.maxRetries) {
        job.retries++;
        logger.info(`Retrying broadcast to user ${job.userId} (attempt ${job.retries}/${job.maxRetries})`);
        
        // Exponential backoff
        await this.delay(1000 * Math.pow(2, job.retries));
        
        // Re-add to queue
        this.queue.jobs.push(job);
      } else {
        logger.warn(`Max retries reached for user ${job.userId}`);
      }
    }
    
    // Small delay between messages
    await this.delay(this.queue.delayBetweenMessages);
  }

  /**
   * Set the send message function (injected by broadcast handler)
   */
  setSendMessageFunction(
    fn: (userId: number, message: string) => Promise<void>
  ): void {
    this.sendMessageFn = fn;
  }

  /**
   * Get queue status
   */
  getStatus(): { pending: number; processing: boolean } {
    return {
      pending: this.queue.jobs.length,
      processing: this.queue.isProcessing,
    };
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue.jobs = [];
    logger.info('Broadcast queue cleared');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const broadcastQueue = new BroadcastQueueManager();

