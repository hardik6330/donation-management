import React from 'react';
import { Users, Settings } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const Profile = () => {
  const { user: authUser } = useAuth();
  const user = authUser || { name: 'Administrator' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Profile</h1>
        <p className="text-sm text-gray-500 font-medium">Manage your personal account and security settings</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-2xl shadow-lg border-4 border-white">
            <div className="w-24 h-24 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Users className="w-12 h-12" />
            </div>
          </div>
        </div>
        
        <div className="pt-16 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500 font-medium">{user.email}</p>
              <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role?.name || user.role || 'Administrator'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6 mt-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Mobile Number</p>
              <p className="text-gray-700 font-semibold">{user.mobileNumber || user.mobile || '7845124512'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Account Created</p>
              <p className="text-gray-700 font-semibold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '07/04/2026'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
