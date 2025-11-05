import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { registerCompany } from "../../redux/features/authSlice";
import { 
  getBusinessConfig, 
  getSpecializationOptions,
  getApplianceTypes
} from "../../utils/businessTypeUtils";
import { ArrowRight, Eye, EyeOff, Shield, Zap, Database, Building, User, MapPin } from "lucide-react";

const RegisterCompanyNew = () => {
  const [countryCode, setCountryCode] = useState("rs");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [businessConfig, setBusinessConfig] = useState({
    needsServiceAddress: true,
    needsGarageAddress: false,
    needsSpecializations: false,
    needsServiceableApplianceTypes: false,
    needsServiceRadius: false,
    needsWarranty: true,
    needsInventory: false,
    needsMaintenanceContracts: false
  });
  const [formData, setFormData] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    address: "",
    city: "",
    password: "",
    confirmPassword: "",
    phone: "",
    businessType: "",
    garageAddress: "",
    specializations: [],
    serviceableApplianceTypes: [],
    serviceRadius: "",
    defaultWarrantyDuration: "",
    hasInventory: false,
    offersMaintenanceContracts: false
  });

  useEffect(() => {
    const config = getBusinessConfig(formData.businessType);
    setBusinessConfig(config);
  }, [formData.businessType]);

  const validateField = (name, value) => {
    let tempErrors = { ...errors };
    
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      tempErrors.email = emailRegex.test(value) ? "" : "Please enter a valid email address";
    }
    
    if (name === "password") {
      tempErrors.password = value.length >= 6 ? "" : "Password must be at least 6 characters";
    }
    
    if (name === "confirmPassword") {
      tempErrors.confirmPassword = value === formData.password ? "" : "Passwords do not match";
    }
    
    setErrors(tempErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (Object.values(errors).some(error => error !== "")) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      await dispatch(registerCompany({
        formData: { ...formData, countryCode },
        navigate,
        onSuccess: () => {
          toast.success("Company registered successfully!");
        }
      }));
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const handleLogin = () => {
    navigate("/auth?role=company&type=login");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-900 flex">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-600 p-3 rounded-full">
                <Building className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Create your account
            </h2>
            <p className="text-gray-300">
              Start your field service journey with SpinTasker
            </p>
          </div>

          {/* Register Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your company name"
                />
              </div>

              {/* Owner Name */}
              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-300 mb-2">
                  Owner Name
                </label>
                <input
                  id="ownerName"
                  name="ownerName"
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Business Type */}
              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-300 mb-2">
                  Business Type
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  required
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="">Select your business type</option>
                  <option value="Home Appliance Technician">Home Appliance Technician</option>
                  <option value="HVAC Technician">HVAC Technician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your business address"
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your city"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors pr-12 ${
                      errors.password ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors pr-12 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <div className="flex items-center">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-300">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={handleLogin}
                  className="text-green-400 hover:text-green-300 font-medium"
                >
                  Sign in
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
            Join thousands of field service companies
          </h3>
          <p className="text-white mb-8 text-lg">
            Transform your field service operations with our comprehensive platform. 
            Manage jobs, track workers, and grow your business.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Secure Platform</h4>
                <p className="text-white text-sm">
                  Enterprise-grade security for your business data
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
                  Track your field workers and jobs in real-time
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-4">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Unified Management</h4>
                <p className="text-white text-sm">
                  Manage all aspects of your field service business
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompanyNew;
