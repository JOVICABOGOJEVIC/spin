import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TrendingUp, TrendingDown, Minus, Clock, DollarSign, Users } from 'lucide-react';
import { getActiveJobsCount, getActiveClientsCount, getTotalRevenue } from '../../actions/dashboardActions';
import MetricsFilter from './MetricsFilter';

const TimeComparisonFilter = ({ selectedPeriod, onChange }) => {
  const options = [
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'lastYear', label: 'Last Year' },
  ];

  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm text-gray-300">Compare with:</span>
      <div className="flex space-x-1">
        {options.map((option) => (
          <button
            key={option.value}
            className={`px-2 py-1 text-xs font-medium rounded-md ${
              selectedPeriod === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const MetricSelector = ({ options, selectedMetric, onChange }) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm text-gray-300">Metric:</span>
      <div className="flex space-x-1">
        {options.map((option) => (
          <button
            key={option.value}
            className={`px-2 py-1 text-xs font-medium rounded-md ${
              selectedMetric === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Simple bar representation component
const BarDisplay = ({ data, selectedMetric }) => {
  const maxValue = Math.max(...data.map(item => Math.max(item.current, item.previous)));
  
  const getBarWidth = (value) => {
    return (value / maxValue) * 100;
  };
  
  const formatValue = (value) => {
    if (selectedMetric === 'totalRevenue') {
      return `$${value}`;
    }
    return value;
  };
  
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="mb-4">
          <div className="text-sm font-medium text-gray-300 mb-1">{item.day}</div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-20 text-xs text-gray-400">Current:</div>
              <div className="flex-1 bg-gray-700 h-5 rounded-md overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-md" 
                  style={{ width: `${getBarWidth(item.current)}%` }}
                ></div>
              </div>
              <div className="ml-2 text-xs font-medium text-blue-400">
                {formatValue(item.current)}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-20 text-xs text-gray-400">Previous:</div>
              <div className="flex-1 bg-gray-700 h-5 rounded-md overflow-hidden">
                <div 
                  className="bg-gray-500 h-full rounded-md" 
                  style={{ width: `${getBarWidth(item.previous)}%` }}
                ></div>
              </div>
              <div className="ml-2 text-xs font-medium text-gray-400">
                {formatValue(item.previous)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ComparativeMetrics = () => {
  const dispatch = useDispatch();
  const { 
    activeJobs = { current: 0, previous: 0 }, 
    activeClients = { current: 0, previous: 0 }, 
    totalRevenue = { current: 0, previous: 0 } 
  } = useSelector(state => state.dashboard || {});
  
  const [selectedPeriod, setSelectedPeriod] = useState('lastMonth');
  const [comparisonPeriod, setComparisonPeriod] = useState('lastWeek');
  const [selectedMetric, setSelectedMetric] = useState('activeJobs');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const metricOptions = [
    { value: 'activeJobs', label: 'Active Jobs' },
    { value: 'activeClients', label: 'Active Clients' },
    { value: 'totalRevenue', label: 'Total Revenue' },
  ];

  // Render trend indicator
  const renderTrendIndicator = (trend) => {
    if (trend > 0) {
      return (
        <div className="flex items-center text-green-300">
          <TrendingUp size={16} className="mr-1" />
          <span>+{trend.toFixed(1)}%</span>
        </div>
      );
    } else if (trend < 0) {
      return (
        <div className="flex items-center text-red-300">
          <TrendingDown size={16} className="mr-1" />
          <span>{trend.toFixed(1)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-400">
          <Minus size={16} className="mr-1" />
          <span>0%</span>
        </div>
      );
    }
  };

  const currentMetricData = {
    activeJobs,
    activeClients,
    totalRevenue
  }[selectedMetric];

  const chartData = useMemo(() => {
    if (!currentMetricData || (!currentMetricData.current && currentMetricData.current !== 0)) {
      return [];
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => ({
      day,
      current: currentMetricData.current,
      previous: currentMetricData.previous
    }));
  }, [currentMetricData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          dispatch(getActiveJobsCount(selectedPeriod)),
          dispatch(getActiveClientsCount(selectedPeriod)),
          dispatch(getTotalRevenue(selectedPeriod))
        ]);
      } catch (err) {
        setError('Failed to fetch metrics data');
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod, dispatch]);

  // Calculate trend percentage
  const calculateTrend = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const trend = currentMetricData ? calculateTrend(currentMetricData.current, currentMetricData.previous) : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Comparative Metrics</h3>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <MetricSelector
          options={metricOptions}
          selectedMetric={selectedMetric}
          onChange={setSelectedMetric}
        />
        
        <TimeComparisonFilter
          selectedPeriod={comparisonPeriod}
          onChange={setComparisonPeriod}
        />
      </div>
      
      {loading ? (
        <div className="w-full h-64 bg-gray-700 animate-pulse rounded-lg"></div>
      ) : error ? (
        <div className="w-full h-64 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <p className="text-lg mb-2">{error}</p>
            <p className="text-sm">Please try selecting a different period or metric</p>
          </div>
        </div>
      ) : !chartData.length ? (
        <div className="w-full h-64 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <p className="text-lg mb-2">No data available</p>
            <p className="text-sm">There is no data for the selected metric and period</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-64 overflow-y-auto p-2">
          <BarDisplay data={chartData} selectedMetric={selectedMetric} />
          <div className="mt-4 flex justify-center">
            {renderTrendIndicator(trend)}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        Showing comparative data for {selectedMetric === 'activeJobs' ? 'active jobs' : 
          selectedMetric === 'activeClients' ? 'active clients' : 'total revenue'} between current period and {comparisonPeriod}.
      </div>
    </div>
  );
};

export default ComparativeMetrics; 