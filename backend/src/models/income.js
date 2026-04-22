import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Income = sequelize.define('Income', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
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
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
  scopes: {
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
          [Op.or]: [
            { title: { [Op.like]: `%${query}%` } },
            { note: { [Op.like]: `%${query}%` } }
          ]
        }
      };
    }
  }
});
