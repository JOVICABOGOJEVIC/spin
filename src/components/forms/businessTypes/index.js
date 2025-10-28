import React from 'react';
import JobForm from '../JobForm';
import { getBusinessType } from '../../../utils/businessTypeUtils';
import HomeApplianceTechnicianJobForm from './HomeApplianceTechnicianJobForm';
import ElectricianJobForm from './ElectricianJobForm';
import PlumberJobForm from './PlumberJobForm';
import AutoMechanicJobForm from './AutoMechanicJobForm';
import ElevatorTechnicianJobForm from './ElevatorTechnicianJobForm';
import HVACTechnicianJobForm from './HVACTechnicianJobForm';
import LocksmithJobForm from './LocksmithJobForm';
import TileInstallerJobForm from './TileInstallerJobForm';
import PainterJobForm from './PainterJobForm';
import ITTechnicianJobForm from './ITTechnicianJobForm';
import HandymanJobForm from './HandymanJobForm';
import CarpetCleaningJobForm from './CarpetCleaningJobForm';
import HouseCleaningJobForm from './HouseCleaningJobForm';
import PestControlJobForm from './PestControlJobForm';
import WindowCleaningJobForm from './WindowCleaningJobForm';

// Placeholder registry for future per-business-type forms
const registry = {
  'Home Appliance Technician': HomeApplianceTechnicianJobForm,
  'Electrician': ElectricianJobForm,
  'Plumber': PlumberJobForm,
  'Auto Mechanic': AutoMechanicJobForm,
  'Elevator Technician': ElevatorTechnicianJobForm,
  'HVAC Technician': HVACTechnicianJobForm,
  'Locksmith': LocksmithJobForm,
  'Tile Installer': TileInstallerJobForm,
  'Painter': PainterJobForm,
  'Carpet Cleaning': CarpetCleaningJobForm,
  'House Cleaning': HouseCleaningJobForm,
  'Pest Control': PestControlJobForm,
  'Window Cleaning': WindowCleaningJobForm,
  'IT Technician': ITTechnicianJobForm,
  'Handyman': HandymanJobForm,
};

const ResolvedJobForm = (props) => {
  const currentType = getBusinessType();
  const Custom = currentType && registry[currentType];
  if (Custom) return <Custom {...props} />;
  return <JobForm {...props} />;
};

export default ResolvedJobForm;


