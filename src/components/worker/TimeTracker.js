import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';

const TimeTracker = ({ jobId, status, onTimeUpdate }) => {
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLogs, setTimeLogs] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(status);

  // Auto-start timer when status changes to active status
  useEffect(() => {
    if (status && (status === 'on_the_road' || status === 'at_client')) {
      if (!isRunning) {
        console.log('🚀 Auto-starting timer for status:', status);
        startTimer();
      }
    } else if (status === 'completed') {
      if (isRunning) {
        console.log('⏹️ Auto-stopping timer for completed status');
        stopTimer();
      }
    }
  }, [status]);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
        
        // Update parent component with elapsed time
        if (onTimeUpdate) {
          onTimeUpdate(elapsed);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, startTime, onTimeUpdate]);

  const startTimer = () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    
    // Log start time
    const newLog = {
      action: 'start',
      timestamp: now,
      status: status
    };
    setTimeLogs(prev => [...prev, newLog]);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    
    // Log pause time
    const now = new Date();
    const newLog = {
      action: 'pause',
      timestamp: now,
      status: status,
      duration: elapsedTime
    };
    setTimeLogs(prev => [...prev, newLog]);
  };

  const stopTimer = () => {
    setIsRunning(false);
    
    // Log stop time
    const now = new Date();
    const newLog = {
      action: 'stop',
      timestamp: now,
      status: status,
      duration: elapsedTime
    };
    setTimeLogs(prev => [...prev, newLog]);
    
    // Reset timer
    setStartTime(null);
    setElapsedTime(0);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'on_the_road': 'bg-blue-500',
      'at_client': 'bg-purple-500',
      'completed': 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'on_the_road': 'U putu',
      'at_client': 'Kod stranke',
      'completed': 'Završeno'
    };
    return labels[status] || status;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracker
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm text-white ${getStatusColor(status)}`}>
          {getStatusLabel(status)}
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-white mb-2">
          {formatTime(elapsedTime)}
        </div>
        <div className="text-sm text-gray-400">
          {isRunning ? 'Aktivno' : 'Zaustavljeno'}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 justify-center">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            Start
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>
        )}
        
        <button
          onClick={stopTimer}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Square className="h-4 w-4" />
          Stop
        </button>
      </div>

      {/* Time Logs */}
      {timeLogs.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Time Logs</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {timeLogs.map((log, index) => (
              <div key={index} className="flex justify-between items-center text-xs bg-gray-700 p-2 rounded">
                <span className="text-gray-300">
                  {log.action} - {getStatusLabel(log.status)}
                </span>
                <span className="text-gray-400">
                  {log.timestamp.toLocaleTimeString()}
                  {log.duration && ` (${formatTime(log.duration)})`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTracker;
