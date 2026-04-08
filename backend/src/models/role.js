import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_role_name',
  },
  permissions: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '{}',
    get() {
      const raw = this.getDataValue('permissions');
      if (!raw) return {};
      if (typeof raw === 'object') return raw;
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    },
    set(val) {
      this.setDataValue('permissions', typeof val === 'string' ? val : JSON.stringify(val));
    },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});
