import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';

export const ExpenseCategory = sequelize.define('ExpenseCategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_expense_category_name',
  },
}, {
  timestamps: true,
  scopes: {
    search(query) {
      if (!query) return {};
      return { where: { name: { [Op.like]: `%${query}%` } } };
    },
  },
});
