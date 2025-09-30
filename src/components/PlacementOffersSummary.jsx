import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const SummaryContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  .header-content {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};

    .header-icon {
      font-size: 2.5rem;
    }

    .header-text {
      .title {
        font-size: ${({ theme }) => theme.typography.fontSize.xxl};
        font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
        color: ${({ theme }) => theme.colors.text};
        margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
      }

      .subtitle {
        font-size: ${({ theme }) => theme.typography.fontSize.md};
        color: ${({ theme }) => theme.colors.textSecondary};
        margin: 0;
      }
    }
  }

  .refresh-button {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    transition: all 0.3s ease;

    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
      transform: translateY(-2px);
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ color }) => color};
  }

  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${({ theme }) => theme.spacing.lg};

    .stat-icon {
      font-size: 2rem;
      padding: ${({ theme }) => theme.spacing.md};
      border-radius: ${({ theme }) => theme.borderRadius.lg};
      background: ${({ color }) => `${color}20`};
      color: ${({ color }) => color};
    }

    .stat-trend {
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
      border-radius: ${({ theme }) => theme.borderRadius.md};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};

      &.positive {
        background: ${({ theme }) => `${theme.colors.success}20`};
        color: ${({ theme }) => theme.colors.success};
      }

      &.negative {
        background: ${({ theme }) => `${theme.colors.error}20`};
        color: ${({ theme }) => theme.colors.error};
      }

      &.neutral {
        background: ${({ theme }) => `${theme.colors.textSecondary}20`};
        color: ${({ theme }) => theme.colors.textSecondary};
      }
    }
  }

  .stat-number {
    font-size: ${({ theme }) => theme.typography.fontSize.xxxl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ color }) => color};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    animation: ${({ animate }) => animate ? pulse : 'none'} 2s infinite;
  }

  .stat-label {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    color: ${({ theme }) => theme.colors.text};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .stat-description {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.4;
  }
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  overflow: hidden;

  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${({ theme }) => theme.spacing.lg};

    .chart-title {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text};
    }

    .chart-icon {
      font-size: 1.5rem;
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const CompanyBreakdown = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  overflow: hidden;

  .breakdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${({ theme }) => theme.spacing.lg};

    .breakdown-title {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text};
    }

    .view-all-button {
      background: none;
      border: none;
      color: ${({ theme }) => theme.colors.primary};
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      cursor: pointer;
      text-decoration: underline;

      &:hover {
        color: ${({ theme }) => theme.colors.primaryDark};
      }
    }
  }
`;

const CompanyList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const CompanyItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    transform: translateX(4px);
  }

  .company-info {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};

    .company-logo {
      width: 40px;
      height: 40px;
      border-radius: ${({ theme }) => theme.borderRadius.md};
      background: ${({ theme }) => theme.colors.background};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      border: 1px solid ${({ theme }) => theme.colors.border};
    }

    .company-details {
      .company-name {
        font-size: ${({ theme }) => theme.typography.fontSize.md};
        font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
        color: ${({ theme }) => theme.colors.text};
        margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
      }

      .company-stats {
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
        color: ${({ theme }) => theme.colors.textSecondary};
      }
    }
  }

  .company-metrics {
    display: flex;
    gap: ${({ theme }) => theme.spacing.lg};
    text-align: center;

    .metric {
      .metric-number {
        display: block;
        font-size: ${({ theme }) => theme.typography.fontSize.md};
        font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
        color: ${({ theme }) => theme.colors.primary};
      }

      .metric-label {
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
        color: ${({ theme }) => theme.colors.textSecondary};
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }
`;

const SimpleChart = styled.div`
  .chart-bars {
    display: flex;
    align-items: end;
    gap: ${({ theme }) => theme.spacing.md};
    height: 200px;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  .chart-bar {
    flex: 1;
    background: ${({ theme }) => theme.colors.gradient};
    border-radius: ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0 0;
    min-height: 20px;
    position: relative;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.8;
      transform: translateY(-2px);
    }

    .bar-value {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text};
    }

    .bar-label {
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      color: ${({ theme }) => theme.colors.textSecondary};
      text-align: center;
      width: 100px;
    }
  }
`;

