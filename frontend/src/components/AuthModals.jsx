import { Chrome, Github, X } from 'lucide-react';
import React, { useState } from 'react';
import { login, signup } from '../api/authService';
import { toast } from 'sonner';

const loginDataInitial = {
  username: '',
  password: ''
};

const signupDataInitial = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: ''
};

export function AuthModal({ isOpen, onClose, onModalSwitch, type }) {
  const [loginData, setLoginData] = useState(loginDataInitial);
  const [signupData, setSignupData] = useState(signupDataInitial);
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (type === 'login') {
      if (name === 'email') {
        setLoginData((prevData) => ({ ...prevData, username: value }));
      }
      setLoginData((prevData) => ({ ...prevData, [name]: value }));
    } else {
      setSignupData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === 'login') {
      const response = await login(loginData);
      if(response?.status == true){
        toast.success('Login successful');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem("firstName", response.data.firstName);
        localStorage.setItem("lastName", response.data.lastName);
        localStorage.setItem("role", response.data.role); 
        
        window.location.href = '/dashboard';
      }
      else{
        toast.error(response.message);
      }

    } else {
      const response = await signup(signupData);
      if(response?.status == true){
        toast.success('Signup successful');
         onModalSwitch();
      }
      else{
        toast.error(response.message);
      }
      
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">
          {type === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
          <div className='flex flex-col gap-5'>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={signupData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
            
            <input
              type="text"
              name="lastName"
              placeholder="Last Name "
              value={signupData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
             <input
              type="text"
              name="role"
              placeholder="Role i.e Student, Institution"
              value={signupData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={type === 'login' ? loginData.email : signupData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={type === 'login' ? loginData.password : signupData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
          
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors">
            {type === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-600 rounded-lg hover:border-purple-500 transition-colors">
            <Chrome className="w-5 h-5" />
            Google
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-600 rounded-lg hover:border-purple-500 transition-colors">
            <Github className="w-5 h-5" />
            GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-gray-400 text-sm">
          {type === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={onModalSwitch} className="text-purple-400 hover:text-purple-300">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={onModalSwitch} className="text-purple-400 hover:text-purple-300">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
