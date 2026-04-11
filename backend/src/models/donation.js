import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  cause: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'partially_paid'),
    defaultValue: 'pending',
  },
  paymentMode: {
    type: DataTypes.ENUM('online', 'cash', 'pay_later', 'cheque', 'partially_paid'),
    defaultValue: 'online',
    allowNull: false,
  },
  paidAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: null,
  },
  remainingAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: null,
  },
  razorpay_order_id: {
    type: DataTypes.STRING,
  },
  razorpay_payment_id: {
    type: DataTypes.STRING,
  },
  razorpay_signature: {
    type: DataTypes.STRING,
  },
  locationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Locations',
      key: 'id',
    },
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id',
    },
  },
  gaushalaId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Gaushalas',
      key: 'id',
    },
  },
  kathaId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Kathas',
      key: 'id',
    },
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  referenceName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  slipUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  // indexes: [
  //   { fields: ['status'] },
  //   { fields: ['donorId'] },
  //   { fields: ['locationId'] },
  //   { fields: ['categoryId'] },
  //   { fields: ['createdAt'] },
  //   { fields: ['paymentDate'] },
  //   { fields: ['razorpay_order_id'] },
  // ]
});
