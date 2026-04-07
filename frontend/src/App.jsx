import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Donate from './pages/Donate';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLayout from './pages/admin/layout/AdminLayout';
import Dashboard from './pages/admin/components/Dashboard';
import DonationList from './pages/admin/components/DonationList';
import DonorsList from './pages/admin/components/DonorsList';
import CategoryList from './pages/admin/components/CategoryList';
import LocationList from './pages/admin/components/LocationList';
import Profile from './pages/admin/components/Profile';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="donations" element={<DonationList />} />
            <Route path="donors" element={<DonorsList />} />
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
  );
}

export default App;
