import React from 'react'
import HeaderSection from '../../header/HeaderSection.js'
import LiveIndicator from '../../animation/LiveIndicator.js';

const LiveView = ({ title, onNavigateBack }) => {
    const onAdd = () =>{};
    const onRead = () =>{};
    const onUpdate = () =>{};
    const onDelete = () =>{};

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
                onUpdate={onUpdate}
                onDelete={onDelete}
                onBack={onBack}
            />
            <div className="mt-6 w-full">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Live Tracking</h2>
                    <p className="text-gray-600 mb-4">Real-time tracking of active repair jobs and technicians.</p>
                    
                    <div className="bg-gray-100 p-4 rounded-md">
                        <p className="text-center text-gray-500">Live tracking module coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LiveView;