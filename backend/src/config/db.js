import { Sequelize } from 'sequelize';
import {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_DIALECT,
  NODE_ENV
} from './env.js';

export const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully with Sequelize');
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
    process.exit(1);
  }
};

// Initialize Database logic
let dbInitialized = false;
let dbInitPromise = null;

export const initDB = async (force = false) => {
  // 1. Return immediately if already initialized
  if (dbInitialized && !force) {
    return { initialized: true };
  }

  // 2. Return the existing promise if initialization is already in progress
  if (dbInitPromise && !force) {
    return dbInitPromise;
  }

  // 3. Start initialization and store the promise
  dbInitPromise = (async () => {
    try {
      // Dynamic imports to avoid circular dependencies
      const { seedAdmin } = await import('../utils/seeders/admin.seeder.js');
      const { seedRoles } = await import('../utils/seeders/roles.seeder.js');

      await connectDB();
      
      // Always sync tables in development, or if forced. 
      // In production, we still sync if tables don't exist (Sequelize default behavior).
      const shouldSync = NODE_ENV !== 'production' || process.env.FORCE_DB_SYNC === 'true';
      
      if (shouldSync) {
        await sequelize.sync({ alter: false });
        console.log('Database synchronized');
      } else {
        // In production, just sync without alter to ensure tables exist
        await sequelize.sync();
        console.log('Database sync check completed');
      }

      // Always run seeders to ensure basic roles and admin exist
      await seedRoles();
      await seedAdmin();
      
      dbInitialized = true;
      return { initialized: true };
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    } finally {
      // Clear the promise so it can be retried if it failed, 
      // but keep dbInitialized true if it succeeded.
      dbInitPromise = null;
    }
  })();

  return dbInitPromise;
};

export const isDBInitialized = () => dbInitialized;
