import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Katha = sequelize.define('Katha', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  locationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Locations',
      key: 'id',
    },
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'active', 'completed'),
    defaultValue: 'upcoming',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  scopes: {
    byStatus(status) {
      return status ? { where: { status } } : {};
    },
    search(query) {
      if (!query) return {};
      return {
        where: {
          name: { [Op.like]: `%${query}%` }
        }
      };
    },
    location(city, state, country) {
      const where = {};
      if (city) where['$location.name$'] = { [Op.like]: `%${city}%` };
      if (state) where['$location.parent.name$'] = { [Op.like]: `%${state}%` };
      if (country) where['$location.parent.parent.name$'] = { [Op.like]: `%${country}%` };
      return { where };
    }
  },
  indexes: [
    { fields: ['name'] },
    { fields: ['locationId'] },
    { fields: ['status'] },
    { fields: ['startDate'] },
    { fields: ['endDate'] },
  ]
});
