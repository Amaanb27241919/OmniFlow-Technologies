/**
 * Generate a unique ID for tasks
 */
export function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Validate task type
 */
export function isValidTaskType(type: string): boolean {
  const validTypes = ['summarize', 'rewrite', 'audit', 'generate-copy', 'insights'];
  return validTypes.includes(type);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Calculate execution time
 */
export function calculateExecutionTime(startTime: Date, endTime: Date): number {
  return endTime.getTime() - startTime.getTime();
}