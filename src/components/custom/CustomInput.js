import React from "react";

const CustomInput = ({ 
  type = "text", 
  placeholder, 
  name, 
  value, 
  onChange, 
  onBlur,
  required = false, 
  className = "",
  id
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      id={id || name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required={required}
      className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
    />
  );
};

export default CustomInput;
