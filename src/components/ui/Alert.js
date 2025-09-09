import React from 'react';
import { Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

/**
 * Alert component for displaying notifications
 * @param {string} type - 'info', 'warning', 'success', or 'error'
 * @param {string} title - Title of the alert
 * @param {React.ReactNode} children - Content of the alert
 * @param {string} className - Additional CSS classes
 */
export const Alert = ({ type = 'info', title, children, className = '' }) => {
  // Configure styles based on alert type
  const config = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info size={20} className="text-blue-500" />
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertCircle size={20} className="text-yellow-500" />
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle size={20} className="text-green-500" />
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <XCircle size={20} className="text-red-500" />
    }
  };

  const { bg, border, text, icon } = config[type] || config.info;

  return (
    <div className={`${bg} ${border} ${text} border rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
        <div>
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}; 