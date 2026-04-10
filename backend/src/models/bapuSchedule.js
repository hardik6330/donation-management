import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const BapuSchedule = sequelize.define('BapuSchedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  locationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Locations',
      key: 'id',
    },
  },
  eventType: {
    type: DataTypes.ENUM('Padhramani', 'Katha', 'Event', 'Personal'),
    defaultValue: 'Event',
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
    defaultValue: 'scheduled',
  }
}, {
  timestamps: true,
});

import { Location } from './location.js';
Location.hasMany(BapuSchedule, { foreignKey: 'locationId' });
BapuSchedule.belongsTo(Location, { as: 'location', foreignKey: 'locationId' });
