import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';

export const MandalMember = sequelize.define('MandalMember', {
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
    unique: 'unique_mandal_member_mobile',
    validate: {
      is: {
        args: /^\d+$/,
        msg: 'Mobile number must contain only digits'
      }
    }
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mandalId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Mandals',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
            { mobileNumber: { [Op.like]: `%${query}%` } },
            { city: { [Op.like]: `%${query}%` } }
          ]
        }
      };
    },
    city(cityName) {
      if (!cityName) return {};
      return {
        where: { city: { [Op.like]: `%${cityName}%` } }
      };
    },
    mandal(mandalId) {
      if (!mandalId) return {};
      return {
        where: { mandalId }
      };
    },
    active: {
      where: { isActive: true }
    },
    inactive: {
      where: { isActive: false }
    }
  }
});
