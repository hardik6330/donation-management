import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';

export const KartalDhun = sequelize.define('KartalDhun', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  locationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Locations',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
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
    dateRange(startDate, endDate) {
      if (startDate && endDate) {
        return { where: { date: { [Op.between]: [startDate, endDate] } } };
      } else if (startDate) {
        return { where: { date: { [Op.gte]: startDate } } };
      } else if (endDate) {
        return { where: { date: { [Op.lte]: endDate } } };
      }
      return {};
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
