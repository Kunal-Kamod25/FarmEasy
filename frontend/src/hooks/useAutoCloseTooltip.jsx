import React, { useState, useEffect, useRef } from 'react';

/**
 * Custom Tooltip Content Component for Recharts with 3-second auto-close
 * Usage: <Tooltip content={<AutoCloseTooltipContent duration={3000} />} />
 */
export const AutoCloseTooltipContent = ({ 
  active, 
  payload, 
  label, 
  formatter,
  itemStyle,
  labelStyle,
  contentStyle,
  duration = 3000 
}) => {
  const [displayTooltip, setDisplayTooltip] = useState(false);
  const [visibilityTimer, setVisibilityTimer] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (active && payload && payload.length > 0) {
      setDisplayTooltip(true);

      // Clear existing timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new auto-close timer
      timeoutRef.current = setTimeout(() => {
        setDisplayTooltip(false);
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [active, payload, duration]);

  if (!displayTooltip || !payload || payload.length === 0) {
    return null;
  }

  const defaultContentStyle = {
    borderRadius: 12,
    border: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    padding: '12px 16px',
    ...contentStyle
  };

  const defaultItemStyle = {
    fontWeight: 700,
    fontSize: 13,
    color: '#1e293b',
    ...itemStyle
  };

  const defaultLabelStyle = {
    fontWeight: 800,
    marginBottom: 4,
    color: '#1e293b',
    ...labelStyle
  };

  return (
    <div style={defaultContentStyle}>
      {label && (
        <p style={defaultLabelStyle}>{label}</p>
      )}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}> 
        {payload.map((entry, index) => {
          const value = formatter ? formatter(entry.value, entry.name) : entry.value;
          const displayValue = Array.isArray(value) ? value[0] : value;
          const displayName = Array.isArray(value) ? value[1] : entry.name;

          return (
            <li key={index} style={defaultItemStyle}>
              <span style={{ color: entry.color }}>{displayName}: </span>
              <span>{displayValue}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/**
 * Tooltip wrapper config generator that adds 3-second auto-close
 * Usage: <Tooltip {...getAutoCloseTooltipProps({ contentStyle: {...} })} />
 */
export const getAutoCloseTooltipProps = (config = {}) => {
  return {
    content: <AutoCloseTooltipContent {...config} />,
    wrapperStyle: { outline: 'none' }
  };
};
