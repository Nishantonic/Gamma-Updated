import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput'; // Assuming you have a separate PasswordInput component
import { toast, ToastContainer } from 'react-toastify';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignup = (e) => {
    e.preventDefault();


    if (!name || !email || !password) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email.');
      return;
    }

    console.log('Signup form submitted:', { name, email, role, password });

    
    toast.success("Account created Successfully!")
    setTimeout(()=>{
        navigate("/home")
    },3000)
  };

  return (
    <>
    <div className='min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-700 to-cyan-500 overflow-hidden'>
      <div className='max-w-lg h-100 mt-10 md:mt-10 mx-auto bg-cyan-100 rounded-lg shadow-lg'>
        <div className='text-center py-10 text-2xl font-semibold'>
          <h2>Create Account</h2>
        </div>

        <div className='px-10 py-10'>
          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder='User-Name'
              className=' w-full rounded-full bg-cyan-600/5 px-5 py-3 mb-3'
              value={name}
              onChange={(e) => setName(e.target.value)}  // Capture user name input
              required
            />
            <input
              type="email"
              placeholder='Email'
              className=' w-full rounded-full bg-cyan-600/5 px-5 py-3 mb-3'
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
              CREATE ACCOUNT
            </button>

            <p className="text-xs text-slate-500 text-center my-4">Or</p>

            <button
              type='button'
              onClick={() => navigate('/login')}
              className='w-full rounded-full bg-cyan-400 px-1 py-3 mb-10'>
              LOGIN
            </button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
</>
  );
};

export default SignUp;
