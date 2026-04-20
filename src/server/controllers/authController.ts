import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Example credentials for testing
const EXAMPLE_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
};

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const validation = authSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: 'Validation failed', issues: validation.error.format() });
      }

      const { email, password } = validation.data;
      const user = await UserModel.create(email, password);
      
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.status(201).json({ token, user: { id: user.id, email: user.email } });
    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(400).json({ error: error.message || 'Failed to sign up' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Handle example credentials: auto-create if doesn't exist
      if (email === EXAMPLE_CREDENTIALS.email && password === EXAMPLE_CREDENTIALS.password) {
        let user = await UserModel.findByEmail(email);
        if (!user) {
          console.log('Creating example user...');
          user = await UserModel.create(email, password);
        }
        
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({ token, user: { id: user.id, email: user.email } });
      }

      const user = await UserModel.findByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.status(200).json({ token, user: { id: user.id, email: user.email } });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to log in' });
    }
  }
}