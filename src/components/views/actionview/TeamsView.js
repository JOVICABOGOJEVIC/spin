import React, { useState, useEffect } from 'react';
import HeaderSection from '../../header/HeaderSection.js';
import TeamForm from '../../forms/TeamForm.js';
import TeamList from '../../lists/TeamList.js';
import { useNavigate } from 'react-router-dom';

const TeamsView = ({ title, onNavigateBack }) => {
  const [activeView, setActiveView] = useState('list'); // 'list', 'add', 'edit'
  const navigate = useNavigate();
  
  const showList = () => setActiveView('list');
  const showAddForm = () => setActiveView('add');
  
  const onAdd = () => {
    showAddForm();
  };
  
  const onRead = () => {
    showList();
  };
  
  const onBack = () => {
    if (activeView !== 'list') {
      showList();
    } else if (onNavigateBack) {
      onNavigateBack();
    }
  };
  
  // Listen for team-edit events
  useEffect(() => {
    const handleTeamEdit = () => {
      setActiveView('edit');
    };
    
    window.addEventListener('team-edit', handleTeamEdit);
    
    return () => {
      window.removeEventListener('team-edit', handleTeamEdit);
    };
  }, []);
  
  return (
    <div className='w-full p-4'>
      <HeaderSection 
        title={title || 'Service Teams'} 
        onAdd={onAdd}
        onRead={onRead}
        onBack={onBack}
      />
      
      <div className="mt-6 w-full">
        {activeView === 'list' && (
          <TeamList />
        )}
        
        {activeView === 'add' && (
          <TeamForm isEdit={false} onClose={showList} />
        )}
        
        {activeView === 'edit' && (
          <TeamForm isEdit={true} onClose={showList} />
        )}
      </div>
    </div>
  );
};

export default TeamsView; 