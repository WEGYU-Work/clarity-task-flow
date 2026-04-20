import { Response } from 'express';
import { TaskModel } from '../models/Task.js';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware.js';

// Input validation schema using Zod
const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100)
});

const updateTaskSchema = z.object({
  status: z.enum(['pending', 'completed']).optional(),
  title: z.string().min(3).max(100).optional()
});

export class TaskController {
  static async getTasks(req: AuthRequest, res: Response) {
    try {
      const { page, limit, search, status, sortBy, sortOrder } = req.query;
      const userId = req.user!.id;
      
      const results = await TaskModel.getAll({
        page: page ? parseInt(String(page)) : undefined,
        limit: limit ? parseInt(String(limit)) : undefined,
        search: typeof search === 'string' ? search : undefined,
        status: typeof status === 'string' ? status : undefined,
        sortBy: typeof sortBy === 'string' ? sortBy : undefined,
        sortOrder: (sortOrder === 'asc' || sortOrder === 'desc') ? sortOrder : 'desc',
        userId
      });

      res.status(200).json(results);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
    }
  }

  static async createTask(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      // Validate input
      const validation = createTaskSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          issues: validation.error.format() 
        });
      }

      const newTask = await TaskModel.create(validation.data.title, userId);
      res.status(201).json(newTask);
    } catch (error: any) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task', details: error.message });
    }
  }

  static async updateTask(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      const validation = updateTaskSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          issues: validation.error.format() 
        });
      }

      if (Object.keys(validation.data).length === 0) {
        return res.status(400).json({ error: 'No update data provided' });
      }

      const updatedTask = await TaskModel.update(id as string, validation.data, userId);
      if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
      
      res.status(200).json(updatedTask);
    } catch (error: any) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task', details: error.message });
    }
  }

  static async deleteTask(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      await TaskModel.delete(id as string, userId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task', details: error.message });
    }
  }
}