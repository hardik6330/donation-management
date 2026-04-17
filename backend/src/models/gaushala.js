import { DataTypes, Op } from 'sequelize';
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
  scopes: {
    active: {
      where: { isActive: true }
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
  }
});
