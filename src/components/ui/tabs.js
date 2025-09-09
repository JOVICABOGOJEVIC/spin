import React from 'react';

export const Tabs = ({ 
  defaultValue, 
  value, 
  onValueChange, 
  children, 
  className = "" 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
};

export const TabsList = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`flex space-x-1 border-b ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ 
  value, 
  children, 
  className = "" 
}) => {
  // Get the current value from context or props
  const isActive = React.useContext(TabsContext)?.value === value;
  
  return (
    <button
      className={`px-4 py-2 text-sm font-medium ${
        isActive 
          ? 'text-primary border-b-2 border-primary' 
          : 'text-gray-600 hover:text-gray-800'
      } ${className}`}
      onClick={() => {
        React.useContext(TabsContext)?.onValueChange(value);
      }}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ 
  value, 
  children, 
  className = "" 
}) => {
  const isActive = React.useContext(TabsContext)?.value === value;
  
  if (!isActive) return null;
  
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Create a context to share the current tab value
const TabsContext = React.createContext(null);

// Update the Tabs component to provide the context
const TabsWithContext = ({ 
  defaultValue, 
  value: controlledValue, 
  onValueChange, 
  children, 
  className = "" 
}) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  
  // Determine if component is controlled or uncontrolled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  
  const handleValueChange = React.useCallback(
    (newValue) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );
  
  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// Replace the original Tabs export
export { TabsWithContext as Tabs }; 