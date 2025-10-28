import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axios from 'axios';
import { ArrowRight, Eye, EyeOff, User, MapPin, Clock, CheckCircle } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LoginWorkerNew = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validateField = (name, value) => {
    let tempErrors = { ...errors };
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      tempErrors.email = emailRegex.test(value)
        ? ""
        : "Please enter a valid email address";
    }
    setErrors(tempErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }

    if (errors.email) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔐 Frontend: Attempting worker login...');
      console.log('  Email:', formData.email);
      console.log('  API URL:', `${API_BASE_URL}/api/worker/login`);
      
      // Worker login API call
      const { data } = await axios.post(
        `${API_BASE_URL}/api/worker/login`,
        {
          email: formData.email,
          password: formData.password
        }
      );

      console.log('✅ Frontend: Login successful!');
      console.log('  Worker:', data.result?.firstName, data.result?.lastName);

      // Store in localStorage (same format as company login)
      localStorage.setItem("profile", JSON.stringify(data));
      
      // Store worker-specific info - DO THIS FIRST before Redux dispatch
      localStorage.setItem("userType", "worker");
      localStorage.setItem("workerPermissions", JSON.stringify(data.result.permissions || {}));
      
      console.log('🔐 Worker Login: Setting userType to worker');
      console.log('  Worker permissions:', data.result.permissions);

      // Add userType to the data object
      const userDataWithType = {
        ...data,
        userType: "worker"
      };

      // Dispatch to Redux (reuse auth slice)
      // NOTE: Redux reducer will now check existing userType and preserve it
      dispatch({
        type: 'auth/login/fulfilled',
        payload: userDataWithType
      });
      
      // Double-check after dispatch that userType is still 'worker'
      const finalUserType = localStorage.getItem('userType');
      if (finalUserType !== 'worker') {
        console.error('🚨 SECURITY ERROR: userType was changed by Redux! Restoring...');
        localStorage.setItem("userType", "worker");
      }

      toast.success(`Dobrodošli, ${data.result.firstName} ${data.result.lastName}!`);
      
      // Navigate to worker dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error('❌ Frontend: Login failed');
      console.error('  Status:', error?.response?.status);
      console.error('  Message:', error?.response?.data?.message);
      console.error('  Full error:', error);
      
      const errorMessage = error?.response?.data?.message || "Invalid email or password";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompanyLogin = () => {
    navigate("/auth?role=company&type=login");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-600 p-3 rounded-full">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Login za servisere
            </h2>
            <p className="text-gray-300">
              Prijavite se sa vašim radničkim nalogom
            </p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Adresa
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="vas.email@domen.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Lozinka
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors pr-12"
                    placeholder="Unesite vašu lozinku"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Prijavljivanje...
                </div>
              ) : (
                <div className="flex items-center">
                  Prijavi se
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              )}
            </button>

            {/* Company Login Link */}
            <div className="text-center pt-4 border-t border-gray-600">
              <p className="text-sm text-gray-300 mb-2">
                Are you a company administrator?
              </p>
              <button
                type="button"
                onClick={handleCompanyLogin}
                className="text-blue-400 hover:text-blue-300 font-medium text-sm"
              >
                Company Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex lg:flex-1 bg-green-600 p-12 flex-col justify-center text-white">
        <div className="max-w-md">
          <h3 className="text-3xl font-bold mb-6">
            Field service technicians
          </h3>
          <p className="text-white mb-8 text-lg">
            Access your assigned jobs, track your time, and update your status 
            in real-time. Stay connected with your team and customers.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Real-time Tracking</h4>
                <p className="text-white text-sm">
                  Track your location and job progress in real-time
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Time Management</h4>
                <p className="text-white text-sm">
                  Track travel time, work time, and breaks automatically
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Job Updates</h4>
                <p className="text-white text-sm">
                  Update job status and communicate with your team
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginWorkerNew;

