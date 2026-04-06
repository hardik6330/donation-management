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

if (cluster.isPrimary) {
  console.log(`🚀 Primary process ${process.pid} is running`);

  // Connect and sync DB only once in primary process
  const initDB = async () => {
    await connectDB();
    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized');
    await seedAdmin();
  };

  initDB().then(() => {
    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} died. Forking a new one...`);
    cluster.fork();
  });
} else {
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

  app.listen(port, () => {
    console.log(`👷 Worker ${process.pid} started and running at http://localhost:${port}`);
  });
}
