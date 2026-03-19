import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import animalRoutes from './src/routes/animalRoutes';
import clientRoutes from './src/routes/clientRoutes';
import rentalRoutes from './src/routes/rentalRoutes';
import healthRoutes from './src/routes/healthRoutes';
import userRoutes from './src/routes/userRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());

  // API Routes
  app.use('/api/animals', animalRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/rentals', rentalRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/users', userRoutes);

  // Health check
  app.get('/api/health-check', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      details: err.details || null,
    });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
