import React from 'react'
import HeaderSection from '../../header/HeaderSection.js'

const ArchiveView = ({ title, onNavigateBack }) => {
    const onAdd = () =>{};
    const onRead = () =>{};
    const onBack = () => {
        if (onNavigateBack) {
            onNavigateBack();
        }
    };
  return (
    <div className='w-full p-4'>
      <HeaderSection 
        title={title} 
        onAdd={onAdd}
        onRead={onRead}
        onBack={onBack}
      />
      <div className="mt-6 w-full">
        <p className="text-center text-gray-500">Archive section coming soon</p>
      </div>
    </div>
  )
}

export default ArchiveView;