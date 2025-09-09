import React, { useReducer } from "react";
import { motion } from "framer-motion";
import { fadeAnimation } from '../../constants/animations';
import './section.css';
import AnalyticsView from '../views/companyview/AnalyticsView';
import BillsView from '../views/companyview/BillsView';
import IssuedView from '../views/companyview/IssuedView';
import StorageView from '../views/companyview/StorageView';
import SuppliesView from '../views/companyview/SuppliesView';
import VehiclesView from '../views/companyview/VehiclesView';
import PartnersView from '../views/companyview/PartnersView';
import { getCompanyViews } from '../../utils/sectionConfig';
import { getBusinessType } from '../../utils/businessTypeUtils';
import SparePartsView from '../../components/dashboard/SparePartsView';
import WarrantyView from '../../components/dashboard/WarrantyView';

// Inicijalno stanje za reducer
const initialState = {
  activeSection: null,
};

// Reducer funkcija
function reducer(state, action) {
  switch (action.type) {
    case "SET_SECTION":
      return {
        ...state,
        activeSection: action.section,
      };
    case "RESET_SECTION":
      return {
        ...state,
        activeSection: null,
      };
    default:
      return state;
  }
}

const renderSection = (section) => {
  switch (section) {
    case 'Analytics':
      return <AnalyticsView />;
    case 'Cash Bills':
      return <BillsView />;
    case 'Issued':
      return <IssuedView />;
    case 'Storage':
      return <StorageView />;
    case 'Supplies':
      return <SuppliesView />;
    case 'Spare Parts':
      return <SparePartsView />;
    case 'Vehicles':
      return <VehiclesView />;
    case 'Partners':
      return <PartnersView />;
    case 'Warranty':
      return <WarrantyView />;
    default:
      return null;
  }
};

const SectionCompany = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const businessType = getBusinessType();
  const availableViews = getCompanyViews(businessType);

  const handleClick = (section) => {
    if (section === 'logout') {
      console.log('Logout clicked');
      return;
    }
    dispatch({ type: 'SET_SECTION', section });
  };
  
  const handleNavigateBack = () => {
    dispatch({ type: 'RESET_SECTION' });
  };

  return (
    <motion.div
      className="section-wrapper"
      initial="hidden"
      animate="visible"
      variants={fadeAnimation}
    >
      {!state.activeSection ? (
        <div className="section-buttons">
          {availableViews.map((view) => (
            <button
              key={view}
              className="section-button"
              onClick={() => handleClick(view)}
            >
              {view}
            </button>
          ))}
          <button
            className="section-button logout"
            onClick={() => handleClick('logout')}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="section-content">
          <button className="back-button" onClick={handleNavigateBack}>
            Back
          </button>
          {renderSection(state.activeSection)}
        </div>
      )}
    </motion.div>
  );
};

export default SectionCompany;
