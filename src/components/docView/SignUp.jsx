import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email.');
      return;
    }

    try {
      const response = await axios.post('https://presentaiapi.codesemic.com/api/auth/local/register', {
        username: name,
        email: email,
        password: password,
      });

      if (response.data.jwt) {
        toast.success('Account created successfully!');
        localStorage.setItem('token', response.data.jwt);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setTimeout(() => {
          navigate('/home');
        }, 3000);
      } else {
        setErrorMessage(response.data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error?.message || 'An error occurred during signup.');
    }
  };

  return (
    <>
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
        <div className="max-w-lg h-100 mt-10 md:mt-28 mx-auto bg-white rounded-lg shadow-md border border-gray-200">
          <div className="text-center py-8 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800">Create Account</h2>
          </div>

          <div className="px-10 py-8">
            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {errorMessage && <p className="text-red-600 text-sm mb-4">{errorMessage}</p>}

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 transition duration-150 ease-in-out"
              >
                Create Account
              </button>

              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">Already have an account? </span>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default SignUp;