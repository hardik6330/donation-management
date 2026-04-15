import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  templateName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  variables: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed'),
    defaultValue: 'sent',
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'whatsapp',
  },
  sentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['mobileNumber'] },
    { fields: ['status'] },
    { fields: ['sentAt'] },
  ],
});
