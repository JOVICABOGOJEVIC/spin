import React, { useReducer } from "react";
import { motion } from "framer-motion";
import { fadeAnimation } from '../../constants/animations';
import './section.css';
import JobsView from "../views/actionview/JobsView";
import StatusView from "../views/actionview/StatusView";
import ServicesView from "../views/actionview/ServicesView";
import WorkersView from "../views/actionview/WorkersView";
import LiveView from "../views/actionview/LiveView";
import ArchiveView from "../views/actionview/ArchiveView";
import ClientsView from "../views/actionview/ClientsView";
import ProjectsView from '../../components/dashboard/ProjectsView';
import RemoteSupportView from '../../components/dashboard/RemoteSupportView';
import { getActionViews } from '../../utils/sectionConfig';
import { getBusinessType } from '../../utils/businessTypeUtils';

// Inicijalno stanje za reducer
const initialState = {
  activeSection: null, // Početno stanje aktivne sekcije
};

// Reducer funkcija
function reducer(state, action) {
  switch (action.type) {
    case "SET_SECTION":
      return { ...state, activeSection: action.section };
    case "RESET_SECTION":
      return { ...state, activeSection: null }; // Reseta aktivnu sekciju (sakriva roditeljsku sekciju)
    default:
      return state;
  }
}

const renderSection = (section) => {
  switch (section) {
    case 'Jobs':
      return <JobsView />;
    case 'Status':
      return <StatusView />;
    case 'Live':
      return <LiveView />;
    case 'Services':
      return <ServicesView />;
    case 'Workers':
      return <WorkersView />;
    case 'Clients':
      return <ClientsView />;
    case 'Projects':
      return <ProjectsView />;
    case 'Remote':
      return <RemoteSupportView />;
    case 'Archive':
      return <ArchiveView />;
    default:
      return null;
  }
};

const SectionAction = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const businessType = getBusinessType();
  const availableViews = getActionViews(businessType);

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

export default SectionAction;
