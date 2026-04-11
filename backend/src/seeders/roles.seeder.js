import { Role } from '../models/index.js';

const MODULES = ['dashboard', 'donations', 'donors', 'expenses', 'sevaks', 'gaushala', 'katha', 'mandal', 'kartalDhun', 'bapuSchedule', 'category', 'location', 'users'];

export const seedRoles = async () => {
  try {
    const existing = await Role.findAll();
    const rolesToSeed = ['Admin', 'Manager', 'Entry Operator'];
    const existingNames = existing.map(r => r.name);
    
    const needsReseed = existing.length === 0 || 
                       rolesToSeed.some(name => !existingNames.includes(name)) ||
                       existing.some(r => !r.permissions || typeof r.permissions !== 'object' || r.permissions['0'] !== undefined);
    
    if (!needsReseed) return;

    const fullPerms = {};
    MODULES.forEach(m => { fullPerms[m] = 'full'; });

    const adminRole = await Role.findOne({ where: { name: 'Admin' } });
    if (!adminRole) {
      await Role.create({ name: 'Admin', permissions: fullPerms, description: 'Full access to all modules' });
    }

    const managerRole = await Role.findOne({ where: { name: 'Manager' } });
    if (!managerRole) {
      const managerPerms = { ...fullPerms, users: 'view' };
      await Role.create({ name: 'Manager', permissions: managerPerms, description: 'Manage all modules, view users' });
    }

    const operatorRole = await Role.findOne({ where: { name: 'Entry Operator' } });
    if (!operatorRole) {
      const operatorPerms = {};
      MODULES.forEach(m => {
        if (['dashboard', 'donors'].includes(m)) operatorPerms[m] = 'view';
        else if (['users', 'category', 'location'].includes(m)) operatorPerms[m] = 'none';
        else operatorPerms[m] = 'entry';
      });
      await Role.create({ name: 'Entry Operator', permissions: operatorPerms, description: 'Data entry with limited access' });
    }

    console.log('✅ Default roles checked/seeded');
  } catch (error) {
    console.error('❌ Error seeding roles:', error.message);
  }
};
