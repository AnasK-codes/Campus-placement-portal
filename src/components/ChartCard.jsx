import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ChartContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  .title {
    font-size: 1.3rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};

    .icon {
      font-size: 1.5rem;
    }
  }

  .subtitle {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

const ChartControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ControlButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.primary};
    color: white;
  }
`;

const ChartArea = styled.div`
  width: 100%;
  height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BarChart = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: end;
  justify-content: space-around;
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

const Bar = styled(motion.div)`
  background: linear-gradient(180deg, #D32F2F, #f44336);
  border-radius: 4px 4px 0 0;
  min-width: 30px;
  position: relative;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: linear-gradient(180deg, #B71C1C, #D32F2F);
    transform: scale(1.05);
  }

  .bar-label {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    white-space: nowrap;
  }

  .bar-value {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    padding: 2px 6px;
    border-radius: 4px;
    box-shadow: ${({ theme }) => theme.shadows.sm};
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }

  &:hover .bar-value {
    opacity: 1;
  }
`;

const PieChart = styled.div`
  width: 250px;
  height: 250px;
  position: relative;
  margin: 0 auto;
`;

const PieSlice = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
  }
`;

const PieLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 0.8rem;

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    background: ${({ color }) => color};
  }

  .legend-label {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
  }

  .legend-value {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const LineChart = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const LineChartSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const LineChartPath = styled(motion.path)`
  fill: none;
  stroke: #D32F2F;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const LineChartDot = styled(motion.circle)`
  fill: #D32F2F;
  stroke: white;
  stroke-width: 2;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    r: 6;
    fill: #B71C1C;
  }
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  font-size: 0.8rem;
  box-shadow: ${({ theme }) => theme.shadows.md};
  pointer-events: none;
  z-index: 10;

  .tooltip-label {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }

  .tooltip-value {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textSecondary};

  .icon {
    font-size: 3rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .message {
    font-size: 1rem;
    font-weight: 500;
  }
`;

const ChartCard = ({ 
  title, 
  subtitle,
  icon,
  type = 'bar', 
  data = [], 
  options = {},
  controls = [],
  onControlChange,
  animationDelay = 0
}) => {
  const [activeControl, setActiveControl] = useState(controls[0]?.value || '');
  const [tooltip, setTooltip] = useState(null);
  const chartRef = useRef(null);

  const handleControlChange = (value) => {
    setActiveControl(value);
    if (onControlChange) {
      onControlChange(value);
    }
  };

  const renderBarChart = () => {
    if (!data.length) {
      return (
        <EmptyState>
          <div className="icon">📊</div>
          <div className="message">No data available</div>
        </EmptyState>
      );
    }

    const maxValue = Math.max(...data.map(item => item.value));

    return (
      <BarChart>
        {data.map((item, index) => (
          <Bar
            key={item.label}
            style={{ 
              height: `${(item.value / maxValue) * 100}%`,
              backgroundColor: item.color || '#D32F2F'
            }}
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ 
              delay: animationDelay + (index * 0.1),
              duration: 0.8,
              ease: "easeOut"
            }}
          >
            <div className="bar-label">{item.label}</div>
            <div className="bar-value">{item.value}</div>
          </Bar>
        ))}
      </BarChart>
    );
  };

  const renderPieChart = () => {
    if (!data.length) {
      return (
        <EmptyState>
          <div className="icon">🥧</div>
          <div className="message">No data available</div>
        </EmptyState>
      );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const colors = ['#D32F2F', '#f44336', '#FF5722', '#FF9800', '#FFC107', '#FFEB3B'];

    return (
      <>
        <PieChart>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            const color = item.color || colors[index % colors.length];

            return (
              <PieSlice
                key={item.label}
                style={{
                  background: `conic-gradient(${color} ${startAngle}deg ${currentAngle}deg, transparent ${currentAngle}deg)`
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: animationDelay + (index * 0.1),
                  duration: 0.5
                }}
              />
            );
          })}
        </PieChart>
        <PieLegend>
          {data.map((item, index) => (
            <LegendItem key={item.label} color={item.color || colors[index % colors.length]}>
              <div className="legend-color" />
              <span className="legend-label">{item.label}</span>
              <span className="legend-value">({item.value})</span>
            </LegendItem>
          ))}
        </PieLegend>
      </>
    );
  };

  const renderLineChart = () => {
    if (!data.length) {
      return (
        <EmptyState>
          <div className="icon">📈</div>
          <div className="message">No data available</div>
        </EmptyState>
      );
    }

    const width = 400;
    const height = 250;
    const padding = 40;
    const maxValue = Math.max(...data.map(item => item.value));
    const minValue = Math.min(...data.map(item => item.value));

    const points = data.map((item, index) => ({
      x: padding + (index * (width - 2 * padding)) / (data.length - 1),
      y: height - padding - ((item.value - minValue) / (maxValue - minValue)) * (height - 2 * padding),
      ...item
    }));

    const pathData = points.reduce((path, point, index) => {
      return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
    }, '');

    return (
      <LineChart>
        <LineChartSVG viewBox={`0 0 ${width} ${height}`}>
          <LineChartPath
            d={pathData}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ 
              delay: animationDelay,
              duration: 2,
              ease: "easeInOut"
            }}
          />
          {points.map((point, index) => (
            <LineChartDot
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: animationDelay + (index * 0.1),
                duration: 0.3
              }}
              onMouseEnter={(e) => {
                const rect = chartRef.current.getBoundingClientRect();
                setTooltip({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  label: point.label,
                  value: point.value
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </LineChartSVG>
        
        <AnimatePresence>
          {tooltip && (
            <Tooltip
              style={{ left: tooltip.x, top: tooltip.y - 60 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="tooltip-label">{tooltip.label}</div>
              <div className="tooltip-value">{tooltip.value}</div>
            </Tooltip>
          )}
        </AnimatePresence>
      </LineChart>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <ChartContainer
      ref={chartRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
      whileHover={{ scale: 1.01 }}
    >
      <ChartHeader>
        <div>
          <div className="title">
            {icon && <span className="icon">{icon}</span>}
            {title}
          </div>
          {subtitle && <div className="subtitle">{subtitle}</div>}
        </div>

        {controls.length > 0 && (
          <ChartControls>
            {controls.map((control) => (
              <ControlButton
                key={control.value}
                active={activeControl === control.value}
                onClick={() => handleControlChange(control.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {control.label}
              </ControlButton>
            ))}
          </ChartControls>
        )}
      </ChartHeader>

      <ChartArea>
        {renderChart()}
      </ChartArea>
    </ChartContainer>
  );
};

export default ChartCard;
