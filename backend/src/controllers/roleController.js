import { Role } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.findAll({ order: [['name', 'ASC']] });
  return sendSuccess(res, roles, 'All roles records fetched successfully');
});

export const addRole = asyncHandler(async (req, res) => {
  const { name, permissions, description } = req.body;

  const role = await Role.create({
    name,
    permissions: permissions || {},
    description
  });
  return sendSuccess(res, role, 'Role created successfully', 201);
});

export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await Role.findByPk(id);
  if (!role) {
    const error = new Error('Role not found');
    error.statusCode = 404;
    throw error;
  }

  await role.update(req.body);
  return sendSuccess(res, role, 'Role updated successfully');
});

export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await Role.findByPk(id);
  if (!role) {
    const error = new Error('Role not found');
    error.statusCode = 404;
    throw error;
  }

  await role.destroy();
  return sendSuccess(res, null, 'Role deleted successfully');
});
