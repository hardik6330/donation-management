import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('country', 'state', 'city'),
    allowNull: false,
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Locations',
      key: 'id',
    },
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
    type(typeName) {
      if (!typeName) return {};
      return {
        where: { type: typeName }
      };
    },
    parent(parentId) {
      if (!parentId) return {};
      return {
        where: { parentId }
      };
    }
  },
  indexes: [
    {
      unique: true,
      fields: ['name', 'type', 'parentId'],
      name: 'unique_location_per_parent'
    }
  ]
});
