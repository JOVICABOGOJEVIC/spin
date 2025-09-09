import React from "react";
import { motion } from "framer-motion";
import { boxVariants } from "../../js/animationVariants";
import { ArrowLeft, Plus, List, Menu } from "lucide-react";
import "./header.css"; // CSS za stilizaciju
import { getBusinessType } from "../../utils/businessTypeUtils";
import { getSectionTitle, getViewTitle } from '../../utils/sectionTitleUtils';

const HeaderSection = ({ section, view, onAdd, onRead, onBack }) => {
  const businessType = getBusinessType();
  const sectionTitle = getSectionTitle(section);
  const viewTitle = view ? getViewTitle(view) : '';
  
  const displayTitle = viewTitle ? `${sectionTitle} - ${viewTitle}` : sectionTitle;

  const handleBackClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBack) {
      onBack();
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={boxVariants}
      className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white"
    > 
      <button 
        onClick={handleBackClick} 
        className="p-2 rounded-full bg-blue-700 text-white flex items-center justify-center transition-all duration-300 hover:bg-blue-800 hover:scale-110 focus:outline-none"
        title="Go back"
      >
        <Menu size={24} className="stroke-2"/>
      </button>
      <h2 className="text-lg font-bold flex-grow">{displayTitle}</h2>
      {onAdd && (
        <button 
          onClick={onAdd} 
          title="Add New" 
          className="p-2 rounded-full bg-blue-700 text-white flex items-center justify-center transition-all duration-300 hover:bg-blue-800 hover:scale-110 focus:outline-none"
        >
          <Plus size={20} className="stroke-2"/>
        </button>
      )}
      {onRead && (
        <button 
          onClick={onRead} 
          title="View List" 
          className="p-2 rounded-full bg-blue-700 text-white flex items-center justify-center transition-all duration-300 hover:bg-blue-800 hover:scale-110 focus:outline-none"
        >
          <List size={20} className="stroke-2"/>
        </button>
      )}
    </motion.div>
  );
};

export default HeaderSection;
