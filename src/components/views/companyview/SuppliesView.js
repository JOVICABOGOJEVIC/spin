import React from 'react'
import HeaderSection from '../../header/HeaderSection.js'
import LiveIndicator from '../../animation/LiveIndicator.js';

const VechilesView = ({title}) => {
    const onAdd = () =>{};
    const onRead = () =>{};
    const onUpdate = () =>{};
    const onDelete = () =>{};
  return (
    <div className=''>
        <HeaderSection title={title} onAdd={onAdd}
         onRead={onRead} onUpdate={onUpdate} onDelete={onDelete} />
         <LiveIndicator /></div>

  )
}

export default VechilesView;