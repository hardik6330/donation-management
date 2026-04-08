import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Gaushala = sequelize.define('Gaushala', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_gaushala_name',
  },
  locationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Locations',
      key: 'id',
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

import { Location } from './location.js';
Location.hasMany(Gaushala, { foreignKey: 'locationId' });
Gaushala.belongsTo(Location, { as: 'location', foreignKey: 'locationId' });
