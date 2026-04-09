  import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import animalRoutes from './src/routes/animalRoutes';
import clientRoutes from './src/routes/clientRoutes';
import rentalRoutes from './src/routes/rentalRoutes';
import healthRoutes from './src/routes/healthRoutes';
import userRoutes from './src/routes/userRoutes';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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
      message: err.message || 'Internal Server Error',
      details: err.details || null,
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
