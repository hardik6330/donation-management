import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './user.js';
import { Location } from './location.js';
import { Category } from './category.js';
import { Gaushala } from './gaushala.js';
import { Katha } from './katha.js';

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
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  paymentMode: {
    type: DataTypes.ENUM('online', 'cash', 'pay_later'),
    defaultValue: 'online',
    allowNull: false,
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

// Associations
User.hasMany(Donation, { foreignKey: 'donorId' });
Donation.belongsTo(User, { as: 'donor', foreignKey: 'donorId' });

Location.hasMany(Donation, { foreignKey: 'locationId' });
Donation.belongsTo(Location, { as: 'location', foreignKey: 'locationId' });

Category.hasMany(Donation, { foreignKey: 'categoryId' });
Donation.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

Gaushala.hasMany(Donation, { foreignKey: 'gaushalaId' });
Donation.belongsTo(Gaushala, { as: 'gaushala', foreignKey: 'gaushalaId' });

Katha.hasMany(Donation, { foreignKey: 'kathaId' });
Donation.belongsTo(Katha, { as: 'katha', foreignKey: 'kathaId' });
