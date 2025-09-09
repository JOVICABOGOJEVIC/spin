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
    <div>
      <HeaderSite />
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary">
            Log in as a Company
          </h2>
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
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center"
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
            <p className="text-center text-gray-600 mt-2">
              Don't have an account?{" "}
              <span
                className="text-primary cursor-pointer hover:underline"
                onClick={handleRegisterRedirect}
              >
                Register
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginCompany;
