import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  HandCoins, 
  Users, 
  Tags, 
  MapPin, 
  LogOut,
  X,
  UserCircle
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'donations', label: 'Donation List', icon: HandCoins, path: '/admin/donations' },
    { id: 'donors', label: 'Donors', icon: Users, path: '/admin/donors' },
    { id: 'category', label: 'Category', icon: Tags, path: '/admin/category' },
    { id: 'location', label: 'Location', icon: MapPin, path: '/admin/location' },
  ];

  const profileItem = { id: 'profile', label: 'Profile', icon: UserCircle, path: '/admin/profile' };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-50 transition-transform duration-300 w-64 flex flex-col shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-30
      `}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
              <HandCoins className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-gray-800 text-lg tracking-tight">Admin Panel</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:bg-gray-100 p-1 rounded-md transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section: Divider + Profile + Logout */}
        <div className="mt-auto shrink-0 pb-6">
          <div className="mx-4 border-t border-gray-100 mb-4 opacity-60"></div>
          
          <div className="px-4 space-y-2">
            {/* Profile Link */}
            <NavLink
              to={profileItem.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
              `}
            >
              {({ isActive }) => (
                <>
                  <profileItem.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {profileItem.label}
                </>
              )}
            </NavLink>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
