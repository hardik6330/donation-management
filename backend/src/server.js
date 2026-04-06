import express from 'express';
import cluster from 'cluster';
import os from 'os';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB, sequelize } from './config/db.js';
import routes from './routes/index.js';
import { ipAuth } from './middlewares/ipAuth.middleware.js';
import { sendError } from './utils/apiResponse.js';
import { seedAdmin } from './controllers/userController.js';

// Load env vars
dotenv.config();

const numCPUs = os.cpus().length;

// Initialize Database
const initDB = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized');
    await seedAdmin();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
if (process.env.NODE_ENV !== 'production' && cluster.isPrimary) {
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
  if (process.env.NODE_ENV === 'production') {
    initDB();
  }
  
  app.listen(port, () => {
    console.log(`👷 Process ${process.pid} started and running at http://localhost:${port}`);
  });
}

// Export the app for Vercel
export default app;
