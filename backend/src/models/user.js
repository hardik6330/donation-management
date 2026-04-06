import { DataTypes } from 'sequelize';
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
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  mobileNumber: {
    type: DataTypes.STRING,
    unique: {
      msg: 'Mobile number already in use'
    },
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Mobile number is required' },
      len: {
        args: [10, 10],
        msg: 'Mobile number must be exactly 10 digits'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  village: {
    type: DataTypes.STRING,
  },
  district: {
    type: DataTypes.STRING,
  },
  companyName: {
    type: DataTypes.STRING,
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
});
