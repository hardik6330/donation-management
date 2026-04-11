import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TableSkeleton from '../common/TableSkeleton';

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="p-8">
        <TableSkeleton rows={10} />
      </div>
    );
  }

  if (isAuthenticated) {
    // If user is admin, redirect to admin dashboard, else to home
    const from = location.state?.from?.pathname || (user?.isAdmin ? '/admin/dashboard' : '/');
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestRoute;
