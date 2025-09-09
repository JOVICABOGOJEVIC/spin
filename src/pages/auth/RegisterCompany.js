import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import HeaderSite from "../../components/header/HeaderSite";
import { CustomButton, CustomInput } from "../../components/custom";
import { registerCompany } from "../../redux/features/authSlice";
import { 
  getBusinessConfig, 
  getSpecializationOptions,
  getApplianceTypes
} from "../../utils/businessTypeUtils";

const RegisterCompany = () => {
  const [countryCode, setCountryCode] = useState("rs");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
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
    // Business-type specific fields
    garageAddress: "",
    specializations: [],
    serviceableApplianceTypes: [],
    serviceRadius: "",
    defaultWarrantyDuration: "",
    hasInventory: false,
    offersMaintenanceContracts: false
  });

  const businessTypes = [
    "Home Appliance Technician",
    "Electrician",
    "Plumber",
    "Auto Mechanic",
    "Elevator Technician",
    "HVAC Technician",
    "Carpenter",
    "Locksmith",
    "Tile Installer",
    "Painter",
    "Facade Specialist",
    "IT Technician",
    "Handyman"
  ];

  // Update business configuration when business type changes
  useEffect(() => {
    if (formData.businessType) {
      // Create a mock session with the selected business type
      sessionStorage.setItem('businessType', formData.businessType);
      
      // Get configuration for this business type
      const config = getBusinessConfig();
      setBusinessConfig(config);
      
      // Clear temporary session storage
      sessionStorage.removeItem('businessType');
    }
  }, [formData.businessType]);

  const validateField = (name, value) => {
    let tempErrors = { ...errors };
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      tempErrors.email = emailRegex.test(value)
        ? ""
        : "Please enter a valid email address";
    }

    if (name === "password") {
      tempErrors.password =
        value.length < 6 ? "Password must be at least 6 characters" : "";
    }

    setErrors(tempErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    validateField(name, value);
  };

  const handleMultiSelectChange = (e, fieldName) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setFormData({ ...formData, [fieldName]: selectedValues });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    if (!formData.businessType) {
      setError("Please select your business type!");
      return;
    }
    
    if (!errors.email && !errors.password) {
      const dataToSend = {
        email: formData.email,
        password: formData.password,
        ownerName: formData.ownerName,
        companyName: formData.companyName,
        city: formData.city,
        phone: formData.phone,
        address: formData.address,
        businessType: formData.businessType
      };
      
      console.log("Sending data:", dataToSend);
      
      // Clear any previous errors
      setError("");
      
      const handleRegistrationResult = (action) => {
        if (action.type.endsWith('/rejected')) {
          console.error('Registration failed:', action.payload);
          const errorMsg = action.payload?.message || 'Unknown error occurred during registration';
          
          // Set a more detailed error message
          if (action.payload?.fields) {
            if (Array.isArray(action.payload.fields)) {
              setError(`${errorMsg}: ${action.payload.fields.join(', ')}`);
            } else {
              setError(`${errorMsg}: ${action.payload.fields}`);
            }
          } else {
            setError(errorMsg);
          }
          
          toast.error(`Registration failed: ${errorMsg}`);
        }
      };
      
      dispatch(registerCompany({ formData: dataToSend, toast, navigate }))
        .then(handleRegistrationResult)
        .catch(error => {
          console.error('Dispatch error:', error);
          setError('Registration failed. Please try again later.');
        });
    }
  };

  const handleLoginRedirect = () => {
    navigate("/auth?role=company&type=login");
  };

  const {
    needsServiceAddress,
    needsGarageAddress,
    needsSpecializations,
    needsServiceableApplianceTypes,
    needsServiceRadius,
    needsWarranty,
    needsInventory,
    needsMaintenanceContracts
  } = businessConfig;

  return (
    <div>
      <HeaderSite />
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary">
            Register as a Company
          </h2>
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleRegister} className="flex flex-col items-center">
            <div className="w-full mb-4">
              <CustomInput
                placeholder="Company Name"
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required={true}
              />
            </div>
            
            <div className="w-full mb-4">
              <CustomInput
                placeholder="Owner's Full Name"
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required={true}
              />
            </div>
            
            <div className="w-full mb-4">
              <CustomInput
                placeholder="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onBlur={handleBlur}
                onChange={handleChange}
                required={true}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div className="w-full mb-4">
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="" disabled>
                  Select your business type
                </option>
                {businessTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full mb-4">
              <CustomInput
                placeholder="City"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required={true}
              />
            </div>
            
            <div className="w-full mb-4">
              <CustomInput
                placeholder="Address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required={true}
              />
            </div>
            
            <div className="w-full mb-4">
              <label className="block text-gray-700 text-sm mb-1">
                Phone Number
              </label>
              <PhoneInput
                country={countryCode}
                enableSearch={true}
                value={formData.phone}
                onChange={(value) =>
                  setFormData({ ...formData, phone: `+${value}` })
                }
                containerClass="w-full"
                inputClass="w-full"
              />
            </div>
            
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <CustomInput
                  placeholder="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required={true}
                />
              </div>
              <div>
                <CustomInput
                  placeholder="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={true}
                />
              </div>
            </div>
            
            {errors.password && (
              <p className="text-red-500 text-sm w-full">{errors.password}</p>
            )}
            
            <div className="w-full mt-2">
              <CustomButton
                type="submit"
                label="Register"
                onClick={handleRegister}
                className="login-button w-full"
              />
            </div>
            
            <p className="text-center text-gray-600 mt-4">
              Already have an account?{" "}
              <span
                className="text-primary cursor-pointer hover:underline"
                onClick={handleLoginRedirect}
              >
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompany;
