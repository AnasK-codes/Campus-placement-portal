import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ChartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const ChartSection = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ChartTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .icon {
    font-size: 1.2rem;
  }
`;

const BarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const BarItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  .label {
    min-width: 120px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
  }

  .bar-container {
    flex: 1;
    height: 24px;
    background: ${({ theme }) => theme.colors.background};
    border-radius: 12px;
    overflow: hidden;
    position: relative;
  }

  .bar-fill {
    height: 100%;
    background: ${({ color }) => color || 'var(--primary)'};
    border-radius: 12px;
    transition: width 1s ease-out;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 8px;
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .value {
    min-width: 40px;
    text-align: right;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 600;
  }
`;

const PieChart = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  position: relative;
  height: 200px;
`;

const PieCanvas = styled.canvas`
  max-width: 180px;
  max-height: 180px;
`;

const PieLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 0.8rem;

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ color }) => color};
  }

  .label {
    color: ${({ theme }) => theme.colors.text};
  }

  .value {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 600;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  .number {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ color }) => color || 'var(--primary)'};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .label {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const TrendChart = styled.div`
  height: 120px;
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TrendCanvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

const Charts = ({ applications = [], internships = [], stats = {} }) => {
  const pieCanvasRef = useRef(null);
  const trendCanvasRef = useRef(null);
  const [chartData, setChartData] = useState({
    applicationsByInternship: [],
    statusDistribution: [],
    monthlyTrend: []
  });

  useEffect(() => {
    // Process data for charts
    const processChartData = () => {
      // Applications by internship
      const internshipCounts = {};
      applications.forEach(app => {
        const internship = internships.find(i => i.id === app.internshipId);
        const key = internship ? `${internship.role} at ${internship.company}` : 'Unknown';
        internshipCounts[key] = (internshipCounts[key] || 0) + 1;
      });

      const applicationsByInternship = Object.entries(internshipCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Status distribution
      const statusDistribution = [
        { name: 'Pending', count: stats.pending || 0, color: '#FF9800' },
        { name: 'Reviewed', count: stats.reviewed || 0, color: '#2196F3' },
        { name: 'Interviewed', count: stats.interviewed || 0, color: '#9C27B0' },
        { name: 'Offered', count: stats.offered || 0, color: '#4CAF50' },
        { name: 'Rejected', count: stats.rejected || 0, color: '#f44336' }
      ].filter(item => item.count > 0);

      // Monthly trend (mock data for now)
      const monthlyTrend = [
        { month: 'Jan', applications: 45, offers: 12 },
        { month: 'Feb', applications: 52, offers: 15 },
        { month: 'Mar', applications: 38, offers: 8 },
        { month: 'Apr', applications: 67, offers: 18 },
        { month: 'May', applications: 73, offers: 22 },
        { month: 'Jun', applications: 59, offers: 16 }
      ];

      setChartData({
        applicationsByInternship,
        statusDistribution,
        monthlyTrend
      });
    };

    processChartData();
  }, [applications, internships, stats]);

  useEffect(() => {
    // Draw pie chart
    const drawPieChart = () => {
      const canvas = pieCanvasRef.current;
      if (!canvas || chartData.statusDistribution.length === 0) return;

      const ctx = canvas.getContext('2d');
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 10;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const total = chartData.statusDistribution.reduce((sum, item) => sum + item.count, 0);
      let currentAngle = -Math.PI / 2;

      chartData.statusDistribution.forEach(item => {
        const sliceAngle = (item.count / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();

        // Draw border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        currentAngle += sliceAngle;
      });
    };

    drawPieChart();
  }, [chartData.statusDistribution]);

  useEffect(() => {
    // Draw trend chart
    const drawTrendChart = () => {
      const canvas = trendCanvasRef.current;
      if (!canvas || chartData.monthlyTrend.length === 0) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const padding = 20;

      ctx.clearRect(0, 0, width, height);

      const maxApplications = Math.max(...chartData.monthlyTrend.map(d => d.applications));
      const maxOffers = Math.max(...chartData.monthlyTrend.map(d => d.offers));
      const maxValue = Math.max(maxApplications, maxOffers);

      const stepX = (width - 2 * padding) / (chartData.monthlyTrend.length - 1);

      // Draw applications line
      ctx.beginPath();
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 3;
      chartData.monthlyTrend.forEach((point, index) => {
        const x = padding + index * stepX;
        const y = height - padding - (point.applications / maxValue) * (height - 2 * padding);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw offers line
      ctx.beginPath();
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      chartData.monthlyTrend.forEach((point, index) => {
        const x = padding + index * stepX;
        const y = height - padding - (point.offers / maxValue) * (height - 2 * padding);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw points
      chartData.monthlyTrend.forEach((point, index) => {
        const x = padding + index * stepX;
        
        // Applications point
        const yApps = height - padding - (point.applications / maxValue) * (height - 2 * padding);
        ctx.beginPath();
        ctx.arc(x, yApps, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#2196F3';
        ctx.fill();

        // Offers point
        const yOffers = height - padding - (point.offers / maxValue) * (height - 2 * padding);
        ctx.beginPath();
        ctx.arc(x, yOffers, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#4CAF50';
        ctx.fill();
      });
    };

    drawTrendChart();
  }, [chartData.monthlyTrend]);

  const getBarColors = () => [
    '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#f44336'
  ];

  return (
    <ChartsContainer>
      <ChartSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChartTitle>
          <span className="icon">📊</span>
          Applications by Internship
        </ChartTitle>
        <BarChart>
          {chartData.applicationsByInternship.map((item, index) => {
            const maxCount = Math.max(...chartData.applicationsByInternship.map(i => i.count));
            const percentage = (item.count / maxCount) * 100;
            const colors = getBarColors();
            
            return (
              <BarItem key={item.name} color={colors[index % colors.length]}>
                <div className="label">{item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name}</div>
                <div className="bar-container">
                  <motion.div
                    className="bar-fill"
                    style={{ backgroundColor: colors[index % colors.length] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    {item.count}
                  </motion.div>
                </div>
                <div className="value">{item.count}</div>
              </BarItem>
            );
          })}
        </BarChart>
      </ChartSection>

      <ChartSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <ChartTitle>
          <span className="icon">🥧</span>
          Application Status
        </ChartTitle>
        <PieChart>
          <PieCanvas
            ref={pieCanvasRef}
            width={180}
            height={180}
          />
        </PieChart>
        <PieLegend>
          {chartData.statusDistribution.map((item, index) => (
            <LegendItem key={item.name} color={item.color}>
              <div className="color-dot" />
              <span className="label">{item.name}</span>
              <span className="value">({item.count})</span>
            </LegendItem>
          ))}
        </PieLegend>
      </ChartSection>

      <ChartSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <ChartTitle>
          <span className="icon">📈</span>
          Monthly Trend
        </ChartTitle>
        <TrendChart>
          <TrendCanvas
            ref={trendCanvasRef}
            width={300}
            height={120}
          />
        </TrendChart>
        <PieLegend>
          <LegendItem color="#2196F3">
            <div className="color-dot" />
            <span className="label">Applications</span>
          </LegendItem>
          <LegendItem color="#4CAF50">
            <div className="color-dot" />
            <span className="label">Offers</span>
          </LegendItem>
        </PieLegend>
      </ChartSection>

      <ChartSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <ChartTitle>
          <span className="icon">📋</span>
          Quick Stats
        </ChartTitle>
        <StatsGrid>
          <StatItem color="#2196F3">
            <div className="number">{stats.total || 0}</div>
            <div className="label">Total Applications</div>
          </StatItem>
          <StatItem color="#4CAF50">
            <div className="number">{stats.offered || 0}</div>
            <div className="label">Offers Made</div>
          </StatItem>
          <StatItem color="#FF9800">
            <div className="number">{stats.pending || 0}</div>
            <div className="label">Pending Review</div>
          </StatItem>
          <StatItem color="#9C27B0">
            <div className="number">{stats.interviewed || 0}</div>
            <div className="label">Interviewed</div>
          </StatItem>
        </StatsGrid>
      </ChartSection>
    </ChartsContainer>
  );
};

export default Charts;
