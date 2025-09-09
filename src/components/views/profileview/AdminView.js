import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import HeaderSection from '../../header/HeaderSection.js';
import { updateProfile } from '../../../redux/features/authSlice';

const BUSINESS_TYPES = [
  "Auto Mechanic",
  "Electrician",
  "Plumber",
  "Home Appliance Technician",
  "HVAC Technician",
  "Carpenter",
  "Locksmith",
  "Elevator Technician",
  "General Contractor"
];

const AdminView = ({ title }) => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businessType, setBusinessType] = useState('');
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    // Get profile data from localStorage
    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile);
        
        // Get business type from profile if available
        if (parsedProfile && parsedProfile.result && parsedProfile.result.businessType) {
          setBusinessType(parsedProfile.result.businessType);
        } else if (parsedProfile && parsedProfile.businessType) {
          setBusinessType(parsedProfile.businessType);
        } else if (parsedProfile && parsedProfile.user && parsedProfile.user.businessType) {
          setBusinessType(parsedProfile.user.businessType);
        }
      } catch (error) {
        console.error('Error parsing profile:', error);
      }
    }
    setLoading(false);
  }, []);
  
  const handleSave = () => {
    if (!profile) return;
    
    // Create updated profile with business type
    let updatedProfile = { ...profile };
    
    // Update the appropriate field based on profile structure
    if (updatedProfile.result) {
      updatedProfile.result.businessType = businessType;
    } else if (updatedProfile.user) {
      updatedProfile.user.businessType = businessType;
    } else {
      updatedProfile.businessType = businessType;
    }
    
    // Save to localStorage
    localStorage.setItem('profile', JSON.stringify(updatedProfile));
    
    // Save to session storage for active session
    sessionStorage.setItem('businessType', businessType);
    
    // Dispatch update to Redux if needed
    dispatch(updateProfile(updatedProfile));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  const onAdd = () => {};
  const onRead = () => {};
  const onUpdate = () => {};
  const onDelete = () => {};
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className=''>
      <HeaderSection 
        title={title} 
        onAdd={onAdd}
        onRead={onRead} 
        onUpdate={onUpdate} 
        onDelete={onDelete} 
      />
      
      <div className="bg-white rounded-md shadow-sm p-6 mt-4">
        <h2 className="text-xl font-semibold mb-4">Business Settings</h2>
        
        <div className="mb-6">
          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
            Business Type
          </label>
          <select
            id="businessType"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={businessType || ''}
            onChange={(e) => setBusinessType(e.target.value)}
          >
            <option value="">Select Business Type</option>
            {BUSINESS_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Your business type determines what features and forms are available in the system.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark"
          >
            Save Settings
          </button>
        </div>
        
        {saved && (
          <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-md">
            Settings saved successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;