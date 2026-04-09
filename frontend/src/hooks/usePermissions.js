import { useMemo } from 'react';

/**
 * Custom hook to manage and check user permissions across the application.
 */
const usePermissions = () => {
  const user = useMemo(() => JSON.parse(localStorage.getItem('user')) || {}, []);
  const perms = useMemo(() => user.role?.permissions || {}, [user]);

  /**
   * Check if the current user has required permission level for a module.
   * @param {string} module - Module name (e.g., 'donations', 'expenses', 'users')
   * @param {string} level - Required level: 'view' | 'entry' | 'full'
   * @returns {boolean}
   */
  const hasPermission = (module, level = 'view') => {
    const userPerm = perms[module];
    const levels = { none: 0, view: 1, entry: 2, full: 3 };

    // 1. If permission is explicitly set in the role, respect it (even if user is admin)
    if (userPerm !== undefined) {
      if (userPerm === 'none') return false;
      return (levels[userPerm] || 0) >= (levels[level] || 0);
    }

    // 2. Fallback to isAdmin if no specific permission is defined for the module
    return user.isAdmin || false;
  };

  return {
    hasPermission,
    user,
    roleName: user.role?.name || 'No Role',
    isAdmin: user.isAdmin || false
  };
};

export default usePermissions;
