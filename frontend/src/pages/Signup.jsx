import React, { useState } from 'react';
import { useRegisterMutation } from '../services/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Loader2, ArrowRight, Phone } from 'lucide-react';
import { toast } from 'react-toastify';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
  });
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Limit mobile number to 10 digits and allow only numbers
    if (name === 'mobileNumber') {
      const cleaned = value.replace(/\D/g, ''); // Remove non-digits
      if (cleaned.length > 10) return; // Prevent more than 10 digits
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData).unwrap();
      toast.success('Signup Successful!');
      navigate('/');
    } catch (err) {
      const errorMsg = err?.data?.message || 'Signup failed';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-4 sm:p-6 text-white text-center">
          <h1 className="text-xl sm:text-2xl font-bold">Create an Account</h1>
          <p className="text-sm opacity-90">Join our community and manage your contributions</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Mobile Number
              </label>
              <input
                required
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="9876543210"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 rounded-lg shadow-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="p-6 sm:p-8 pt-0 text-center text-xs sm:text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Login now
          </Link>
        </div>

        <div className="pb-6 sm:pb-8 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 text-[10px] sm:text-xs">
            Back to Home <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
