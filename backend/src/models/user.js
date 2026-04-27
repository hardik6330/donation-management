import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: 'users_email_unique',
    validate: {
      isEmailOrEmpty(value) {
        if (value && value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error('Must be a valid email address');
        }
      },
    },
  },
  mobileNumber: {
    type: DataTypes.STRING,
    unique: 'users_mobile_unique',
    allowNull: true,
    validate: {
      isTenDigits(value) {
        if (value && value.trim() !== '' && !/^\d{10}$/.test(value)) {
          throw new Error('Mobile number must be exactly 10 digits');
        }
      }
    }
  },
  password: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.STRING,
  },
  country: {
    type: DataTypes.STRING,
  },
  companyName: {
    type: DataTypes.STRING,
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Roles',
      key: 'id'
    }
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_by: {
    type: DataTypes.STRING,
    defaultValue: 'System',
  },
}, {
  timestamps: true,
  scopes: {
    donor: {
      where: { isAdmin: false }
    },
    admin: {
      where: { isAdmin: true }
    },
    all: {
      where: {}
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
    location(city, state, country) {
      const where = {};
      if (city) where.city = { [Op.like]: `%${city}%` };
      if (state) where.state = { [Op.like]: `%${state}%` };
      if (country) where.country = { [Op.like]: `%${country}%` };
      return { where };
    }
  },
  indexes: [
    { fields: ['name'] },
    { fields: ['mobileNumber'] },
    { fields: ['email'] },
    { fields: ['city'] },
    { fields: ['state'] },
    { fields: ['isAdmin'] },
    { fields: ['createdAt'] },
  ]
});
