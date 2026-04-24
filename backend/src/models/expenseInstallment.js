import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const ExpenseInstallment = sequelize.define('ExpenseInstallment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  expenseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Expenses',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  paymentMode: {
    type: DataTypes.ENUM('cash', 'online', 'check'),
    allowNull: false,
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['expenseId'] },
    { fields: ['paymentDate'] },
  ]
});
