import { DataTypes, Op } from 'sequelize';
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
  scopes: {
    byCategory(category) {
      return category ? { where: { category } } : {};
    },
    byDateRange(start, end) {
      if (!start && !end) return {};
      const where = {};
      if (start && end) where.date = { [Op.between]: [start, end] };
      else if (start) where.date = { [Op.gte]: start };
      else if (end) where.date = { [Op.lte]: end };
      return { where };
    },
    search(query) {
      if (!query) return {};
      return {
        where: {
          description: { [Op.like]: `%${query}%` }
        }
      };
    }
  }
});
