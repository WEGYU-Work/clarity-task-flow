import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables for consistency across server entry points
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

let tasks: Task[] = [
  {
    id: uuidv4(),
    title: 'Explore the Task Manager',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Learn how to use Framer Motion',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  
  const newTask: Task = {
    id: uuidv4(),
    title,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  tasks.unshift(newTask);
  res.status(201).json(newTask);
});

app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
  
  tasks[taskIndex] = { ...tasks[taskIndex], status };
  res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});