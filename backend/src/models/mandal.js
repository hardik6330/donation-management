import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Mandal = sequelize.define('Mandal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
  mandalType: {
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
          name: { [Op.like]: `%${query}%` }
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
