import { Role } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createCRUDController } from '../utils/createCRUDController.js';

const crud = createCRUDController({ Model: Role, name: 'Role' });

export const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.findAll({ order: [['name', 'ASC']] });
  return sendSuccess(res, roles, 'All roles records fetched successfully');
});

export const addRole = asyncHandler(async (req, res) => {
  const { name, permissions, description } = req.body;
  const role = await Role.create({
    name,
    permissions: permissions || {},
    description,
  });
  return sendSuccess(res, role, 'Role created successfully', 201);
});

export const updateRole = crud.update;
export const deleteRole = crud.remove;
