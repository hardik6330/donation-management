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
  // indexes: [
  //   { fields: ['name'] },
  //   { fields: ['mobileNumber'] },
  //   { fields: ['email'] },
  //   { fields: ['isAdmin'] },
  //   { fields: ['createdAt'] },
  // ]
});
