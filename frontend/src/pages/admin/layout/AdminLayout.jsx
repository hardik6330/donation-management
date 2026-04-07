import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onLogout={handleLogout} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="pb-10">
            <Outlet />
          </div>
        </main>

        <footer className="bg-white border-t border-gray-100 p-4 sm:px-8 text-center sm:text-left shrink-0">
          <p className="text-xs sm:text-sm text-gray-500">
            © {new Date().getFullYear()} Donation Management System. Built with ❤️ for community support.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
