import React from 'react';

const DateTimeField = ({ value, onChange, inputClass }) => {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Service Date
        </label>
        <input
          type="date"
          value={value?.date || ''}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
          className={inputClass.replace('py-1.5 px-2', 'py-2.5 px-3')}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Service Time
        </label>
        <input
          type="time"
          value={value?.time || ''}
          onChange={(e) => onChange({ ...value, time: e.target.value })}
          className={inputClass.replace('py-1.5 px-2', 'py-2.5 px-3')}
        />
      </div>
    </div>
  );
};

export default DateTimeField;


