const Form = ({ children, onSubmit }) => {
  return (
    <form 
      onSubmit={onSubmit}
      className="rounded-lg p-6 shadow-sm"
      style={{
        backgroundColor: 'var(--form-bg)',
        border: '1px solid var(--form-border)',
        fontFamily: 'var(--font-family)'
      }}
    >
      {children}
    </form>
  );
};

export const FormInput = ({ label, type = 'text', placeholder, value, onChange, required }) => {
  return (
    <div className="mb-4">
      <label 
        className="block mb-2 text-sm font-medium"
        style={{ color: 'var(--form-label-text)' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md px-4 py-2 focus:outline-none focus:ring-2"
        style={{
          backgroundColor: 'var(--form-input-bg)',
          border: '1px solid var(--form-input-border)',
          color: 'var(--form-input-text)',
          '::placeholder': { color: 'var(--form-placeholder)' },
          ':focus': {
            borderColor: 'var(--form-focus-border)',
            boxShadow: '0 0 0 2px var(--form-focus-ring)'
          }
        }}
      />
    </div>
  );
};

export const FormSelect = ({ label, options, value, onChange, required }) => {
  return (
    <div className="mb-4">
      <label 
        className="block mb-2 text-sm font-medium"
        style={{ color: 'var(--form-label-text)' }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-md px-4 py-2 focus:outline-none focus:ring-2"
        style={{
          backgroundColor: 'var(--form-input-bg)',
          border: '1px solid var(--form-input-border)',
          color: 'var(--form-input-text)',
          ':focus': {
            borderColor: 'var(--form-focus-border)',
            boxShadow: '0 0 0 2px var(--form-focus-ring)'
          }
        }}
      >
        <option value="">Select an option</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const FormButton = ({ children, type = 'submit', onClick, variant = 'primary' }) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          ':hover': { filter: 'brightness(110%)' }
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--color-secondary)',
          color: '#ffffff',
          ':hover': { filter: 'brightness(110%)' }
        };
      default:
        return {};
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className="px-6 py-2 rounded-md font-medium transition-all duration-200"
      style={getButtonStyles()}
    >
      {children}
    </button>
  );
};

export default Form; 