import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Food', 'Medicine', 'Maintenance', 'Salary', 'Utility', 'Other'),
    allowNull: false,
    defaultValue: 'Other',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  gaushalaId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Gaushalas',
      key: 'id',
    },
  },
  kathaId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Kathas',
      key: 'id',
    },
  },
  paymentMode: {
    type: DataTypes.ENUM('cash', 'online', 'check'),
    defaultValue: 'cash',
  }
}, {
  timestamps: true,
});

import { Gaushala } from './gaushala.js';
import { Katha } from './katha.js';
Gaushala.hasMany(Expense, { foreignKey: 'gaushalaId' });
Expense.belongsTo(Gaushala, { as: 'gaushala', foreignKey: 'gaushalaId' });
Katha.hasMany(Expense, { foreignKey: 'kathaId' });
Expense.belongsTo(Katha, { as: 'katha', foreignKey: 'kathaId' });
