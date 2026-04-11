import React, { useState } from 'react';
import { useLoginMutation } from '../services/apiSlice';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMutation, { isLoading }] = useLoginMutation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginMutation({ email, password }).unwrap();
      login(result.data.user, result.data.accessToken);
      toast.success('Login Successful!');
    } catch (err) {
      const errorMsg = err?.data?.message || 'Login failed';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-sm sm:text-base text-gray-600">Login to manage your donations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 rounded-lg shadow-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            Sign up now
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 text-xs">
            Back to Home <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
