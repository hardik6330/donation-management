import { DataTypes, Op } from 'sequelize';
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
  scopes: {
    dateRange(startDate, endDate) {
      if (startDate && endDate) {
        return { where: { date: { [Op.between]: [startDate, endDate] } } };
      } else if (startDate) {
        return { where: { date: { [Op.gte]: startDate } } };
      }
      return {};
    },
    eventType(type) {
      if (!type) return {};
      return { where: { eventType: type } };
    },
    status(status) {
      if (!status) return {};
      return { where: { status } };
    },
    location(city, state, country) {
      const where = {};
      if (city) where['$location.name$'] = { [Op.like]: `%${city}%` };
      if (state) where['$location.parent.name$'] = { [Op.like]: `%${state}%` };
      if (country) where['$location.parent.parent.name$'] = { [Op.like]: `%${country}%` };
      return { where };
    }
  }
});
