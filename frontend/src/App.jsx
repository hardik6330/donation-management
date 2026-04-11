import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Home from './pages/Home';
import Donate from './pages/Donate';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLayout from './pages/admin/layout/AdminLayout';
import Dashboard from './pages/admin/components/dashboard';
import DonationList from './pages/admin/components/donations';
import DonorsList from './pages/admin/components/donors';
import GaushalaList from './pages/admin/components/gaushala';
import KathaList from './pages/admin/components/katha';
import CategoryList from './pages/admin/components/category';
import LocationList from './pages/admin/components/location';
import Profile from './pages/admin/components/profile/Profile';
import BapuScheduleList from './pages/admin/components/bapu-schedule';
import ExpenseList from './pages/admin/components/expense';
import SevakList from './pages/admin/components/sevak';
import KartalDhunList from './pages/admin/components/kartal-dhun';
import MandalList from './pages/admin/components/mandal';
import MandalMemberList from './pages/admin/components/mandal/MandalMemberList';
import MandalPaymentPage from './pages/admin/components/mandal/MandalPaymentPage';
import RoleList from './pages/admin/components/roles';
import SystemUserList from './pages/admin/components/system-users';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/donate" element={<Donate />} />
              <Route 
                path="/login" 
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <GuestRoute>
                    <Signup />
                  </GuestRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="donations" element={<DonationList />} />
                <Route path="donors" element={<DonorsList />} />
                <Route path="gaushala" element={<GaushalaList />} />
                <Route path="katha" element={<KathaList />} />
                <Route path="bapu-schedule" element={<BapuScheduleList />} />
                <Route path="expenses" element={<ExpenseList />} />
                <Route path="sevaks" element={<SevakList />} />
                <Route path="mandal" element={<MandalList />} />
                <Route path="mandal-members" element={<MandalMemberList />} />
                <Route path="mandal-payments" element={<MandalPaymentPage />} />
                <Route path="kartal-dhun" element={<KartalDhunList />} />
                <Route path="roles" element={<RoleList />} />
                <Route path="system-users" element={<SystemUserList />} />
                <Route path="profile" element={<Profile />} />
                <Route path="category" element={<CategoryList />} />
                <Route path="location" element={<LocationList />} />
              </Route>
            </Routes>
            <ToastContainer 
              position="top-center" 
              autoClose={3000} 
              transition={Slide}  
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
