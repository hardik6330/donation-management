import express from 'express';
import cluster from 'cluster';
import os from 'os';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB, sequelize } from './config/db.js';
import routes from './routes/index.js';
import { ipAuth } from './middlewares/ipAuth.middleware.js';
import { sendError } from './utils/apiResponse.js';
import { seedAdmin } from './controllers/userController.js';
import { NODE_ENV, FRONTEND_URL,PORT } from './config/db.js';
// Load env vars

const numCPUs = os.cpus().length;

// Initialize Database
let dbInitialized = false;
let dbInitPromise = null;

const initDB = async () => {
  if (dbInitialized) return;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      await connectDB();
      // In production, only create missing tables (no ALTER to avoid deadlocks on serverless)
      // In development, alter: true to auto-apply model changes
      const syncOptions = NODE_ENV === 'production' ? {} : { alter: true };
      await sequelize.sync(syncOptions);
      console.log('✅ Database synchronized (Tables created/updated)');
      await seedAdmin();
      dbInitialized = true;
      dbInitPromise = null;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      dbInitPromise = null;
      throw error;
    }
  })();

  return dbInitPromise;
};

const app = express();
const port = PORT || 5000;

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
  if (req.path !== '/' && !dbInitialized) {
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
  res.send('test complte server running');
});

// IP Whitelisting Middleware
app.use(ipAuth);

// Routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  return sendError(res, 'Route not found', 404);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  return sendError(res, 'Something broke!', 500, err);
});

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