const PlacementOffersSummary = () => {
  const [offers, setOffers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    const offersQuery = query(
      collection(db, 'offers'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(offersQuery, (snapshot) => {
      const offersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOffers(offersData);
      calculateStats(offersData);
      calculateCompanyBreakdown(offersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const calculateStats = (offersData) => {
    const total = offersData.length;
    const pending = offersData.filter(offer => offer.status === 'pending').length;
    const accepted = offersData.filter(offer => offer.status === 'accepted').length;
    const rejected = offersData.filter(offer => 
      offer.status === 'rejected' || offer.status === 'auto-rejected'
    ).length;

    setStats({ total, pending, accepted, rejected });
  };

  const calculateCompanyBreakdown = (offersData) => {
    const companyMap = {};
    
    offersData.forEach(offer => {
      const companyName = offer.companyName;
      if (!companyMap[companyName]) {
        companyMap[companyName] = {
          name: companyName,
          logo: offer.companyLogo,
          total: 0,
          pending: 0,
          accepted: 0,
          rejected: 0
        };
      }
      
      companyMap[companyName].total++;
      companyMap[companyName][offer.status]++;
    });

    const companiesArray = Object.values(companyMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    
    setCompanies(companiesArray);
  };

  const getAcceptanceRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.accepted / stats.total) * 100);
  };

  const getChartData = () => {
    return [
      { label: 'Pending', value: stats.pending, color: '#FFC107' },
      { label: 'Accepted', value: stats.accepted, color: '#4CAF50' },
      { label: 'Rejected', value: stats.rejected, color: '#F44336' }
    ];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  if (loading) {
    return (
      <SummaryContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
          <p>Loading offers summary...</p>
        </div>
      </SummaryContainer>
    );
  }

  return (
    <SummaryContainer>
      <SummaryHeader>
        <div className="header-content">
          <span className="header-icon">📊</span>
          <div className="header-text">
            <h1 className="title">Offers Summary</h1>
            <p className="subtitle">Monitor and analyze internship offers across all companies</p>
          </div>
        </div>
        
        <button className="refresh-button">
          <span>🔄</span>
          Refresh Data
        </button>
      </SummaryHeader>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatsGrid>
          <StatCard
            variants={cardVariants}
            color="#2196F3"
            animate={stats.total > 0}
          >
            <div className="stat-header">
              <div className="stat-icon">🎯</div>
              <div className="stat-trend positive">+12%</div>
            </div>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Offers</div>
            <div className="stat-description">
              Total number of offers extended to students
            </div>
          </StatCard>

          <StatCard
            variants={cardVariants}
            color="#FFC107"
            animate={stats.pending > 0}
          >
            <div className="stat-header">
              <div className="stat-icon">⏳</div>
              <div className="stat-trend neutral">-</div>
            </div>
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Decisions</div>
            <div className="stat-description">
              Offers awaiting student response
            </div>
          </StatCard>

          <StatCard
            variants={cardVariants}
            color="#4CAF50"
            animate={stats.accepted > 0}
          >
            <div className="stat-header">
              <div className="stat-icon">✅</div>
              <div className="stat-trend positive">+8%</div>
            </div>
            <div className="stat-number">{stats.accepted}</div>
            <div className="stat-label">Accepted Offers</div>
            <div className="stat-description">
              Successfully placed students
            </div>
          </StatCard>

          <StatCard
            variants={cardVariants}
            color="#D32F2F"
          >
            <div className="stat-header">
              <div className="stat-icon">📈</div>
              <div className="stat-trend positive">+5%</div>
            </div>
            <div className="stat-number">{getAcceptanceRate()}%</div>
            <div className="stat-label">Acceptance Rate</div>
            <div className="stat-description">
              Percentage of offers accepted by students
            </div>
          </StatCard>
        </StatsGrid>

        <ChartsSection>
          <ChartCard variants={cardVariants}>
            <div className="chart-header">
              <h3 className="chart-title">Offers by Status</h3>
              <span className="chart-icon">📊</span>
            </div>
            <SimpleChart>
              <div className="chart-bars">
                {getChartData().map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="chart-bar"
                    style={{
                      height: `${Math.max((item.value / Math.max(...getChartData().map(d => d.value))) * 160, 20)}px`,
                      background: item.color
                    }}
                    initial={{ height: 0 }}
                    animate={{ 
                      height: `${Math.max((item.value / Math.max(...getChartData().map(d => d.value))) * 160, 20)}px` 
                    }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                  >
                    <div className="bar-value">{item.value}</div>
                    <div className="bar-label">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </SimpleChart>
          </ChartCard>

          <ChartCard variants={cardVariants}>
            <div className="chart-header">
              <h3 className="chart-title">Monthly Trends</h3>
              <span className="chart-icon">📈</span>
            </div>
            <div style={{ 
              height: '200px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              Monthly trend chart would be implemented here
            </div>
          </ChartCard>
        </ChartsSection>

        <CompanyBreakdown>
          <div className="breakdown-header">
            <h3 className="breakdown-title">Company Breakdown</h3>
            <button className="view-all-button">View All</button>
          </div>
          
          <CompanyList>
            <AnimatePresence>
              {companies.map((company, index) => (
                <CompanyItem
                  key={company.name}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="company-info">
                    <div className="company-logo">
                      {company.logo || '🏢'}
                    </div>
                    <div className="company-details">
                      <h4 className="company-name">{company.name}</h4>
                      <p className="company-stats">
                        {company.total} offers • {Math.round((company.accepted / company.total) * 100)}% acceptance rate
                      </p>
                    </div>
                  </div>
                  
                  <div className="company-metrics">
                    <div className="metric">
                      <span className="metric-number">{company.pending}</span>
                      <span className="metric-label">Pending</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">{company.accepted}</span>
                      <span className="metric-label">Accepted</span>
                    </div>
                    <div className="metric">
                      <span className="metric-number">{company.rejected}</span>
                      <span className="metric-label">Rejected</span>
                    </div>
                  </div>
                </CompanyItem>
              ))}
            </AnimatePresence>
          </CompanyList>
        </CompanyBreakdown>
      </motion.div>
    </SummaryContainer>
  );
};

export default PlacementOffersSummary;
