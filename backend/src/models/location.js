import { DataTypes } from 'sequelize';
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
  indexes: [
    {
      unique: true,
      fields: ['name', 'type', 'parentId'],
      name: 'unique_location_per_parent'
    }
  ]
});
