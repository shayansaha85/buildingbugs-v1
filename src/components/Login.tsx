import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Navbar from './navbar';
import apartment_img from './images/apartment.jpg';

export default function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(''); // Clear error when typing
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(''); // Clear error when typing
  };

  const handleRoleChange = (isAdminRole: boolean) => {
    setIsAdmin(isAdminRole);
    setEmail(''); // Clear email input
    setPassword(''); // Clear password input
    setError(''); // Clear error when switching roles
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      navigate('/buildings');
    } catch (error: any) {
      setError('Invalid credentials');
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      <Navbar />
      <div 
        className="h-full flex items-center justify-center bg-cover bg-center bg-no-repeat bg-black/5"
        style={{ backgroundImage: `url(${apartment_img})` }}
      >
        <div className="max-w-md w-full space-y-8 p-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
          <div className="text-center">
            {isAdmin ? (
              <Lock className="mx-auto h-12 w-12 text-red-800" />
            ) : (
              <User className="mx-auto h-12 w-12 text-indigo-600" />
            )}
            
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {isAdmin ? 'Admin Login' : 'Customer Login'}
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={() => handleRoleChange(false)}
                className={`px-4 py-2 rounded-md ${
                  !isAdmin
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange(true)}
                className={`px-4 py-2 rounded-md ${
                  isAdmin
                    ? 'bg-red-800 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Admin
              </button>
            </div>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  User ID
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="User ID"
                />
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isAdmin 
                  ? 'bg-red-800 hover:bg-red-900 focus:ring-red-500'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              Sign in
            </button>
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}