import React, { useReducer } from "react";
import { motion } from "framer-motion";
import { boxVariants } from '../../js/animationVariants';
import './section.css';

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

const SectionSettings = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleClick = (item) => {
    if (item === "Logout") {
      console.log('Logout clicked');
      dispatch({ type: "RESET_SECTION" }); 
    } else {
      console.log(`${item} clicked`);
      dispatch({ type: "SET_SECTION", section: item });
    }
  };

  const renderSection = () => {
    switch (state.activeSection) {
      case "Workers":
        return <div>Workers Component</div>;
      case "Services":
        return <div>Services Component</div>;
      case "Cars":
        return <div>Cars Component</div>;
      case "Revers":
        return <div>Revers Component</div>;
      case "Analytics":
        return <div>Analytics Component</div>;
      case "Payments":
        return <div>Payments Component</div>;
      case "Logout":
        return <div>Logout Component</div>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="flex flex-col"
    >
      {state.activeSection === null && (
        <div>
          {["Workers", "Services", "Cars", "Revers", "Analytics", "Payments", "Logout"].map((item, i) => (
            <motion.div
              key={i}
              variants={boxVariants}
              className="box-style"
              onClick={() => handleClick(item)}
            >
              {item}
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-4">
        {renderSection()} {/* Renderuj odgovarajuću komponentu na osnovu stanja */}
      </div>
    </motion.div>
  );
};

export default SectionSettings;
