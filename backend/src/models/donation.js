import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './user.js';

export const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  cause: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  razorpay_order_id: {
    type: DataTypes.STRING,
  },
  razorpay_payment_id: {
    type: DataTypes.STRING,
  },
  razorpay_signature: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});

// Associations
User.hasMany(Donation, { foreignKey: 'donorId' });
Donation.belongsTo(User, { as: 'donor', foreignKey: 'donorId' });
