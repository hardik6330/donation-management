import React from 'react';
import { useGetQRCodeQuery } from '../services/apiSlice';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Home = () => {
  const { data, isLoading, error } = useGetQRCodeQuery();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-4 sm:mb-5">
          <img src={logo} alt="Shree Sarveshwar Gaudham" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Donate for Shree Sarveshwar Gaudham</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Scan the QR code to make a donation and support our community.</p>

        <div className="relative inline-block p-4 bg-gray-100 rounded-xl mb-6 sm:mb-8 w-full sm:w-auto">
          {isLoading ? (
            <div className="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center mx-auto">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center text-red-500 mx-auto">
              Error loading QR Code
            </div>
          ) : (
            <img src={data?.data?.qrCodeData} alt="Donation QR Code" className="w-48 h-48 sm:w-64 sm:h-64 mx-auto" />
          )}
        </div>

        <div className="space-y-6">
          <p className="text-sm text-gray-500 italic">Scan with your phone camera or any UPI app</p>
          
          <div className="flex flex-col gap-3">
            <Link 
              to="/donate" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2"
            >
              Donate Now <ArrowRight className="w-5 h-5" />
            </Link>
            
            <div className="flex items-center justify-center gap-4 mt-2">
              <Link to="/login" className="text-sm text-blue-600 hover:underline font-medium">
                Admin Login
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/signup" className="text-sm text-blue-600 hover:underline font-medium">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
