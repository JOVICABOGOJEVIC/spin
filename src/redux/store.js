import { configureStore } from "@reduxjs/toolkit";
import { unstable_batchedUpdates } from '../reactBatchedUpdates';

import AuthReducer from './features/authSlice';
import JobReducer from './features/jobSlice';
import WorkerReducer from './features/workerSlice';
import TeamReducer from './features/teamSlice';
import ModelReducer from './features/modelSlice';
import ClientReducer from './features/clientSlice';
import DashboardReducer from '../reducers/dashboardReducer';
import SparePartReducer from './features/sparePartSlice';

// Mapiramo našu implementaciju u globalni objekat
// Ovo može pomoći u slučaju da react-redux traži funkciju kroz window/global
if (typeof window !== 'undefined') {
  window.reactDom = window.reactDom || {};
  window.reactDom.unstable_batchedUpdates = unstable_batchedUpdates;
}

export default configureStore({
  reducer:{
    auth: AuthReducer,
    job: JobReducer,
    worker: WorkerReducer,
    team: TeamReducer,
    model: ModelReducer,
    client: ClientReducer,
    dashboard: DashboardReducer,
    spareParts: SparePartReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  })
});
