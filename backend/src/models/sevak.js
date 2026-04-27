import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Sevak = sequelize.define('Sevak', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_sevak_mobile',
    validate: {
      is: {
        args: /^\d+$/,
        msg: 'Mobile number must contain only digits'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Please enter a valid email address'
      }
    },
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'India',
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
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query}%` } },
            { mobileNumber: { [Op.like]: `%${query}%` } }
          ]
        }
      };
    },
    location(city, state) {
      const where = {};
      if (city) where.city = { [Op.like]: `%${city}%` };
      if (state) where.state = { [Op.like]: `%${state}%` };
      return { where };
    }
  }
});
