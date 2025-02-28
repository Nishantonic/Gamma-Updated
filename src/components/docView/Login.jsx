import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput'; 
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Both fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email.');
      return;
    }

    try {
      const response = await axios.post('https://presentaiapi.codesemic.com/api/auth/local', {
        identifier: email,
        password,
      });

      if (response.data.jwt) {
        toast.success("Login Successful!");
        
        localStorage.setItem('token', response.data.jwt);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setTimeout(() => {
          navigate('/home');
        }, 3000);
      } else {
        setErrorMessage(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error?.message || 'An error occurred during login.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage('Email is required to reset password.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email.');
      return;
    }

    try {
      await axios.post('https://presentaiapi.codesemic.com/api/auth/forgot-password', {
        email: email
      });
      
      toast.success("Password reset link has been sent to your email!");
      setForgotPassword('code');
    } catch (error) {
      setErrorMessage(error.response?.data?.error?.message || 'Failed to send reset email. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!resetCode || !newPassword || !confirmPassword) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      await axios.post('https://presentaiapi.codesemic.com/api/auth/reset-password', {
        password: newPassword,
        passwordConfirmation: confirmPassword,
        code: resetCode
      });
      
      toast.success("Password has been reset successfully!");
      setForgotPassword(false);
      
      // Clear the fields
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setErrorMessage(error.response?.data?.error?.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <>
      <div className='min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden'>
        <div className='max-w-lg h-100 mt-10 md:mt-28 mx-auto bg-white rounded-lg shadow-md border border-gray-200'>
          <div className='text-center py-8 border-b border-gray-200'>
            <h2 className='text-2xl font-semibold text-gray-800'>
              {!forgotPassword ? 'Login' : forgotPassword === 'code' ? 'Reset Password' : 'Forgot Password'}
            </h2>
          </div>

          <div className='px-10 py-8'>
            {!forgotPassword && (
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder='Enter your email'
                    className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                  />
                </div>

                {errorMessage && <p className="text-red-600 text-sm mb-4">{errorMessage}</p>}

                <button 
                  type='submit' 
                  className='w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 transition duration-150 ease-in-out'
                >
                  Login
                </button>
                
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={() => {
                      setForgotPassword('email');
                      setErrorMessage('');
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            )}

            {forgotPassword === 'email' && (
              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder='Enter your email'
                    className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {errorMessage && <p className="text-red-600 text-sm mb-4">{errorMessage}</p>}

                <button 
                  type='submit' 
                  className='w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 transition duration-150 ease-in-out'
                >
                  Send Reset Link
                </button>
                
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={() => {
                      setForgotPassword(false);
                      setErrorMessage('');
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {forgotPassword === 'code' && (
              <form onSubmit={handleResetPassword}>
                <div className="mb-4">
                  <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700 mb-1">Reset Code</label>
                  <input
                    id="reset-code"
                    type="text"
                    placeholder='Enter reset code from email'
                    className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <PasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <PasswordInput
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                  />
                </div>

                {errorMessage && <p className="text-red-600 text-sm mb-4">{errorMessage}</p>}

                <button 
                  type='submit' 
                  className='w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 transition duration-150 ease-in-out'
                >
                  Reset Password
                </button>
                
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={() => {
                      setForgotPassword(false);
                      setErrorMessage('');
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default Login;