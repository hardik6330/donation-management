import { Location, User, Role, Mandal, Gaushala } from '../models/index.js';

const LOCATION_PARENT_ATTRS = ['id', 'name', 'type'];

/**
 * Build a recursive Location.parent include chain.
 * depth=1 → parent only. depth=2 → parent → grandparent. depth=3 → +great-grandparent.
 */
export const locationParentInclude = (depth = 2, attributes = LOCATION_PARENT_ATTRS) => {
  let node = null;
  for (let i = 0; i < depth; i++) {
    const next = { model: Location, as: 'parent', attributes };
    if (node) next.include = [node];
    node = next;
  }
  return node;
};

export const donorInclude = (
  attributes = ['name', 'email', 'mobileNumber', 'city', 'state', 'country']
) => ({ model: User, as: 'donor', attributes });

export const roleInclude = (attributes = ['id', 'name']) => ({
  model: Role,
  as: 'role',
  attributes,
});

export const mandalInclude = (attributes = ['id', 'name']) => ({
  model: Mandal,
  as: 'mandal',
  attributes,
});

export const gaushalaWithLocationInclude = () => ({
  model: Gaushala,
  as: 'gaushala',
  include: [{ model: Location, as: 'location' }],
});
