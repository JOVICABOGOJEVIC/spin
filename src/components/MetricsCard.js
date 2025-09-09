const MetricsCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <div 
      className="rounded-lg p-6 shadow-sm"
      style={{
        backgroundColor: 'var(--metrics-card-bg)',
        border: '1px solid var(--metrics-card-border)',
        fontFamily: 'var(--font-family)'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p 
            className="text-sm font-medium"
            style={{ color: 'var(--metrics-text-secondary)' }}
          >
            {title}
          </p>
          <p 
            className="mt-2 text-3xl font-bold"
            style={{ color: 'var(--metrics-value-color)' }}
          >
            {value}
          </p>
        </div>
        
        <div 
          className="rounded-full p-3"
          style={{ 
            backgroundColor: 'var(--metrics-icon-bg)',
            color: 'var(--metrics-icon-color)'
          }}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {trend && (
        <div 
          className="mt-4 text-sm"
          style={{ color: 'var(--metrics-text-secondary)' }}
        >
          <span className={trend.type === 'increase' ? 'text-success' : 'text-error'}>
            {trend.value}%
          </span>
          <span className="ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default MetricsCard; 