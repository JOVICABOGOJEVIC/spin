import React, { useReducer } from "react";
import {useDispatch, useSelector} from 'react-redux';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { boxVariants } from '../../js/animationVariants';
import { setLogout } from "../../redux/features/authSlice";
import AdminView from '../views/profileview/AdminView'
import ShopView from "../views/profileview/ShopView";
import SiteView from "../views/profileview/SiteView";
import ThemeView from "../views/profileview/ThemeView";
import SupportView from "../views/profileview/SupportView";
import SettingsView from "../views/profileview/SettingsView";
import './section.css';
import InfoView from '../views/profileview/InfoView';
import NotesView from '../views/profileview/NotesView';
import AddressView from '../views/profileview/AddressView';
import DevicesView from '../views/profileview/DevicesView';
import CallsView from '../views/profileview/CallsView';
import InstallationsView from '../views/profileview/InstallationsView';
import VehiclesView from '../views/profileview/VehiclesView';
import HistoryView from '../views/profileview/HistoryView';
import BuildingsView from '../views/profileview/BuildingsView';
import ElevatorsView from '../views/profileview/ElevatorsView';
import SystemsView from '../views/profileview/SystemsView';
import ProjectsView from '../views/profileview/ProjectsView';
import NetworksView from '../views/profileview/NetworksView';
import { getProfileViews } from '../../utils/sectionConfig';
import { getBusinessType } from '../../utils/businessTypeUtils';
import { fadeAnimation } from '../../constants/animations';

// Inicijalno stanje za reducer
const initialState = {
  activeSection: null, // Početno stanje aktivne sekcije
};

// Reducer funkcija
function reducer(state, action) {
  console.log('Reducer action:', action);  // Dodajemo logging
  console.log('Current state:', state);    // Dodajemo logging
  
  switch (action.type) {
    case "SET_SECTION":
      const newState = {
        ...state,
        activeSection: action.section,
      };
      console.log('New state:', newState);  // Dodajemo logging
      return newState;
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
    case 'Info':
      return <InfoView />;
    case 'Notes':
      return <NotesView />;
    case 'Address':
      return <AddressView />;
    case 'Devices':
      return <DevicesView />;
    case 'Calls':
      return <CallsView />;
    case 'Installations':
      return <InstallationsView />;
    case 'Vehicles':
      return <VehiclesView />;
    case 'History':
      return <HistoryView />;
    case 'Buildings':
      return <BuildingsView />;
    case 'Elevators':
      return <ElevatorsView />;
    case 'Systems':
      return <SystemsView />;
    case 'Projects':
      return <ProjectsView />;
    case 'Networks':
      return <NetworksView />;
    case 'Theme':
      return <ThemeView title="Theme Settings" />;
    case 'Support':
      return <SupportView />;
    default:
      return null;
  }
};

const SectionProfile = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatchRedux = useDispatch();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const businessType = getBusinessType();
  const availableViews = getProfileViews(businessType);

  const handleClick = (section) => {
    console.log('Clicked section:', section);
    if (section === 'Logout') {
      dispatchRedux(setLogout());
      navigate('/auth?role=company&type=login');
    } else {
      console.log('Setting section:', section);
      dispatch({ type: 'SET_SECTION', section });
    }
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
          <div className="user-info">
            <p>{user?.result?.email}</p>
            <p>{user?.result?.phone}</p>
          </div>
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

export default SectionProfile;
