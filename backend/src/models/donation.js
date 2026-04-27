import { DataTypes, Op } from 'sequelize';
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
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'partially_paid', 'pay_later'),
    defaultValue: 'pending',
  },
  paymentMode: {
    type: DataTypes.ENUM('online', 'cash', 'cheque'),
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
  donationDate: {
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
  slipNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  scopes: {
    byGaushala(gaushalaId) {
      return gaushalaId ? { where: { gaushalaId } } : {};
    },
    byKatha(kathaId) {
      return kathaId ? { where: { kathaId } } : {};
    },
    byCategory(categoryId) {
      return categoryId ? { where: { categoryId } } : {};
    },
    byStatus(status) {
      if (!status) return {};
      return { where: { status } };
    },
    byDateRange(start, end) {
      if (!start && !end) return {};
      const where = {};
      if (start && end) {
        where.createdAt = { [Op.between]: [new Date(start), new Date(new Date(end).setHours(23, 59, 59, 999))] };
      } else if (start) {
        where.createdAt = { [Op.gte]: new Date(start) };
      } else if (end) {
        where.createdAt = { [Op.lte]: new Date(new Date(end).setHours(23, 59, 59, 999)) };
      }
      return { where };
    },
    byAmountRange(min, max) {
      if (!min && !max) return {};
      const where = {};
      if (min && max) {
        where.amount = { [Op.between]: [Number(min), Number(max)] };
      } else if (min) {
        where.amount = { [Op.gte]: Number(min) };
      } else if (max) {
        where.amount = { [Op.lte]: Number(max) };
      }
      return { where };
    },
    searchDonor(query) {
      if (!query) return {};
      return {
        where: {
          [Op.or]: [
            { '$donor.name$': { [Op.like]: `%${query}%` } },
            { '$donor.email$': { [Op.like]: `%${query}%` } },
            { '$donor.mobileNumber$': { [Op.like]: `%${query}%` } }
          ]
        }
      };
    },
    byDonorLocation(city, state, country) {
      if (!city && !state && !country) return {};
      const where = {};
      if (city) where['$donor.city$'] = { [Op.like]: `%${city}%` };
      if (state) where['$donor.state$'] = { [Op.like]: `%${state}%` };
      if (country) where['$donor.country$'] = { [Op.like]: `%${country}%` };
      return { where };
    }
  },
  indexes: [
    { fields: ['status'] },
    { fields: ['donorId'] },
    { fields: ['categoryId'] },
    { fields: ['gaushalaId'] },
    { fields: ['kathaId'] },
    { fields: ['createdAt'] },
    { fields: ['paymentDate'] },
  ]
});
