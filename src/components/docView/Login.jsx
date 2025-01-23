import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput'; 
import { toast, ToastContainer } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Both fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email.');
      return;
    }


    console.log('Login form submitted:', { email, password });


    toast.success("Login Successful!");
    setTimeout(() => {
      navigate('/page');  
    }, 3000);
  };

  return (
    <>
      <div className='min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-700 to-cyan-500 overflow-hidden'>
        <div className='max-w-lg h-100 mt-10 md:mt-28 mx-auto bg-cyan-100 rounded-lg shadow-lg'>
          <div className='text-center py-10 text-2xl font-semibold'>
            <h2>Login</h2>
          </div>

          <div className='px-10 py-10'>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder='Email'
                className='w-full rounded-full bg-cyan-600/5 px-5 py-3 mb-3'
                value={email}
                onChange={(e) => setEmail(e.target.value)}  // Capture email input
                required
              />

              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}  // Capture password input
                required
              />

              {errorMessage && <p className="text-red-600 text-xs pb-1">{errorMessage}</p>}

              <button type='submit' className='w-full rounded-full bg-cyan-600 px-1 py-3'>
                LOGIN
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default Login;
