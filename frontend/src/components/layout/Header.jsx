import React from 'react';
import { Menu, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ setIsSidebarOpen }) => {
  const { user } = useAuth();
  const userName = user?.name || 'Admin';

  return (
    <header className="bg-white border-b border-gray-100 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/80">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800">{userName}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Administrator</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
