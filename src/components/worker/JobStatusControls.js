import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Clock, MapPin, Wrench, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { getSpareParts } from '../../redux/features/sparePartSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const JobStatusControls = ({ job, user, onStatusUpdate }) => {
  const { emitJobStatusUpdate } = useWebSocket();
  const dispatch = useDispatch();
  const { items: spareParts, loading: sparePartsLoading } = useSelector((state) => state.spareParts || { items: [], loading: false });
  
  const [currentStatus, setCurrentStatus] = useState('pending');
  const [isTraveling, setIsTraveling] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStartedWork, setHasStartedWork] = useState(false);
  const [travelTime, setTravelTime] = useState(0);
  const [workTime, setWorkTime] = useState(0);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [travelStartTime, setTravelStartTime] = useState(null);
  const [workStartTime, setWorkStartTime] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    materialsUsed: '',
    workDescription: '',
    serviceCharged: '',
    customerSignature: '',
    additionalNotes: '',
    usedSpareParts: [] // Add array for multiple spare parts
  });
  const [totalTravelTime, setTotalTravelTime] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const accumulatedTravelTimeRef = useRef(0);
  const accumulatedWorkTimeRef = useRef(0);

  // Load accumulated times and active timers from localStorage on mount
  useEffect(() => {
    const jobId = job?._id;
    if (jobId) {
      // Load accumulated times
      const savedTravelTime = localStorage.getItem(`travelTime_${jobId}`);
      const savedWorkTime = localStorage.getItem(`workTime_${jobId}`);
      
      if (savedTravelTime) {
        accumulatedTravelTimeRef.current = parseInt(savedTravelTime);
        setTotalTravelTime(parseInt(savedTravelTime));
      }
      if (savedWorkTime) {
        accumulatedWorkTimeRef.current = parseInt(savedWorkTime);
        setTotalWorkTime(parseInt(savedWorkTime));
      }
      
      // Load active timer states
      const savedIsTraveling = localStorage.getItem(`isTraveling_${jobId}`);
      const savedIsWorking = localStorage.getItem(`isWorking_${jobId}`);
      const savedTravelStartTime = localStorage.getItem(`travelStartTime_${jobId}`);
      const savedWorkStartTime = localStorage.getItem(`workStartTime_${jobId}`);
      
      if (savedIsTraveling === 'true' && savedTravelStartTime) {
        const startTime = parseInt(savedTravelStartTime);
        const now = Date.now();
        // Check if timer is still valid (not too old - e.g., within 24 hours)
        if (now - startTime < 24 * 60 * 60 * 1000) {
          setIsTraveling(true);
          setTravelStartTime(startTime);
          // Calculate elapsed time from saved start time
          const elapsed = Math.floor((now - startTime) / 1000);
          const currentTravelTime = accumulatedTravelTimeRef.current + elapsed;
          setTravelTime(currentTravelTime);
        } else {
          // Timer is too old, save accumulated time and reset
          accumulatedTravelTimeRef.current += Math.floor((parseInt(savedTravelStartTime) - startTime) / 1000);
          localStorage.removeItem(`isTraveling_${jobId}`);
          localStorage.removeItem(`travelStartTime_${jobId}`);
        }
      }
      
      if (savedIsWorking === 'true' && savedWorkStartTime) {
        const startTime = parseInt(savedWorkStartTime);
        const now = Date.now();
        // Check if timer is still valid (not too old - e.g., within 24 hours)
        if (now - startTime < 24 * 60 * 60 * 1000) {
          setIsWorking(true);
          setWorkStartTime(startTime);
          setHasStartedWork(true);
          // Calculate elapsed time from saved start time
          const elapsed = Math.floor((now - startTime) / 1000);
          const currentWorkTime = accumulatedWorkTimeRef.current + elapsed;
          setWorkTime(currentWorkTime);
        } else {
          // Timer is too old, save accumulated time and reset
          accumulatedWorkTimeRef.current += Math.floor((parseInt(savedWorkStartTime) - startTime) / 1000);
          localStorage.removeItem(`isWorking_${jobId}`);
          localStorage.removeItem(`workStartTime_${jobId}`);
        }
      }
    }
  }, [job?._id]);

  // Save accumulated times to localStorage
  const saveAccumulatedTimes = useCallback(() => {
    const jobId = job?._id;
    if (jobId) {
      localStorage.setItem(`travelTime_${jobId}`, accumulatedTravelTimeRef.current.toString());
      localStorage.setItem(`workTime_${jobId}`, accumulatedWorkTimeRef.current.toString());
    }
  }, [job?._id]);

  useEffect(() => {
    // Initialize status from job
    if (job?.status) {
      // Handle different status formats
      let normalizedStatus = job.status.toLowerCase();
      if (normalizedStatus === 'in pending') {
        normalizedStatus = 'pending';
      }
      setCurrentStatus(normalizedStatus);
    }
  }, [job]);

  // Load spare parts from Redux store
  useEffect(() => {
    if (user?.token) {
      dispatch(getSpareParts());
    }
  }, [dispatch, user?.token]);

  // Timer callback functions - memoized to prevent re-renders
  const updateTravelTimer = useCallback(() => {
    if (isTraveling && travelStartTime) {
      const elapsed = Math.floor((Date.now() - travelStartTime) / 1000);
      const total = accumulatedTravelTimeRef.current + elapsed;
      setTravelTime(total);
      setTotalTravelTime(total);
    }
  }, [isTraveling, travelStartTime]);

  const updateWorkTimer = useCallback(() => {
    if (isWorking && workStartTime) {
      const elapsed = Math.floor((Date.now() - workStartTime) / 1000);
      const total = accumulatedWorkTimeRef.current + elapsed;
      setWorkTime(total);
      setTotalWorkTime(total);
    }
  }, [isWorking, workStartTime]);

  // Timer effect for travel time - optimizovano da ne pravi nepotrebne re-renderovanja
  useEffect(() => {
    let interval;
    if (isTraveling && travelStartTime) {
      interval = setInterval(updateTravelTimer, 1000);
    } else {
      // Ako nije traveling, postavi vreme na akumulirano
      setTravelTime(accumulatedTravelTimeRef.current);
      setTotalTravelTime(accumulatedTravelTimeRef.current);
    }
    return () => clearInterval(interval);
  }, [isTraveling, travelStartTime, updateTravelTimer]);

  // Timer effect for work time - optimizovano da ne pravi nepotrebne re-renderovanja
  useEffect(() => {
    let interval;
    if (isWorking && workStartTime) {
      interval = setInterval(updateWorkTimer, 1000);
    } else {
      // Ako nije working, postavi vreme na akumulirano
      setWorkTime(accumulatedWorkTimeRef.current);
      setTotalWorkTime(accumulatedWorkTimeRef.current);
    }
    return () => clearInterval(interval);
  }, [isWorking, workStartTime, updateWorkTimer]);

  // Update worker status without changing job status
  const updateWorkerStatusOnly = useCallback(async (workerStatus, notes = '') => {
    try {
      const token = user?.token;
      if (!token || !user?.result?._id) {
        console.warn('Cannot update worker status: missing token or user ID');
        return;
      }
      
      await axios.put(
        `${API_BASE_URL}/api/worker/${user.result._id}/status`,
        {
          status: workerStatus,
          currentJobId: job._id,
          location: job.clientAddress || 'Nepoznata adresa',
          notes: notes || `Posao: ${job.clientName || job._id}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log(`✅ Worker status updated to: ${workerStatus}`);
    } catch (error) {
      console.error('Error updating worker status:', error);
      // Don't throw - allow timers to continue even if status update fails
    }
  }, [user, job]);

  const updateJobStatus = async (newStatus) => {
    try {
      setLoading(true);
      const token = user?.token;
      
      // Update job status
      await axios.patch(
        `${API_BASE_URL}/api/jobs/${job._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update worker status
      await axios.put(
        `${API_BASE_URL}/api/worker/${user.result._id}/status`,
        {
          status: newStatus.toLowerCase().replace(' ', '_'),
          currentJobId: job._id,
          location: job.clientAddress || 'Nepoznata adresa',
          notes: `Posao: ${job._id}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCurrentStatus(newStatus.toLowerCase());
      
      // Emit WebSocket event instead of calling onStatusUpdate
      emitJobStatusUpdate({
        jobId: job._id,
        status: newStatus,
        workerId: user?.result?._id,
        workerName: user?.result?.name,
        timestamp: new Date().toISOString()
      });
      
      if (onStatusUpdate) {
        onStatusUpdate(newStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      console.error('Job ID:', job._id);
      console.error('New Status:', newStatus);
      console.error('User ID:', user?.result?._id);
      
      // Show user-friendly error message
      if (error.response?.status === 404) {
        console.error('Job not found or API endpoint incorrect');
      } else if (error.response?.status === 401) {
        console.error('Unauthorized - token may be expired');
      } else {
        console.error('Unknown error:', error.response?.data || error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const startTravel = () => {
    // Stop work if it's active
    if (isWorking) {
      setIsWorking(false);
      const currentSessionTime = workTime - accumulatedWorkTimeRef.current;
      accumulatedWorkTimeRef.current += currentSessionTime;
      setWorkStartTime(null);
      saveAccumulatedTimes();
      // Clear work timer from localStorage
      const jobId = job?._id;
      if (jobId) {
        localStorage.removeItem(`isWorking_${jobId}`);
        localStorage.removeItem(`workStartTime_${jobId}`);
      }
    }
    
    const now = Date.now();
    setIsTraveling(true);
    setIsPaused(false);
    setTravelStartTime(now);
    setWorkStartTime(null);
    
    // Save timer state to localStorage
    const jobId = job?._id;
    if (jobId) {
      localStorage.setItem(`isTraveling_${jobId}`, 'true');
      localStorage.setItem(`travelStartTime_${jobId}`, now.toString());
    }
    
    // Ne ažuriraj status odmah, samo pokreni timer
    addTimeLog('start_travel', 'Krenuo ka stranci');
    
    // Update job status to 'On Road' so it shows as active
    updateJobStatus('On Road');
    
    // Update worker status to 'on_the_road' so admin can see it
    updateWorkerStatusOnly('on_the_road', `Putuje ka stranci: ${job.clientName || 'Stranka'}`);
  };

  const pauseTravel = useCallback(() => {
    setIsTraveling(false);
    setIsPaused(true);
    // Sačuvaj trenutno vreme putovanja u ref (oduzmi akumulirano da dobijemo samo trenutno)
    const currentSessionTime = travelTime - accumulatedTravelTimeRef.current;
    accumulatedTravelTimeRef.current += currentSessionTime;
    setTravelStartTime(null);
    saveAccumulatedTimes(); // Sačuvaj u localStorage
    
    // Clear travel timer from localStorage
    const jobId = job?._id;
    if (jobId) {
      localStorage.removeItem(`isTraveling_${jobId}`);
      localStorage.removeItem(`travelStartTime_${jobId}`);
    }
    
    addTimeLog('pause_travel', 'Pauzirao putovanje');
    
    // Update worker status - keep 'on_the_road' but paused
    updateWorkerStatusOnly('on_the_road', `Pauzirao putovanje - Posao: ${job.clientName || 'Stranka'}`);
  }, [travelTime, saveAccumulatedTimes, job]);

  const resumeTravel = useCallback(() => {
    const now = Date.now();
    setIsTraveling(true);
    setIsPaused(false);
    // Ne resetujemo travelTime, već počinjemo novu sesiju
    setTravelStartTime(now);
    
    // Save timer state to localStorage
    const jobId = job?._id;
    if (jobId) {
      localStorage.setItem(`isTraveling_${jobId}`, 'true');
      localStorage.setItem(`travelStartTime_${jobId}`, now.toString());
    }
    
    addTimeLog('resume_travel', 'Nastavio putovanje');
    
    // Update job status back to 'On Road'
    updateJobStatus('On Road');
    
    // Update worker status back to 'on_the_road'
    updateWorkerStatusOnly('on_the_road', `Nastavio putovanje - Posao: ${job.clientName || 'Stranka'}`);
  }, [job, updateWorkerStatusOnly]);

  const arriveAtClient = () => {
    setIsTraveling(false);
    setIsWorking(false);
    setIsPaused(false);
    // Sačuvaj trenutno vreme putovanja u ref (oduzmi akumulirano da dobijemo samo trenutno)
    const currentSessionTime = travelTime - accumulatedTravelTimeRef.current;
    accumulatedTravelTimeRef.current += currentSessionTime;
    setTravelTime(0);
    setTravelStartTime(null);
    setWorkStartTime(null);
    saveAccumulatedTimes(); // Sačuvaj u localStorage
    // Don't update job status immediately to avoid page reload
    addTimeLog('arrive_client', 'Stigao kod stranke');
  };

  const startWork = () => {
    // Stop travel if it's active
    if (isTraveling) {
      setIsTraveling(false);
      const currentSessionTime = travelTime - accumulatedTravelTimeRef.current;
      accumulatedTravelTimeRef.current += currentSessionTime;
      setTravelStartTime(null);
      saveAccumulatedTimes();
      // Clear travel timer from localStorage
      const jobId = job?._id;
      if (jobId) {
        localStorage.removeItem(`isTraveling_${jobId}`);
        localStorage.removeItem(`travelStartTime_${jobId}`);
      }
    }
    
    const now = Date.now();
    setIsWorking(true);
    setIsPaused(false);
    setHasStartedWork(true);
    setWorkStartTime(now);
    
    // Save timer state to localStorage
    const jobId = job?._id;
    if (jobId) {
      localStorage.setItem(`isWorking_${jobId}`, 'true');
      localStorage.setItem(`workStartTime_${jobId}`, now.toString());
    }
    
    // Don't update job status immediately to avoid page reload
    addTimeLog('start_work', 'Počeo rad');
    
    // Update job status to 'In Repair' so it shows as active
    updateJobStatus('In Repair');
    
    // Update worker status to 'at_client' so admin can see it
    updateWorkerStatusOnly('at_client', `Radi kod stranke: ${job.clientName || 'Stranka'}`);
  };

  const pauseWork = () => {
    setIsWorking(false);
    setIsPaused(true);
    // Sačuvaj trenutno vreme rada u ref (oduzmi akumulirano da dobijemo samo trenutno)
    const currentSessionTime = workTime - accumulatedWorkTimeRef.current;
    accumulatedWorkTimeRef.current += currentSessionTime;
    setWorkStartTime(null);
    saveAccumulatedTimes(); // Sačuvaj u localStorage
    
    // Clear work timer from localStorage
    const jobId = job?._id;
    if (jobId) {
      localStorage.removeItem(`isWorking_${jobId}`);
      localStorage.removeItem(`workStartTime_${jobId}`);
    }
    
    addTimeLog('pause_work', 'Pauzirao rad');
    
    // Update worker status - keep 'at_client' but paused
    updateWorkerStatusOnly('at_client', `Pauzirao rad - Posao: ${job.clientName || 'Stranka'}`);
  };

  const resumeWork = () => {
    const now = Date.now();
    setIsWorking(true);
    setIsPaused(false);
    // Ne resetujemo workTime, već počinjemo novu sesiju
    setWorkStartTime(now);
    
    // Save timer state to localStorage
    const jobId = job?._id;
    if (jobId) {
      localStorage.setItem(`isWorking_${jobId}`, 'true');
      localStorage.setItem(`workStartTime_${jobId}`, now.toString());
    }
    
    addTimeLog('resume_work', 'Nastavio rad');
    
    // Update job status back to 'In Repair'
    updateJobStatus('In Repair');
    
    // Update worker status back to 'at_client'
    updateWorkerStatusOnly('at_client', `Nastavio rad - Posao: ${job.clientName || 'Stranka'}`);
  };

  const completeJob = () => {
    setIsTraveling(false);
    setIsWorking(false);
    setIsPaused(false);
    // Sačuvaj trenutno vreme rada u ref (oduzmi akumulirano da dobijemo samo trenutno)
    const currentSessionTime = workTime - accumulatedWorkTimeRef.current;
    accumulatedWorkTimeRef.current += currentSessionTime;
    setTravelStartTime(null);
    setWorkStartTime(null);
    saveAccumulatedTimes(); // Sačuvaj u localStorage
    
    // Clear timer states from localStorage
    const jobId = job?._id;
    if (jobId) {
      localStorage.removeItem(`isTraveling_${jobId}`);
      localStorage.removeItem(`travelStartTime_${jobId}`);
      localStorage.removeItem(`isWorking_${jobId}`);
      localStorage.removeItem(`workStartTime_${jobId}`);
    }
    
    // Don't update job status yet - wait for report submission
    addTimeLog('complete', 'Završio posao');
    // Prikaži formu za rezime posla
    setShowReportForm(true);
  };

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSparePart = (partId) => {
    const part = spareParts.find(p => p._id === partId);
    if (!part) return;

    const existingPart = reportData.usedSpareParts.find(p => p._id === partId);
    if (existingPart) {
      // Update quantity
      setReportData(prev => ({
        ...prev,
        usedSpareParts: prev.usedSpareParts.map(p => 
          p._id === partId ? { ...p, quantity: (p.quantity || 1) + 1 } : p
        )
      }));
    } else {
      // Add new part
      setReportData(prev => ({
        ...prev,
        usedSpareParts: [...prev.usedSpareParts, { ...part, quantity: 1 }]
      }));
    }
  };

  const handleRemoveSparePart = (partId) => {
    setReportData(prev => ({
      ...prev,
      usedSpareParts: prev.usedSpareParts.filter(p => p._id !== partId)
    }));
  };

  const handleUpdateSparePartQuantity = (partId, quantity) => {
    if (quantity <= 0) {
      handleRemoveSparePart(partId);
      return;
    }
    
    setReportData(prev => ({
      ...prev,
      usedSpareParts: prev.usedSpareParts.map(p => 
        p._id === partId ? { ...p, quantity: parseInt(quantity) } : p
      )
    }));
  };

  const submitReport = async () => {
    try {
      setLoading(true);
      const token = user?.token;

      // Pošalji izveštaj na backend
      await axios.post(
        `${API_BASE_URL}/api/jobs/${job._id}/report`,
        {
          ...reportData,
          usedSpareParts: reportData.usedSpareParts, // Include spare parts data
          totalTravelTime: accumulatedTravelTimeRef.current,
          totalWorkTime: accumulatedWorkTimeRef.current,
          completedAt: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Report submitted successfully');
      setShowReportForm(false);
      
      // Update job status to Completed after report submission
      await updateJobStatus('Completed');
      
      // Clear localStorage after successful report submission
      const jobId = job?._id;
      if (jobId) {
        localStorage.removeItem(`travelTime_${jobId}`);
        localStorage.removeItem(`workTime_${jobId}`);
        localStorage.removeItem(`isTraveling_${jobId}`);
        localStorage.removeItem(`travelStartTime_${jobId}`);
        localStorage.removeItem(`isWorking_${jobId}`);
        localStorage.removeItem(`workStartTime_${jobId}`);
      }
      
      // Emit WebSocket event for job completion
      emitJobStatusUpdate({
        jobId: job._id,
        status: 'Completed',
        workerId: user?.result?._id,
        workerName: user?.result?.name,
        timestamp: new Date().toISOString(),
        reportSubmitted: true
      });
      
      if (onStatusUpdate) {
        onStatusUpdate('Completed');
      }
    } catch (error) {
      console.error('💥 Error submitting report:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTimeLog = (action, description) => {
    const now = new Date();
    const newLog = {
      action,
      description,
      timestamp: now,
      time: now.toLocaleTimeString()
    };
    setTimeLogs(prev => [...prev, newLog]);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      {/* Status Display */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Status Posla</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          currentStatus === 'pending' && !isTraveling && !isWorking && !isPaused ? 'bg-gray-500' :
          isTraveling && !isPaused ? 'bg-blue-500' :
          isPaused && !isWorking ? 'bg-yellow-500' :
          currentStatus === 'at client' && !isWorking && !isPaused ? 'bg-purple-500' :
          isWorking && !isPaused ? 'bg-green-500' :
          isPaused && isWorking ? 'bg-orange-500' :
          'bg-green-500'
        } text-white`}>
          {currentStatus === 'pending' && !isTraveling && !isWorking && !isPaused ? 'Na čekanju' :
           isTraveling && !isPaused ? 'U putu' :
           isPaused && !isWorking ? 'Pauziran put' :
           currentStatus === 'at client' && !isWorking && !isPaused ? 'Kod stranke' :
           isWorking && !isPaused ? 'U radu' :
           isPaused && isWorking ? 'Pauziran rad' :
           'Završeno'}
        </div>
      </div>

      {/* Time Tracker */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-300">Vreme puta:</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-mono">{formatTime(travelTime)}</span>
            <button
              onClick={() => {
                setTravelTime(0);
                setTotalTravelTime(0);
                accumulatedTravelTimeRef.current = 0;
                setTravelStartTime(null);
                setIsTraveling(false);
                setIsPaused(false);
                saveAccumulatedTimes();
              }}
              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-1"
              title="Resetuj vreme puta"
            >
              <Square className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-300">Vreme rada:</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-mono">{formatTime(workTime)}</span>
            <button
              onClick={() => {
                setWorkTime(0);
                setTotalWorkTime(0);
                accumulatedWorkTimeRef.current = 0;
                setWorkStartTime(null);
                setIsWorking(false);
                setIsPaused(false);
                setHasStartedWork(false);
                saveAccumulatedTimes();
              }}
              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-1"
              title="Resetuj vreme rada"
            >
              <Square className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* SCENARIO 1: Početno stanje - sva tri dugmeta */}
        {!isTraveling && !isWorking && !isPaused && currentStatus !== 'completed' && (
          <div className="flex gap-2">
            <button
              onClick={startTravel}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-xs font-medium"
            >
              <MapPin className="h-4 w-4" />
              Kreni
            </button>
            <button
              onClick={startWork}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs font-medium"
            >
              <Wrench className="h-4 w-4" />
              Start Rad
            </button>
            <button
              onClick={completeJob}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-xs font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              Završi
            </button>
          </div>
        )}

        {/* SCENARIO 2: U putovanju - samo zaustavi putovanje */}
        {isTraveling && !isPaused && currentStatus !== 'completed' && (
          <div className="flex gap-2">
            <button
              onClick={pauseTravel}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 text-xs font-medium"
            >
              <Pause className="h-4 w-4" />
              Zaustavi Putovanje
            </button>
          </div>
        )}

        {/* SCENARIO 3: Pauziran put - vraća se na početno stanje */}
        {isPaused && !isWorking && currentStatus !== 'completed' && (
          <div className="flex gap-2">
            <button
              onClick={startTravel}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-xs font-medium"
            >
              <MapPin className="h-4 w-4" />
              Kreni
            </button>
            <button
              onClick={startWork}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs font-medium"
            >
              <Wrench className="h-4 w-4" />
              Start Rad
            </button>
            <button
              onClick={completeJob}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-xs font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              Završi
            </button>
          </div>
        )}

        {/* SCENARIO 4: U radu - samo zaustavi rad */}
        {isWorking && !isPaused && currentStatus !== 'completed' && (
          <div className="flex gap-2">
            <button
              onClick={pauseWork}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 text-xs font-medium"
            >
              <Pause className="h-4 w-4" />
              Zaustavi Rad
            </button>
          </div>
        )}

        {/* SCENARIO 4.5: Pauziran rad - vraća se na početno stanje */}
        {isPaused && isWorking && currentStatus !== 'completed' && (
          <div className="flex gap-2">
            <button
              onClick={startTravel}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-xs font-medium"
            >
              <MapPin className="h-4 w-4" />
              Kreni
            </button>
            <button
              onClick={startWork}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs font-medium"
            >
              <Wrench className="h-4 w-4" />
              Start Rad
            </button>
            <button
              onClick={completeJob}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-xs font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              Završi
            </button>
          </div>
        )}

        {/* SCENARIO 5: Završen posao - prikaži sažetak ili formu za izveštaj */}
        {currentStatus === 'completed' && !showReportForm && (
          <div className="text-center">
            <p className="text-green-400 font-medium mb-3">Posao završen!</p>
            <div className="bg-gray-700 rounded-lg p-3 mb-3">
              <div className="text-xs font-medium text-gray-300 mb-1">
                Ukupno vreme puta: <span className="font-mono text-white font-semibold">{formatTime(accumulatedTravelTimeRef.current)}</span>
              </div>
              <div className="text-xs font-medium text-gray-300">
                Ukupno vreme rada: <span className="font-mono text-white font-semibold">{formatTime(accumulatedWorkTimeRef.current)}</span>
              </div>
            </div>
            
            {/* Prikaži izveštaj ako postoji, inače dugme za kreiranje */}
            {job.report ? (
              <div className="bg-gray-700 rounded-lg p-4 mb-3 text-left">
                <h4 className="text-sm font-semibold text-white mb-3">Rezime Posla</h4>
                <div className="space-y-2 text-xs">
                  {job.report.usedSpareParts && job.report.usedSpareParts.length > 0 && (
                    <div>
                      <span className="text-gray-400">Rezervni delovi:</span>
                      <div className="ml-2 space-y-1">
                        {job.report.usedSpareParts.map((part, index) => (
                          <div key={index} className="text-white">
                            {part.name} ({part.code}) × {part.quantity} = {(part.price * part.quantity).toFixed(2)} RSD
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {job.report.materialsUsed && (
                    <div>
                      <span className="text-gray-400">Dodatni materijali:</span>
                      <span className="text-white ml-2">{job.report.materialsUsed}</span>
                    </div>
                  )}
                  {job.report.workDescription && (
                    <div>
                      <span className="text-gray-400">Opis rada:</span>
                      <span className="text-white ml-2">{job.report.workDescription}</span>
                    </div>
                  )}
                  {job.report.serviceCharged && (
                    <div>
                      <span className="text-gray-400">Naplaćeno:</span>
                      <span className="text-white ml-2">{job.report.serviceCharged}</span>
                    </div>
                  )}
                  {job.report.additionalNotes && (
                    <div>
                      <span className="text-gray-400">Dodatne napomene:</span>
                      <span className="text-white ml-2">{job.report.additionalNotes}</span>
                    </div>
                  )}
                  {job.report.submittedAt && (
                    <div className="text-gray-500 text-xs mt-2">
                      Poslato: {new Date(job.report.submittedAt).toLocaleString('sr-RS')}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowReportForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Popuni Rezime
              </button>
            )}
          </div>
        )}
      </div>

      {/* Time Logs */}
      {timeLogs.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium font-medium text-gray-300 mb-2">Log Aktivnosti</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {timeLogs.map((log, index) => (
              <div key={index} className="flex justify-between items-center text-xs bg-gray-700 p-2 rounded">
                <span className="text-gray-300">{log.description}</span>
                <span className="text-gray-400">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Rezime o Izvršenom Poslu</h3>
                <p className="text-gray-400 text-xs font-medium mt-1">Popunite detalje o završenom poslu</p>
              </div>
              <button
                onClick={() => setShowReportForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Job Summary */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-white mb-3">Rezime Posla</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <span className="text-gray-400">Klijent:</span>
                  <span className="text-white ml-2">{job.clientName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Adresa:</span>
                  <span className="text-white ml-2">{job.clientAddress}</span>
                </div>
                <div>
                  <span className="text-gray-400">Vreme puta:</span>
                  <span className="text-white ml-2 font-mono">{formatTime(accumulatedTravelTimeRef.current)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Vreme rada:</span>
                  <span className="text-white ml-2 font-mono">{formatTime(accumulatedWorkTimeRef.current)}</span>
                </div>
              </div>
            </div>

            {/* Report Form */}
            <form className="space-y-4">
              {/* Materials Used - Spare Parts */}
              <div>
                <label className="block text-xs font-medium font-medium text-gray-300 mb-2">
                  Potrošeni Materijal
                </label>
                
                {/* Available Spare Parts */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-2">Dostupni rezervni delovi:</label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {spareParts.map((part) => (
                      <div key={part._id} className="flex items-center justify-between bg-gray-700 rounded p-2">
                        <div className="flex-1">
                          <span className="text-white text-xs">{part.name} ({part.code})</span>
                          <div className="text-gray-400 text-xs">
                            {part.price} RSD - Dostupno: {part.quantity}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddSparePart(part._id)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          disabled={part.quantity <= 0}
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Spare Parts */}
                {reportData.usedSpareParts.length > 0 && (
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-2">Izabrani rezervni delovi:</label>
                    <div className="space-y-2">
                      {reportData.usedSpareParts.map((part) => (
                        <div key={part._id} className="flex items-center justify-between bg-gray-600 rounded p-2">
                          <div className="flex-1">
                            <span className="text-white text-xs">{part.name} ({part.code})</span>
                            <div className="text-gray-300 text-xs">
                              {part.price} RSD × {part.quantity} = {(part.price * part.quantity).toFixed(2)} RSD
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              value={part.quantity}
                              onChange={(e) => handleUpdateSparePartQuantity(part._id, e.target.value)}
                              className="w-12 px-1 py-1 bg-gray-700 border border-gray-500 rounded text-white text-xs text-center"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSparePart(part._id)}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Materials Textarea */}
                <textarea
                  name="materialsUsed"
                  value={reportData.materialsUsed}
                  onChange={handleReportChange}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dodatni materijal ili napomene..."
                />
              </div>

              {/* Work Description */}
              <div>
                <label className="block text-xs font-medium font-medium text-gray-300 mb-2">
                  Opis Izvršenog Posla
                </label>
                <textarea
                  name="workDescription"
                  value={reportData.workDescription}
                  onChange={handleReportChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detaljno opišite šta je urađeno..."
                />
              </div>

              {/* Service Charged */}
              <div>
                <label className="block text-xs font-medium font-medium text-gray-300 mb-2">
                  Naplaćena Usluga (RSD)
                </label>
                <input
                  type="number"
                  name="serviceCharged"
                  value={reportData.serviceCharged}
                  onChange={handleReportChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>


              {/* Digital Signature */}
              <div>
                <label className="block text-xs font-medium font-medium text-gray-300 mb-2">
                  Digitalni Potpis Stranke
                </label>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-xs font-medium">Stranka može da potpiše ovde</p>
                    <p className="text-gray-500 text-xs mt-1">(Funkcionalnost u razvoju)</p>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-medium font-medium text-gray-300 mb-2">
                  Dodatne Napomene
                </label>
                <textarea
                  name="additionalNotes"
                  value={reportData.additionalNotes}
                  onChange={handleReportChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dodatne napomene ili preporuke..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Otkaži
                </button>
                <button
                  type="button"
                  onClick={submitReport}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Arhivira se...' : 'Arhiviraj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(JobStatusControls, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.job?._id === nextProps.job?._id &&
    prevProps.job?.status === nextProps.job?.status &&
    prevProps.user?.token === nextProps.user?.token
  );
});
