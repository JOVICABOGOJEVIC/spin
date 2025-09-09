import React, { useReducer } from "react";
import { motion } from "framer-motion";
import { fadeAnimation } from '../../constants/animations';
import './section.css';
import RepairsView from '../views/packageview/RepairsView';
import FixedPriceView from '../views/packageview/FixedPriceView';
import SubscriptionsView from '../views/packageview/SubscriptionsView';
import PartsView from '../views/packageview/PartsView';
import TransportView from '../views/packageview/TransportView';
import ServiceView from '../views/packageview/ServiceView';
import MaintenanceView from '../views/packageview/MaintenanceView';
import InstallationView from '../views/packageview/InstallationView';
import EmergencyView from '../views/packageview/EmergencyView';
import StandardView from '../views/packageview/StandardView';
import MaterialsView from '../views/packageview/MaterialsView';
import CustomWorkView from '../views/packageview/CustomWorkView';
import InteriorView from '../views/packageview/InteriorView';
import ExteriorView from '../views/packageview/ExteriorView';
import RenovationView from '../views/packageview/RenovationView';
import ServiceContractsView from '../views/packageview/ServiceContractsView';
import SupportView from '../views/packageview/SupportView';
import HourlyView from '../views/packageview/HourlyView';
import { getPackageViews } from '../../utils/sectionConfig';
import { getBusinessType } from '../../utils/businessTypeUtils';

const initialState = {
  activeSection: null, 
};

// Reducer funkcija
function reducer(state, action) {
  switch (action.type) {
    case "SET_SECTION":
      return { ...state, activeSection: action.section };
    case "RESET_SECTION":
      return { ...state, activeSection: null }; 
    default:
      return state;
  }
}

const renderSection = (section) => {
  switch (section) {
    case 'Repairs':
      return <RepairsView />;
    case 'Fixed Price':
      return <FixedPriceView />;
    case 'Subscriptions':
      return <SubscriptionsView />;
    case 'Parts':
      return <PartsView />;
    case 'Transport':
      return <TransportView />;
    case 'Service':
      return <ServiceView />;
    case 'Maintenance':
      return <MaintenanceView />;
    case 'Installation':
      return <InstallationView />;
    case 'Emergency':
      return <EmergencyView />;
    case 'Standard':
      return <StandardView />;
    case 'Materials':
      return <MaterialsView />;
    case 'Custom Work':
      return <CustomWorkView />;
    case 'Interior':
      return <InteriorView />;
    case 'Exterior':
      return <ExteriorView />;
    case 'Renovation':
      return <RenovationView />;
    case 'Service Contracts':
      return <ServiceContractsView />;
    case 'Support':
      return <SupportView />;
    case 'Hourly':
      return <HourlyView />;
    default:
      return null;
  }
};

const SectionPackage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const businessType = getBusinessType();
  const availableViews = getPackageViews(businessType);

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

export default SectionPackage;
