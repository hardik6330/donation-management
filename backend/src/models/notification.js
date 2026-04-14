import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  donationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Donations',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'partial_payment_reminder',
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed', 'cancelled'),
    defaultValue: 'pending',
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastError: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['scheduledAt'] },
    { fields: ['userId'] },
    { fields: ['donationId'] },
  ],
});
