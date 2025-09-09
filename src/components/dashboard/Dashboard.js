import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SparePartsView from './SparePartsView';
import WorkerList from '../workers/WorkerList';
import TeamList from '../teams/TeamList';

const Dashboard = () => {
  return (
    <Routes>
      <Route path="/spare-parts" element={<SparePartsView />} />
      <Route path="/workers" element={<WorkerList />} />
      <Route path="teams" element={<TeamList />} />
    </Routes>
  );
};

export default Dashboard; 