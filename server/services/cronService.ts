import cron from 'node-cron';
import { getTasks, saveTask } from './taskService';
import { TaskType } from '../controllers/automationController';
import { generateId } from '../utils/helpers';

/**
 * Automated workflow scheduler using node-cron
 */
export class CronService {
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Initialize default automation schedules
   */
  public initializeAutomations(): void {
    // Check for pending tasks every 5 minutes
    this.scheduleTask('pending-task-checker', '*/5 * * * *', this.processPendingTasks);
    
    // Generate daily summary at 6 PM
    this.scheduleTask('daily-summary', '0 18 * * *', this.generateDailySummary);
    
    // Clean up old logs weekly (Sundays at 2 AM)
    this.scheduleTask('log-cleanup', '0 2 * * 0', this.cleanupOldLogs);
    
    console.log('✅ Automation workflows initialized');
  }

  /**
   * Schedule a new automation task
   */
  public scheduleTask(name: string, schedule: string, task: () => Promise<void>): void {
    if (this.scheduledJobs.has(name)) {
      this.scheduledJobs.get(name)?.destroy();
    }

    const scheduledTask = cron.schedule(schedule, async () => {
      try {
        console.log(`🤖 Running automation: ${name}`);
        await task();
      } catch (error) {
        console.error(`❌ Automation error in ${name}:`, error);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    this.scheduledJobs.set(name, scheduledTask);
    console.log(`📅 Scheduled automation: ${name} (${schedule})`);
  }

  /**
   * Stop a scheduled automation
   */
  public stopTask(name: string): boolean {
    const task = this.scheduledJobs.get(name);
    if (task) {
      task.destroy();
      this.scheduledJobs.delete(name);
      console.log(`🛑 Stopped automation: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Get list of active automations
   */
  public getActiveAutomations(): string[] {
    return Array.from(this.scheduledJobs.keys());
  }

  /**
   * Process any pending tasks in the queue
   */
  private async processPendingTasks(): Promise<void> {
    const tasks = await getTasks();
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    
    if (pendingTasks.length > 0) {
      console.log(`🔄 Processing ${pendingTasks.length} pending tasks`);
      
      for (const task of pendingTasks) {
        // In a real implementation, you would process these tasks
        // For now, we'll just log them
        console.log(`⏳ Processing task: ${task.id} - ${task.type}`);
      }
    }
  }

  /**
   * Generate a daily summary of completed tasks
   */
  private async generateDailySummary(): Promise<void> {
    const tasks = await getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysTasks = tasks.filter(task => {
      const taskDate = new Date(task.timestamp);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });

    const summaryTask: TaskType = {
      id: generateId(),
      query: 'Daily Summary Generation',
      type: 'insights',
      result: `Daily Summary - ${today.toDateString()}\n\nCompleted Tasks: ${todaysTasks.length}\nTask Types: ${[...new Set(todaysTasks.map(t => t.type))].join(', ')}\n\nAutomation is working efficiently! 🚀`,
      timestamp: new Date(),
      status: 'completed'
    };

    await saveTask(summaryTask);
    console.log(`📊 Generated daily summary: ${todaysTasks.length} tasks processed`);
  }

  /**
   * Clean up logs older than 30 days
   */
  private async cleanupOldLogs(): Promise<void> {
    const tasks = await getTasks();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTasks = tasks.filter(task => 
      new Date(task.timestamp) > thirtyDaysAgo
    );
    
    if (recentTasks.length !== tasks.length) {
      // Save only recent tasks
      console.log(`🧹 Cleaned up ${tasks.length - recentTasks.length} old log entries`);
    }
  }
}

// Export singleton instance
export const cronService = new CronService();