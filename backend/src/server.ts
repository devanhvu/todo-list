import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/prisma.js';
import todoRouter from './routes/todo.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './config/logger.js';

// Load .env FIRST — before any module reads process.env
dotenv.config();

async function startServer() {
  logger.info('Starting TaskFlow API server...');

  // Verify database connection on startup
  try {
    await prisma.$connect();
    logger.info('Database connected successfully via Prisma.');
  } catch (err: any) {
    logger.error(`Failed to connect to database: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }

  const app = express();
  const PORT = parseInt(process.env.PORT || '3001', 10);

  // Request logger middleware
  app.use((req, _res, next) => {
    logger.http(`${req.method} ${req.originalUrl}`);
    next();
  });

  // ── Middlewares ────────────────────────────────────────────────
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Routes ─────────────────────────────────────────────────────
  app.use('/api', todoRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // ── Global Error Handler (must be last) ────────────────────────
  app.use(errorHandler);

  // ── Start ──────────────────────────────────────────────────────
  app.listen(PORT, '0.0.0.0', () => {
    logger.info('============================================');
    logger.info(`TaskFlow API  →  http://localhost:${PORT}`);
    logger.info(`Todos         →  http://localhost:${PORT}/api/todos`);
    logger.info(`Stats         →  http://localhost:${PORT}/api/stats`);
    logger.info('============================================');
  });
}

startServer().catch((err: any) => {
  logger.error(`Fatal server error: ${err.message}`, { stack: err.stack });
  process.exit(1);
});
