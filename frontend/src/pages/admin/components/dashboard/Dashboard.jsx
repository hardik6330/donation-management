import React from 'react';
import { useGetAdminStatsQuery } from '../../../../services/donationApi';
import { Users, IndianRupee, CreditCard, Trophy, Loader2, HandCoins } from 'lucide-react';
import Reports from '../reports/Reports';
import { useAuth } from '../../../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const userName = user?.name || 'Administrator';

  console.log('Dashboard User:', user);
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };
  
  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery();

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-semibold animate-pulse uppercase tracking-widest text-xs">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-blue-600 p-8 rounded-2xl text-white relative overflow-hidden shadow-xl shadow-blue-200">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl font-bold mb-2">{getGreeting()}, {userName}</h2>
          <p className="opacity-90 text-sm leading-relaxed">Manage your Shree Sarveshwar Gaudham donations, track donors, and organize your categories and locations with ease. Your hard work makes our community stronger.</p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12">
          <HandCoins className="w-64 h-64" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer group">
          <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition">
            <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Total Collection</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">₹{stats?.data?.totalDonationAmount?.toLocaleString() || 0}</h3>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer group">
                <div className="p-3 sm:p-4 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Total Donations</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.data?.totalDonationCount || 0}</h3>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer group">
                <div className="p-3 sm:p-4 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Unique Donors</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.data?.totalUsers || 0}</h3>
                </div>
              </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer group overflow-hidden">
          <div className="p-3 sm:p-4 bg-yellow-50 text-yellow-600 rounded-xl group-hover:scale-110 transition shrink-0">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Top Donor</p>
            {stats?.data?.topDonor ? (
              <div className="truncate">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">{stats.data.topDonor.name}</h3>
                <p className="text-[10px] sm:text-xs font-bold text-orange-600">₹{stats.data.topDonor.amount?.toLocaleString()}</p>
              </div>
            ) : (
              <h3 className="text-base sm:text-lg font-bold text-gray-400">N/A</h3>
            )}
          </div>
        </div>
      </div>

      {/* Custom Reports Section */}
      <div className="mt-8 border-t border-gray-100 pt-8">
        <Reports />
      </div>
    </div>
  );
};

export default Dashboard;
