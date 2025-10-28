import React from 'react';

const PrioritySelect = ({ value, onChange, inputClass }) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-200 mb-1">
        Priority
      </label>
      <select
        name="priority"
        value={value || 'medium'}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
    </div>
  );
};

export default PrioritySelect;


