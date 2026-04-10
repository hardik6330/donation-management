import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const FRONTEND_URL = process.env.FRONTEND_URL;
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
export const REDIS_URL = process.env.REDIS_URL;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const JWT_SECRET = process.env.JWT_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const ADMIN_MOBILE = process.env.ADMIN_MOBILE;
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
export const DB_DIALECT = process.env.DB_DIALECT;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT;
export const ALLOWED_IPS = process.env.ALLOWED_IPS;
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_FROM = process.env.SMTP_FROM;
export const VITE_CLOUDINARY_CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME;
export const VITE_CLOUDINARY_API_KEY = process.env.VITE_CLOUDINARY_API_KEY;
export const VITE_CLOUDINARY_API_SECRET = process.env.VITE_CLOUDINARY_API_SECRET;
export const VITE_CLOUDINARY_UPLOAD_PRESET = process.env.VITE_CLOUDINARY_UPLOAD_PRESET;
export const VITE_FAST2SMS_API_KEY = process.env.VITE_FAST2SMS_API_KEY;




export const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: DB_PORT || 3306,
    dialect: DB_DIALECT || 'mysql',
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
    console.log('✅ MySQL connected successfully with Sequelize');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
};
