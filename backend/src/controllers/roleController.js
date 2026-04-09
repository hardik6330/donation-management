import { Role } from '../models/role.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const MODULES = ['dashboard', 'donations', 'donors', 'expenses', 'sevaks', 'gaushala', 'katha', 'mandal', 'kartalDhun', 'bapuSchedule', 'category', 'location', 'users'];

// Seed default roles
export const seedRoles = async () => {
  try {
    // Check if roles exist and permissions are valid
    const existing = await Role.findAll();
    
    // Define standard roles
    const rolesToSeed = ['Admin', 'Manager', 'Entry Operator'];
    
    // Check if we need to seed
    const existingNames = existing.map(r => r.name);
    const needsReseed = existing.length === 0 || 
                       rolesToSeed.some(name => !existingNames.includes(name)) ||
                       existing.some(r => !r.permissions || typeof r.permissions !== 'object' || r.permissions['0'] !== undefined);
    
    if (!needsReseed) return;

    const fullPerms = {};
    MODULES.forEach(m => { fullPerms[m] = 'full'; });

    // 1. Admin (Full access) - Only create if not exists
    const adminRole = await Role.findOne({ where: { name: 'Admin' } });
    if (!adminRole) {
      await Role.create({ name: 'Admin', permissions: fullPerms, description: 'Full access to all modules' });
    }

    // 2. Manager - Only create if not exists
    const managerRole = await Role.findOne({ where: { name: 'Manager' } });
    if (!managerRole) {
      const managerPerms = { ...fullPerms, users: 'view' };
      await Role.create({ name: 'Manager', permissions: managerPerms, description: 'Manage all modules, view users' });
    }

    // 3. Entry Operator - Only create if not exists
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

export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({ order: [['name', 'ASC']] });
    return sendSuccess(res, roles);
  } catch (error) {
    return sendError(res, 'Failed to fetch roles', 500, error);
  }
};

export const addRole = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;
    if (!name) return sendError(res, 'Role name is required', 400);

    const role = await Role.create({
      name,
      permissions: permissions || {},
      description
    });
    return sendSuccess(res, role, 'Role created successfully', 201);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 'Role with this name already exists', 400);
    }
    return sendError(res, 'Failed to create role', 500, error);
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) return sendError(res, 'Role not found', 404);

    await role.update(req.body);
    return sendSuccess(res, role, 'Role updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update role', 500, error);
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) return sendError(res, 'Role not found', 404);

    await role.destroy();
    return sendSuccess(res, null, 'Role deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete role', 500, error);
  }
};
