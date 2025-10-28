import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import HeaderSite from "../../components/header/HeaderSite";
import { CustomButton, CustomInput } from "../../components/custom";
import axios from 'axios';
import "./auth.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LoginWorker = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      toast.error("Please fix the errors before submitting");
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
      
      // Store worker-specific info
      localStorage.setItem("userType", "worker");
      localStorage.setItem("workerPermissions", JSON.stringify(data.result.permissions));

      // Add userType to the data object
      const userDataWithType = {
        ...data,
        userType: "worker"
      };

      // Dispatch to Redux (reuse auth slice)
      dispatch({
        type: 'auth/login/fulfilled',
        payload: userDataWithType
      });

      toast.success(`Dobrodošli, ${data.result.firstName} ${data.result.lastName}!`);
      
      // Navigate to dashboard
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

  return (
    <div className="w-full">
      <HeaderSite />
      <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border-t-4 border-green-500">
          {/* Header with Worker Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#0077C8] to-[#00B140] rounded-full flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Radnički Login</h2>
            <p className="text-gray-300">Prijavite se sa vašim radničkim nalogom</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Adresa
              </label>
              <input
                type="email"
                name="email"
                placeholder="vas.email@domen.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 bg-gray-700 border ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Lozinka
              </label>
              <input
                type="password"
                name="password"
                placeholder="Unesite vašu lozinku"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#0077C8] to-[#00B140] hover:from-[#005A9C] hover:to-[#008C33] transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Prijavljivanje...
                </span>
              ) : (
                'Prijavi se'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Zaboravili ste lozinku?{" "}
              <span className="text-gray-500 italic">Kontaktirajte administratora</span>
            </p>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Niste radnik?{" "}
                <span
                  onClick={() => navigate("/auth?role=company&type=login")}
                  className="text-[#0077C8] hover:text-[#00B140] font-semibold cursor-pointer hover:underline"
                >
                  Prijavite se kao kompanija
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginWorker;

