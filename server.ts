import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from './models/User';
import { Simulation } from './models/Simulation';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'abe-bypass-secret-key-2026';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abe-bypass';

async function startServer() {
  const app = express();
 const PORT = parseInt(process.env.PORT || '3000', 10);

  // Connect to MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  // --- Auth Routes ---
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const user = new User({ email, password, name });
      await user.save();

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user: any = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- Simulation Routes ---
  app.get('/api/simulations', authenticateToken, async (req: any, res) => {
    try {
      const simulations = await Simulation.find({ userId: req.user.id }).sort({ timestamp: -1 });
      res.json(simulations);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/simulations', authenticateToken, async (req: any, res) => {
    try {
      const { name, description, riskLevel, result, logs } = req.body;
      const simulation = new Simulation({
        userId: req.user.id,
        name,
        description,
        riskLevel,
        result,
        logs,
      });
      await simulation.save();
      res.status(201).json(simulation);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/simulations/:id', authenticateToken, async (req: any, res) => {
    try {
      const simulation = await Simulation.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
      if (!simulation) return res.status(404).json({ message: 'Simulation not found' });
      res.json({ message: 'Simulation deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
