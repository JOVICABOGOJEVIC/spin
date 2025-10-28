import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import HeaderSite from "../../components/header/HeaderSite";
import { CustomButton, CustomInput } from "../../components/custom";
import { login } from "../../redux/features/authSlice";
import "./auth.css";

const LoginCompany = () => {
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
    
    if (isSubmitting) return; // Prevent multiple submissions
    
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
      const result = await dispatch(login({ 
        formData, 
        toast, 
        navigate,
        onSuccess: (result) => {
          if (result?.result?.businessType) {
            sessionStorage.setItem('businessType', result.result.businessType);
            if (result.result.hasInventory) {
              sessionStorage.setItem('hasInventory', 'true');
            }
            if (result.result.offersMaintenanceContracts) {
              sessionStorage.setItem('offersMaintenanceContracts', 'true');
            }
          }
        }
      })).unwrap();
    } catch (error) {
      const errorMessage = error?.message || "Invalid email or password";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/auth?role=company&type=register");
  };

  return (
    <div className="w-full">
      <HeaderSite />
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#E6F4FF] via-[#F0FFF4] to-[#E6F4FF] px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border-t-4 border-[#0077C8]">
          {/* Header with Company Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#0077C8] to-[#00B140] rounded-full flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Company Login</h2>
            <p className="text-gray-600">Prijavite se na vaš kompanijski nalog</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <CustomInput
                placeholder="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onBlur={handleBlur}
                onChange={handleChange}
                required={true}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <CustomInput
                placeholder="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={true}
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#0077C8] to-[#00B140] hover:from-[#005A9C] hover:to-[#008C33] transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <span
                  className="text-[#0077C8] hover:text-[#00B140] cursor-pointer hover:underline font-semibold"
                  onClick={handleRegisterRedirect}
                >
                  Register
                </span>
              </p>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Radnik ste?{" "}
                  <span
                    className="text-[#0077C8] hover:text-[#00B140] cursor-pointer hover:underline font-semibold"
                    onClick={() => navigate("/auth?role=worker&type=login")}
                  >
                    Prijavite se ovde
                  </span>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginCompany;
