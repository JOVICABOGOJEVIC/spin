const Calendar = ({ events, onEventClick }) => {
  return (
    <div 
      className="rounded-lg shadow-sm"
      style={{
        backgroundColor: 'var(--calendar-bg)',
        border: '1px solid var(--calendar-border)',
        fontFamily: 'var(--font-family)'
      }}
    >
      <div 
        className="p-4"
        style={{
          backgroundColor: 'var(--calendar-header-bg)',
          borderBottom: '1px solid var(--calendar-border)',
          color: 'var(--calendar-text)'
        }}
      >
        {/* Calendar header */}
      </div>
      
      <div className="p-4">
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div 
              key={day}
              className="text-center p-2 font-medium"
              style={{ color: 'var(--calendar-text)' }}
            >
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => (
            <div
              key={index}
              className={`
                p-2 text-center relative cursor-pointer
                ${isToday(day) ? 'font-bold' : ''}
                ${isSelected(day) ? 'rounded-lg' : ''}
              `}
              style={{
                backgroundColor: isToday(day) ? 'var(--calendar-today-bg)' : 
                               isSelected(day) ? 'var(--calendar-selected-bg)' : 'transparent',
                color: isSelected(day) ? 'var(--calendar-selected-text)' : 'var(--calendar-text)'
              }}
              onClick={() => onDateSelect(day)}
            >
              {day.getDate()}
              
              {/* Events */}
              {getEventsForDay(day).map((event, i) => (
                <div
                  key={i}
                  className="text-xs p-1 mt-1 rounded truncate"
                  style={{
                    backgroundColor: 'var(--calendar-event-bg)',
                    color: 'var(--calendar-event-text)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  {event.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar; 