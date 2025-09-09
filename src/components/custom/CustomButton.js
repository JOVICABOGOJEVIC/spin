import React from "react";

const CustomButton = ({ 
  type = "button", 
  label, 
  onClick, 
  className = "", 
  disabled = false 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={` ${className}`}
    >
      {label}
    </button>
  );
};

export default CustomButton;
