import fs from 'fs/promises';
import path from 'path';
import { TaskType } from '../controllers/automationController';

const LOGS_FILE = path.join(process.cwd(), 'logs.json');

interface LogsData {
  tasks: TaskType[];
}

/**
 * Initialize logs file if it doesn't exist
 */
async function initializeLogsFile(): Promise<void> {
  try {
    await fs.access(LOGS_FILE);
  } catch {
    // File doesn't exist, create it
    const initialData: LogsData = { tasks: [] };
    await fs.writeFile(LOGS_FILE, JSON.stringify(initialData, null, 2));
  }
}

/**
 * Read tasks from logs file
 */
export async function getTasks(): Promise<TaskType[]> {
  try {
    await initializeLogsFile();
    const data = await fs.readFile(LOGS_FILE, 'utf-8');
    const logsData: LogsData = JSON.parse(data);
    return logsData.tasks || [];
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
}

/**
 * Save a task to logs file
 */
export async function saveTask(task: TaskType): Promise<void> {
  try {
    await initializeLogsFile();
    const tasks = await getTasks();
    
    // Check if task already exists and update it, otherwise add new task
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
    
    const logsData: LogsData = { tasks };
    await fs.writeFile(LOGS_FILE, JSON.stringify(logsData, null, 2));
  } catch (error) {
    console.error('Error saving task:', error);
    throw new Error('Failed to save task');
  }
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<TaskType | undefined> {
  const tasks = await getTasks();
  return tasks.find(task => task.id === id);
}

/**
 * Get tasks by status
 */
export async function getTasksByStatus(status: TaskType['status']): Promise<TaskType[]> {
  const tasks = await getTasks();
  return tasks.filter(task => task.status === status);
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<boolean> {
  try {
    const tasks = await getTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === tasks.length) {
      return false; // Task not found
    }
    
    const logsData: LogsData = { tasks: filteredTasks };
    await fs.writeFile(LOGS_FILE, JSON.stringify(logsData, null, 2));
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}