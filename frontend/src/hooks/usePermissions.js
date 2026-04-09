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
    if (user.isAdmin) return true;
    
    const userPerm = perms[module];
    if (!userPerm || userPerm === 'none') return false;

    const levels = { none: 0, view: 1, entry: 2, full: 3 };
    return (levels[userPerm] || 0) >= (levels[level] || 0);
  };

  return {
    hasPermission,
    user,
    roleName: user.role?.name || 'No Role',
    isAdmin: user.isAdmin || false
  };
};

export default usePermissions;
