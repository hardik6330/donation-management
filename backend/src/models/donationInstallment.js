import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const DonationInstallment = sequelize.define('DonationInstallment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  donationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Donations',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  paymentMode: {
    type: DataTypes.ENUM('online', 'cash', 'cheque'),
    allowNull: false,
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
});
