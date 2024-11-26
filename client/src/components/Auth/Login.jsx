import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContextObj } from '../../context/UserContext';
import { toast } from 'react-toastify'; // Ensure toast is properly configured

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login } = useContext(UserContextObj);

  const onLoginFormSubmit = async (data) => {
    try {
      const res = await login(data); // Ensure login returns a Promise
      if (res === "Login successful!") {
        
        navigate('/dashboard');
        toast.success(res);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      toast.error("An error occurred during login.");
      console.error(error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard'); // Navigate to the profile if already logged in
    }
  }, [navigate]);

  return (
    <div className="flex items-center  justify-center min-h-screen group">
      <div className="w-full max-w-md p-10 bg-transparent backdrop-blur-md shadow-2xl shadow-black rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 ">
        <h1 className="text-center font-bold text-black text-3xl mb-10">Login</h1>
        <form className="space-y-8" onSubmit={handleSubmit(onLoginFormSubmit)}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-6 w-6 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className=" pl-12 pt-4 pb-4 w-full border border-gray-800 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 text-black"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-6 w-6 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="pl-12 pt-4 pb-4  w-full border border-gray-800 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 text-black"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-black text-white py-2 px-4 rounded-lg transition duration-200 ease-in-out hover:bg-gray-800"
            >
              Login
            </button>
          </div>
        </form>
        <hr className="my-5" />
        <p className=" text-center">
          New User?{' '}
          <Link
            to="/register"
            className="font-semibold text-black transition duration-200 ease-in-out underline-offset-2"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
