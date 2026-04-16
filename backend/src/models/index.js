import { sequelize } from '../config/db.js';

// Import all models
import { User } from './user.js';
import { Role } from './role.js';
import { Donation } from './donation.js';
import { DonationInstallment } from './donationInstallment.js';
import { Location } from './location.js';
import { Category } from './category.js';
import { Gaushala } from './gaushala.js';
import { Katha } from './katha.js';
import { Expense } from './expense.js';
import { Sevak } from './sevak.js';
import { Mandal } from './mandal.js';
import { MandalMember } from './mandalMember.js';
import { MandalPayment } from './mandalPayment.js';
import { BapuSchedule } from './bapuSchedule.js';
import { KartalDhun } from './kartalDhun.js';
import { Notification } from './notification.js';
import { Announcement } from './announcement.js';

// ──────────────────────────────────────
// Associations
// ──────────────────────────────────────

// User <-> Role
User.belongsTo(Role, { as: 'role', foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Announcement associations
// No direct foreign key to allow both User and Sevak IDs
User.hasMany(Announcement, { foreignKey: 'userId', constraints: false });
Sevak.hasMany(Announcement, { foreignKey: 'userId', constraints: false });

Donation.hasMany(Notification, { foreignKey: 'donationId' });
Notification.belongsTo(Donation, { as: 'donation', foreignKey: 'donationId' });

// Location (self-referencing hierarchy: City > Taluka > Village)
Location.hasMany(Location, { as: 'children', foreignKey: 'parentId' });
Location.belongsTo(Location, { as: 'parent', foreignKey: 'parentId' });

// Donation associations
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

// Donation <-> DonationInstallment
Donation.hasMany(DonationInstallment, { as: 'installments', foreignKey: 'donationId' });
DonationInstallment.belongsTo(Donation, { as: 'donation', foreignKey: 'donationId' });

// Gaushala <-> Location
Location.hasMany(Gaushala, { foreignKey: 'locationId' });
Gaushala.belongsTo(Location, { as: 'location', foreignKey: 'locationId' });

// Katha <-> Location
Location.hasMany(Katha, { foreignKey: 'locationId' });
Katha.belongsTo(Location, { as: 'location', foreignKey: 'locationId' });

// Expense associations
Gaushala.hasMany(Expense, { foreignKey: 'gaushalaId' });
Expense.belongsTo(Gaushala, { as: 'gaushala', foreignKey: 'gaushalaId' });

Katha.hasMany(Expense, { foreignKey: 'kathaId' });
Expense.belongsTo(Katha, { as: 'katha', foreignKey: 'kathaId' });

// BapuSchedule <-> Location
Location.hasMany(BapuSchedule, { foreignKey: 'locationId' });
BapuSchedule.belongsTo(Location, { as: 'location', foreignKey: 'locationId' });

// KartalDhun <-> Location
KartalDhun.belongsTo(Location, { as: 'location', foreignKey: 'locationId' });

// Mandal <-> MandalMember <-> MandalPayment
Mandal.hasMany(MandalMember, { as: 'members', foreignKey: 'mandalId' });
MandalMember.belongsTo(Mandal, { as: 'mandal', foreignKey: 'mandalId' });

MandalMember.belongsTo(Location, { as: 'location', foreignKey: 'locationId' });

MandalMember.hasMany(MandalPayment, { as: 'payments', foreignKey: 'memberId' });
MandalPayment.belongsTo(MandalMember, { as: 'member', foreignKey: 'memberId' });

export {
  sequelize,
  User,
  Role,
  Donation,
  DonationInstallment,
  Location,
  Category,
  Gaushala,
  Katha,
  Expense,
  Sevak,
  Mandal,
  MandalMember,
  MandalPayment,
  BapuSchedule,
  KartalDhun,
  Notification,
  Announcement,
};
