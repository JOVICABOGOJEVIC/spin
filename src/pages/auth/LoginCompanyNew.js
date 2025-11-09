import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { login } from "../../redux/features/authSlice";
import { ArrowRight, Eye, EyeOff, Shield, Zap, Database } from "lucide-react";

const LoginCompanyNew = () => {
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
      await dispatch(login({
        formData,
        navigate,
        onSuccess: () => {
          // Toast message is already shown in authSlice
        }
      }));
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = () => {
    navigate("/auth?role=company&type=register");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-900 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-600 p-3 rounded-full">
                <Database className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back
            </h2>
            <p className="text-gray-300">
              Sign in to your SpinTasker account
            </p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
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
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
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
                    placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="text-green-400 hover:text-green-300 font-medium">
                  Zaboravljena lozinka?
                </Link>
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
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-300">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={handleRegister}
                  className="text-green-400 hover:text-green-300 font-medium"
                >
                  Sign up for free
                </button>
              </p>
            </div>

            {/* Worker Login Link */}
            <div className="text-center pt-4 border-t border-gray-600">
              <p className="text-sm text-gray-300 mb-2">
                Are you a field service technician?
              </p>
              <button
                type="button"
                onClick={() => navigate("/auth?role=worker&type=login")}
                className="text-blue-400 hover:text-blue-300 font-medium text-sm"
              >
                Login za servisere
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex lg:flex-1 bg-green-600 p-12 flex-col justify-center text-white">
        <div className="max-w-md">
          <h3 className="text-3xl font-bold mb-6">
            The field service platform for dynamic businesses
          </h3>
          <p className="text-white mb-8 text-lg">
            AI depends on fluid, instantly accessible data, not fragmented silos. 
            Consolidate your field service operations into a single, flexible system.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Secure & Reliable</h4>
                <p className="text-white text-sm">
                  Enterprise-grade security with 99.9% uptime guarantee
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Real-time Tracking</h4>
                <p className="text-white text-sm">
                  Track your field service jobs in real-time with GPS location
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Unified Platform</h4>
                <p className="text-white text-sm">
                  Consolidate all your field service data in one place
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCompanyNew;
