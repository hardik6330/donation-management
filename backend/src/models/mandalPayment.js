import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { MandalMember } from './mandalMember.js';

export const MandalPayment = sequelize.define('MandalPayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  memberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'MandalMembers',
      key: 'id'
    }
  },
  month: {
    type: DataTypes.STRING(7),
    allowNull: false,
    validate: {
      is: /^\d{4}-\d{2}$/
    }
  },
  amount: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  status: {
    type: DataTypes.ENUM('paid', 'unpaid'),
    defaultValue: 'unpaid',
  },
  paidDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['memberId', 'month']
    }
  ]
});

MandalPayment.belongsTo(MandalMember, { as: 'member', foreignKey: 'memberId' });
MandalMember.hasMany(MandalPayment, { as: 'payments', foreignKey: 'memberId' });
