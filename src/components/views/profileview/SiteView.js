import React from 'react'
import HeaderSection from '../../header/HeaderSection.js'

const SiteView = ({title}) => {
    const onAdd = () =>{};
    const onRead = () =>{};
    const onUpdate = () =>{};
    const onDelete = () =>{};
  return (
    <div className=''>
        <HeaderSection title={title} onAdd={onAdd}
         onRead={onRead} onUpdate={onUpdate} onDelete={onDelete} /></div>
  )
}

export default SiteView;