import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_category_name',
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  scopes: {
    search(query) {
      if (!query) return {};
      return {
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } }
          ]
        }
      };
    },
    active: {
      where: { isActive: true }
    },
    inactive: {
      where: { isActive: false }
    }
  }
});
