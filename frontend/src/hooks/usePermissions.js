import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to manage and check user permissions across the application.
 */
const usePermissions = () => {
  const { user } = useAuth();
  const perms = useMemo(() => user?.role?.permissions || {}, [user]);

  /**
   * Check if the current user has required permission level for a module.
   * @param {string} module - Module name (e.g., 'donations', 'expenses', 'users')
   * @param {string} level - Required level: 'view' | 'entry' | 'full'
   * @returns {boolean}
   */
  const hasPermission = (module, level = 'view') => {
    const levels = { none: 0, view: 1, entry: 2, full: 3 };

    // 1. Regular User or Admin: Check explicit module permission first
    const userPerm = perms[module];
    if (userPerm !== undefined) {
      if (userPerm === 'none') return false;
      return (levels[userPerm] || 0) >= (levels[level] || 0);
    }

    // 2. If no specific permission is defined for the module, then fallback to isAdmin
    return user?.isAdmin || false;
  };

  return {
    hasPermission,
    user,
    roleName: user.role?.name || 'No Role',
    isAdmin: user.isAdmin || false
  };
};

export default usePermissions;
