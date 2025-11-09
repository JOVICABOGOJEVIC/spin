import React from "react";
import { motion } from "framer-motion";
import { boxVariants } from "../../js/animationVariants";
import { ArrowLeft, Plus, List, Menu } from "lucide-react";
import "./header.css"; // CSS za stilizaciju
import { getBusinessType } from "../../utils/businessTypeUtils";
import { getSectionTitle, getViewTitle } from '../../utils/sectionTitleUtils';

const HeaderSection = ({ section, view, title, onAdd, onRead, onBack, variant = 'primary' }) => {
  const businessType = getBusinessType();

  const baseSectionKey = section || title || 'Section';
  const safeSectionKey = typeof baseSectionKey === 'string' ? baseSectionKey : 'Section';

  const computedSectionTitle = getSectionTitle(safeSectionKey);
  const viewTitle = view ? getViewTitle(view) : '';

  const displayTitle = viewTitle ? `${computedSectionTitle} - ${viewTitle}` : computedSectionTitle;

  const isDarkVariant = variant === 'dark';

  const headerClassName = `flex items-center justify-between px-6 py-4 ${
    isDarkVariant
      ? 'bg-gray-900 text-white border-b border-gray-700'
      : 'bg-blue-600 text-white'
  }`;

  const buttonClasses = `p-2 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none ${
    isDarkVariant
      ? 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-110'
      : 'bg-blue-700 text-white hover:bg-blue-800 hover:scale-110'
  }`;

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
      className={headerClassName}
    > 
      <button 
        onClick={handleBackClick} 
        className={buttonClasses}
        title="Go back"
      >
        <Menu size={24} className="stroke-2"/>
      </button>
      <h2 className="text-lg font-bold flex-grow">{displayTitle}</h2>
      {onAdd && (
        <button 
          onClick={onAdd} 
          title="Add New" 
          className={buttonClasses}
        >
          <Plus size={20} className="stroke-2"/>
        </button>
      )}
      {onRead && (
        <button 
          onClick={onRead} 
          title="View List" 
          className={buttonClasses}
        >
          <List size={20} className="stroke-2"/>
        </button>
      )}
    </motion.div>
  );
};

export default HeaderSection;
