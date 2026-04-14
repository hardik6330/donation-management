import express from 'express';
import cluster from 'cluster';
import os from 'os';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initDB, isDBInitialized } from './config/db.js';
import './models/index.js'; // Register all models & associations before sync
import routes from './routes/index.js';
import { ipAuth } from './middlewares/ipAuth.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { sendError } from './utils/apiResponse.js';
import { NODE_ENV, FRONTEND_URL, PORT } from './config/env.js';
// Load env vars

const numCPUs = os.cpus().length;

const app = express();
const port = PORT || 5000;

// Correct client IP behind reverse proxies (e.g. Vercel) for rate limiting
app.set('trust proxy', 1);

// Start DB Initialization in background immediately on cold start
initDB().catch(err => console.error('Background DB Init Error:', err));

// Middlewares
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL || '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy load DB on first request for serverless (Only if background init hasn't finished)
app.use(async (req, res, next) => {
  // Only wait for DB on non-root routes to keep health checks fast
  if (req.path !== '/' && !isDBInitialized()) {
    try {
      await initDB();
    } catch (error) {
      return sendError(res, 'Database initialization failed', 500);
    }
  }
  next();
});

// Root route (Moved above ipAuth for public health check/load testing)
app.get('/', (req, res) => {
  res.send('test complete server running');
});

// IP Whitelisting Middleware
app.use(ipAuth);

// Routes
app.use('/api/v1', apiLimiter);
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  return sendError(res, 'Route not found', 404);
});

// Error handler
app.use(errorHandler);

// Only use clustering in local/non-serverless environments
if (NODE_ENV !== 'production' && cluster.isPrimary) {
  console.log(`🚀 Primary process ${process.pid} is running`);
  
  initDB().then(() => {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  });

  cluster.on('exit', (worker) => {
    console.log(`⚠️ Worker ${worker.process.pid} died. Forking a new one...`);
    cluster.fork();
  });
} else {
  // In Vercel or worker processes
  app.listen(port, () => {
    console.log(`👷 Process ${process.pid} started and running at http://localhost:${port}`);
  });
}

// Export the app for Vercel
export default app;
