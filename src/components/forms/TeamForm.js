import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTeam, updateTeam, clearCurrentTeam } from '../../redux/features/teamSlice';
import { getWorkers } from '../../redux/features/workerSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const initialState = {
  name: '',
  description: '',
  leader: '',
  members: [],
  specializations: [],
  isActive: true
};

const TeamForm = ({ isEdit = false, onClose }) => {
  const [teamData, setTeamData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { team } = useSelector((state) => state.team || { team: null });
  const { workers } = useSelector((state) => state.worker || { workers: [] });
  
  useEffect(() => {
    // Load workers for team assignment
    dispatch(getWorkers());
    
    if (isEdit && team) {
      setTeamData(team);
    }
    
    return () => {
      // Clean up when the component unmounts
      if (isEdit) {
        dispatch(clearCurrentTeam());
      }
    };
  }, [isEdit, team, dispatch]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setTeamData({ ...teamData, [name]: checked });
    } else {
      setTeamData({ ...teamData, [name]: value });
    }
  };
  
  const handleMemberChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setTeamData({ ...teamData, members: selectedOptions });
  };
  
  const handleSpecializationChange = (e) => {
    const { value, checked } = e.target;
    let updatedSpecializations = [...teamData.specializations];
    
    if (checked) {
      updatedSpecializations.push(value);
    } else {
      updatedSpecializations = updatedSpecializations.filter(spec => spec !== value);
    }
    
    setTeamData({ ...teamData, specializations: updatedSpecializations });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!teamData.name) {
      return toast.error('Please provide a team name');
    }
    
    try {
      if (isEdit) {
        dispatch(updateTeam({ 
          id: team._id, 
          updatedTeamData: teamData
        }));
      } else {
        dispatch(createTeam({ 
          teamData, 
          navigate 
        }));
      }
      
      // Close the form after submission
      if (onClose) onClose();
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };
  
  // Get active workers only for team assignment
  const activeWorkers = workers?.filter(worker => worker.active) || [];
  
  return (
    <div 
      style={{
        backgroundColor: 'var(--form-bg)',
        border: '1px solid var(--form-border)',
        color: 'var(--form-input-text)',
        fontFamily: 'var(--font-family)'
      }}
      className="p-6 rounded-md shadow-md max-w-5xl mx-auto"
    >
      <h2 
        className="text-2xl font-semibold mb-6 text-center"
        style={{ color: 'var(--form-label-text)' }}
      >
        {isEdit ? 'Edit Team' : 'Create New Team'}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Information Section */}
        <div 
          className="p-4 rounded-md md:col-span-1"
          style={{ backgroundColor: 'var(--form-input-bg)' }}
        >
          <h3 
            className="text-md font-semibold mb-4"
            style={{ color: 'var(--form-label-text)' }}
          >
            Team Information
          </h3>
          
          <div className="space-y-6">
            {/* Team Name */}
            <div>
              <input
                style={{
                  backgroundColor: 'var(--form-input-bg)',
                  borderColor: 'var(--form-input-border)',
                  color: 'var(--form-input-text)'
                }}
                className="appearance-none border-b w-full py-2 px-1 leading-tight focus:outline-none"
                id="name"
                name="name"
                type="text"
                placeholder="Team Name"
                value={teamData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Description */}
            <div>
              <textarea
                style={{
                  backgroundColor: 'var(--form-input-bg)',
                  borderColor: 'var(--form-input-border)',
                  color: 'var(--form-input-text)'
                }}
                className="appearance-none border-b w-full py-2 px-1 leading-tight focus:outline-none"
                id="description"
                name="description"
                placeholder="Team Description"
                value={teamData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>
            
            {/* Team Leader */}
            <div>
              <select
                style={{
                  backgroundColor: 'var(--form-input-bg)',
                  borderColor: 'var(--form-input-border)',
                  color: 'var(--form-input-text)'
                }}
                className="appearance-none border-b w-full py-2 px-1 leading-tight focus:outline-none"
                id="leader"
                name="leader"
                value={teamData.leader}
                onChange={handleChange}
              >
                <option value="">Select Team Leader</option>
                {activeWorkers.map(worker => (
                  <option key={worker._id} value={worker._id}>
                    {worker.firstName} {worker.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Active Status */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={teamData.isActive}
                  onChange={handleChange}
                  className="mr-2"
                  style={{
                    accentColor: 'var(--color-primary)'
                  }}
                />
                <span style={{ color: 'var(--form-input-text)' }}>Active Team</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Team Members Section */}
        <div 
          className="p-4 rounded-md md:col-span-1"
          style={{ backgroundColor: 'var(--form-input-bg)' }}
        >
          <h3 
            className="text-md font-semibold mb-4"
            style={{ color: 'var(--form-label-text)' }}
          >
            Team Members
          </h3>
          
          <div>
            <select
              style={{
                backgroundColor: 'var(--form-input-bg)',
                borderColor: 'var(--form-input-border)',
                color: 'var(--form-input-text)'
              }}
              className="appearance-none border-b w-full py-2 px-1 leading-tight focus:outline-none"
              id="members"
              name="members"
              multiple
              size="10"
              value={teamData.members}
              onChange={handleMemberChange}
            >
              {activeWorkers.map(worker => (
                <option key={worker._id} value={worker._id}>
                  {worker.firstName} {worker.lastName} - {worker.specialization || 'General'}
                </option>
              ))}
            </select>
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--form-placeholder)' }}
            >
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple members
            </p>
          </div>
        </div>
        
        {/* Specializations Section */}
        <div 
          className="p-4 rounded-md md:col-span-1"
          style={{ backgroundColor: 'var(--form-input-bg)' }}
        >
          <h3 
            className="text-md font-semibold mb-4"
            style={{ color: 'var(--form-label-text)' }}
          >
            Team Specializations
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="refrigeration"
                name="specializations"
                value="Refrigeration"
                checked={teamData.specializations.includes('Refrigeration')}
                onChange={handleSpecializationChange}
                className="mr-2"
                style={{
                  accentColor: 'var(--color-primary)'
                }}
              />
              <span style={{ color: 'var(--form-input-text)' }}>Refrigeration</span>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="washingMachines"
                name="specializations"
                value="Washing Machines"
                checked={teamData.specializations.includes('Washing Machines')}
                onChange={handleSpecializationChange}
                className="mr-2"
                style={{
                  accentColor: 'var(--color-primary)'
                }}
              />
              <span style={{ color: 'var(--form-input-text)' }}>Washing Machines</span>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="cookingAppliances"
                name="specializations"
                value="Cooking Appliances"
                checked={teamData.specializations.includes('Cooking Appliances')}
                onChange={handleSpecializationChange}
                className="mr-2"
                style={{
                  accentColor: 'var(--color-primary)'
                }}
              />
              <span style={{ color: 'var(--form-input-text)' }}>Cooking Appliances</span>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="airConditioning"
                name="specializations"
                value="Air Conditioning"
                checked={teamData.specializations.includes('Air Conditioning')}
                onChange={handleSpecializationChange}
                className="mr-2"
                style={{
                  accentColor: 'var(--color-primary)'
                }}
              />
              <span style={{ color: 'var(--form-input-text)' }}>Air Conditioning</span>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smallAppliances"
                name="specializations"
                value="Small Appliances"
                checked={teamData.specializations.includes('Small Appliances')}
                onChange={handleSpecializationChange}
                className="mr-2"
                style={{
                  accentColor: 'var(--color-primary)'
                }}
              />
              <span style={{ color: 'var(--form-input-text)' }}>Small Appliances</span>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="general"
                name="specializations"
                value="General"
                checked={teamData.specializations.includes('General')}
                onChange={handleSpecializationChange}
                className="mr-2"
                style={{
                  accentColor: 'var(--color-primary)'
                }}
              />
              <span style={{ color: 'var(--form-input-text)' }}>General</span>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="md:col-span-3 flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md"
            style={{
              backgroundColor: 'var(--nav-bg)',
              color: 'var(--nav-text)',
              fontFamily: 'var(--font-family)'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontFamily: 'var(--font-family)'
            }}
          >
            {isEdit ? 'Update Team' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamForm; 