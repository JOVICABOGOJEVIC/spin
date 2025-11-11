import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faUser} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import './header.css';

const HeaderSite = React.memo(() => {
  const navigate = useNavigate();
  const [showBar, setShowBar] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const companyName = user?.companyName || 'SpinTasker';
  const countryCode = user?.countryCode?.toLowerCase() || 'rs';

  const handleNavigate = (path) => {
    navigate(path);
    setShowBar(false);
  };

  return (
    <div className='header-container'>
      <div className="header-brand flex items-center gap-2">
        {companyName} 
        <img 
          src={`https://flagcdn.com/${countryCode}.svg`}
          alt={`${countryCode} flag`}
          className="h-4 w-6"
        />
      </div>
      <FontAwesomeIcon
        icon={faBars}
        className="header-bar"
        onClick={() => setShowBar(!showBar)}
      />

      {showBar && (
        <div className="bar-box">
          <div className="bar-content">
            <button
              className="bar-button"
              onClick={() => setShowBar(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <ul className="bar-list">
              <li><FontAwesomeIcon icon={faUser} /></li> 
              <li onClick={() => handleNavigate("/auth?role=user&type=login") } className="cursor-pointer">Log in / Sign up as a User</li>
              <li onClick={() => handleNavigate("/auth?role=company&type=login") } className="cursor-pointer">Log in / Sign up as a Company</li>
              <li className="cursor-pointer text-white" onClick={() => setShowBar(false)}>How it works</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});

export default HeaderSite;
