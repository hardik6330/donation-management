import { sendSuccess } from './apiResponse.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound } from './httpError.js';

/**
 * Generates standard CRUD handlers (getById, create, update, remove) for a model.
 * For list/getAll and anything with custom logic (FK checks, virtual fields, scopes),
 * write the handler by hand and only pull in what you need.
 *
 * Usage:
 *   const crud = createCRUDController({ Model: Role, name: 'Role' });
 *   router.get('/:id',    crud.getById);
 *   router.post('/',      crud.create);
 *   router.put('/:id',    crud.update);
 *   router.delete('/:id', crud.remove);
 */
export const createCRUDController = ({ Model, name }) => ({
  getById: asyncHandler(async (req, res) => {
    const record = await Model.findByPk(req.params.id);
    if (!record) throw notFound(name);
    return sendSuccess(res, record, `${name} fetched successfully`);
  }),

  create: asyncHandler(async (req, res) => {
    const record = await Model.create(req.body);
    return sendSuccess(res, record, `${name} created successfully`, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const record = await Model.findByPk(req.params.id);
    if (!record) throw notFound(name);
    await record.update(req.body);
    return sendSuccess(res, record, `${name} updated successfully`);
  }),

  remove: asyncHandler(async (req, res) => {
    const record = await Model.findByPk(req.params.id);
    if (!record) throw notFound(name);
    await record.destroy();
    return sendSuccess(res, null, `${name} deleted successfully`);
  }),
});
