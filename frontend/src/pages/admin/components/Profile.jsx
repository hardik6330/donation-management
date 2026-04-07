import React from 'react';
import { Users, Settings } from 'lucide-react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Administrator' };

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
                {user.role || 'Administrator'}
              </span>
            </div>
            <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-lg text-sm transition border border-gray-200">
              Edit Profile
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6 mt-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Mobile Number</p>
              <p className="text-gray-700 font-semibold">{user.mobileNumber || user.mobile || 'Not provided'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Account Created</p>
              <p className="text-gray-700 font-semibold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex gap-4 items-start">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl shrink-0">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-orange-900 mb-1">Security Settings</h4>
          <p className="text-sm text-orange-700 leading-relaxed mb-4">Update your password regularly to keep your admin account secure.</p>
          <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-sm transition shadow-lg shadow-orange-200">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
