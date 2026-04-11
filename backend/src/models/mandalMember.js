import { DataTypes } from 'sequelize';
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
      len: {
        args: [10, 10],
        msg: 'Mobile number must be exactly 10 digits'
      }
    }
  },
  mandalId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Mandals',
      key: 'id'
    }
  },
  locationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Locations',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});
