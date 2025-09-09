import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ArrowUp, ArrowDown } from 'lucide-react';
import moment from 'moment';

const TimeComparisonDropdown = ({ selectedPeriod, onChange }) => {
  const options = [
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'lastYear', label: 'Last Year' },
  ];

  return (
    <select
      className="text-sm bg-gray-700 border-gray-600 text-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
      value={selectedPeriod}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          vs {option.label}
        </option>
      ))}
    </select>
  );
};

const MetricCard = ({ title, value, trend, comparisonPeriod, loading }) => {
  const getTrendColor = () => {
    if (trend > 0) return 'text-green-300 bg-green-900';
    if (trend < 0) return 'text-red-300 bg-red-900';
    return 'text-gray-300 bg-gray-800';
  };

  const getFormattedTrend = () => {
    if (trend > 0) return `+${trend}%`;
    return `${trend}%`;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        <TimeComparisonDropdown 
          selectedPeriod={comparisonPeriod}
          onChange={(period) => console.log(`${title} comparison period changed to ${period}`)}
        />
      </div>
      {loading ? (
        <div className="animate-pulse h-8 bg-gray-700 rounded mt-2"></div>
      ) : (
        <div className="mt-2">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="flex items-center mt-1">
            <span className={`text-xs px-1.5 py-0.5 rounded-full flex items-center ${getTrendColor()}`}>
              {trend > 0 ? (
                <ArrowUp className="h-3 w-3 mr-0.5" />
              ) : trend < 0 ? (
                <ArrowDown className="h-3 w-3 mr-0.5" />
              ) : null}
              {getFormattedTrend()}
            </span>
            <span className="text-xs text-gray-400 ml-1">from previous period</span>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    activeJobs: { value: 0, trend: 0, comparisonPeriod: 'yesterday' },
    activeClients: { value: 0, trend: 0, comparisonPeriod: 'yesterday' },
    totalRevenue: { value: '$0', trend: 0, comparisonPeriod: 'yesterday' }
  });
  const [loading, setLoading] = useState(true);
  
  const { jobs } = useSelector(state => state.jobs);
  const { clients } = useSelector(state => state.clients);

  useEffect(() => {
    // Simulate API call or data calculation
    const calculateMetrics = () => {
      setLoading(true);
      
      setTimeout(() => {
        // This would normally be an API call or calculation based on real data
        const activeJobsCount = jobs?.filter(job => job.status === 'active').length || 0;
        const activeClientsCount = clients?.filter(client => client.status === 'active').length || 0;
        const totalRevenueValue = jobs?.reduce((sum, job) => sum + (job.totalAmount || 0), 0) || 0;
        
        setMetrics({
          activeJobs: { 
            value: activeJobsCount, 
            trend: 12, // Example trend percentage
            comparisonPeriod: metrics.activeJobs.comparisonPeriod 
          },
          activeClients: { 
            value: activeClientsCount, 
            trend: -5, // Example trend percentage
            comparisonPeriod: metrics.activeClients.comparisonPeriod 
          },
          totalRevenue: { 
            value: `$${totalRevenueValue.toLocaleString()}`, 
            trend: 8, // Example trend percentage
            comparisonPeriod: metrics.totalRevenue.comparisonPeriod 
          }
        });
        setLoading(false);
      }, 800);
    };

    calculateMetrics();
  }, [jobs, clients]);

  const handleComparisonPeriodChange = (metricKey, period) => {
    setMetrics(prev => ({
      ...prev,
      [metricKey]: {
        ...prev[metricKey],
        comparisonPeriod: period
      }
    }));
    
    // Here you would typically recalculate the metric based on the new comparison period
    // For now, we'll just simulate a loading state and then set random trends
    setLoading(true);
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        [metricKey]: {
          ...prev[metricKey],
          trend: Math.floor(Math.random() * 41) - 20 // Random trend between -20 and 20
        }
      }));
      setLoading(false);
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard 
        title="Active Jobs" 
        value={metrics.activeJobs.value}
        trend={metrics.activeJobs.trend}
        comparisonPeriod={metrics.activeJobs.comparisonPeriod}
        loading={loading}
        onPeriodChange={(period) => handleComparisonPeriodChange('activeJobs', period)}
      />
      <MetricCard 
        title="Active Clients" 
        value={metrics.activeClients.value}
        trend={metrics.activeClients.trend}
        comparisonPeriod={metrics.activeClients.comparisonPeriod}
        loading={loading}
        onPeriodChange={(period) => handleComparisonPeriodChange('activeClients', period)}
      />
      <MetricCard 
        title="Total Revenue" 
        value={metrics.totalRevenue.value}
        trend={metrics.totalRevenue.trend}
        comparisonPeriod={metrics.totalRevenue.comparisonPeriod}
        loading={loading}
        onPeriodChange={(period) => handleComparisonPeriodChange('totalRevenue', period)}
      />
    </div>
  );
};

export default DashboardMetrics; 