import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const TableContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  .title {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};

    .icon {
      font-size: 1.8rem;
    }

    .count {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
      padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
      border-radius: ${({ theme }) => theme.borderRadius.md};
      font-size: 0.8rem;
      margin-left: ${({ theme }) => theme.spacing.sm};
    }
  }
`;

const TableControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  min-width: 200px;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Table = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 1fr 1fr 1fr 1fr 100px;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: 600;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TableRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 1fr 1fr 1fr 1fr 100px;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme, alert }) => alert ? '#FF9800' : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  align-items: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  ${({ alert }) => alert && `
    &::before {
      content: '⚠️';
      position: absolute;
      top: -8px;
      right: -8px;
      background: #FF9800;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `}

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const InternshipInfo = styled.div`
  .role {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    font-size: 1rem;
  }

  .company {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .location {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const SkillTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  max-height: 60px;
  overflow: hidden;
`;

const SkillTag = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.7rem;
  font-weight: 500;
`;

const StatusBadge = styled.div`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  background: ${({ status }) => {
    switch (status) {
      case 'active': return 'rgba(76, 175, 80, 0.1)';
      case 'closed': return 'rgba(158, 158, 158, 0.1)';
      case 'draft': return 'rgba(255, 152, 0, 0.1)';
      case 'expired': return 'rgba(244, 67, 54, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'closed': return '#9E9E9E';
      case 'draft': return '#FF9800';
      case 'expired': return '#f44336';
      default: return '#9E9E9E';
    }
  }};
  border: 1px solid ${({ status }) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'closed': return '#9E9E9E';
      case 'draft': return '#FF9800';
      case 'expired': return '#f44336';
      default: return '#9E9E9E';
    }
  }};
`;

const SeatIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  .seats-text {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ theme, alert }) => alert ? '#FF9800' : theme.colors.text};
  }

  .seats-bar {
    width: 60px;
    height: 8px;
    background: ${({ theme }) => theme.colors.surface};
    border-radius: 4px;
    overflow: hidden;
  }

  .seats-fill {
    height: 100%;
    background: ${({ fillPercentage }) => {
      if (fillPercentage >= 90) return 'linear-gradient(90deg, #f44336, #ef5350)';
      if (fillPercentage >= 70) return 'linear-gradient(90deg, #FF9800, #FFB74D)';
      return 'linear-gradient(90deg, #4CAF50, #66BB6A)';
    }};
    transition: width 0.5s ease;
  }
`;

const ConversionRate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  .rate {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ rate }) => {
      if (rate >= 30) return '#4CAF50';
      if (rate >= 15) return '#FF9800';
      return '#f44336';
    }};
  }

  .label {
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-transform: uppercase;
  }
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textSecondary};

  .icon {
    font-size: 4rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const PageButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InternshipTable = ({ internships = [], applications = [], onInternshipClick, animationDelay = 0 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate internship statistics
  const internshipsWithStats = useMemo(() => {
    return internships.map(internship => {
      const internshipApplications = applications.filter(app => app.internshipId === internship.id);
      const offers = internshipApplications.filter(app => 
        app.status === 'offered' || app.status === 'accepted'
      );

      const conversionRate = internshipApplications.length > 0 ? 
        ((offers.length / internshipApplications.length) * 100) : 0;

      const seatsFilled = offers.length;
      const totalSeats = internship.seats || 0;
      const seatsRemaining = Math.max(0, totalSeats - seatsFilled);
      const fillPercentage = totalSeats > 0 ? (seatsFilled / totalSeats) * 100 : 0;

      // Determine if this internship needs attention
      const isLowSeats = seatsRemaining <= 2 && seatsRemaining > 0;
      const isLowApplications = internshipApplications.length < (totalSeats * 0.5);

      return {
        ...internship,
        applicationsCount: internshipApplications.length,
        offersCount: offers.length,
        conversionRate: Math.round(conversionRate),
        seatsFilled,
        seatsRemaining,
        fillPercentage,
        needsAttention: isLowSeats || isLowApplications
      };
    });
  }, [internships, applications]);

  // Filter internships
  const filteredInternships = useMemo(() => {
    return internshipsWithStats.filter(internship => {
      const matchesSearch = internship.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.company?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || internship.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || internship.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [internshipsWithStats, searchTerm, statusFilter, departmentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInternships = filteredInternships.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const departments = [...new Set(internships.map(i => i.department).filter(Boolean))];

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'closed': return 'Closed';
      case 'draft': return 'Draft';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TableContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
    >
      <TableHeader>
        <div className="title">
          <span className="icon">💼</span>
          Internships
          <span className="count">{filteredInternships.length}</span>
        </div>

        <TableControls>
          <SearchInput
            type="text"
            placeholder="Search internships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
          </FilterSelect>

          <FilterSelect
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </FilterSelect>
        </TableControls>
      </TableHeader>

      {filteredInternships.length === 0 ? (
        <EmptyState>
          <div className="icon">💼</div>
          <h3>No Internships Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </EmptyState>
      ) : (
        <>
          <Table>
            <TableHead>
              <div>Internship</div>
              <div>Company</div>
              <div>Skills Required</div>
              <div>Applications</div>
              <div>Offers</div>
              <div>Seats</div>
              <div>Conversion</div>
              <div>Action</div>
            </TableHead>

            <TableBody>
              <AnimatePresence>
                {paginatedInternships.map((internship, index) => (
                  <TableRow
                    key={internship.id}
                    alert={internship.needsAttention}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => onInternshipClick && onInternshipClick(internship)}
                  >
                    <InternshipInfo>
                      <div className="role">{internship.role || 'Unknown Role'}</div>
                      <StatusBadge status={internship.status}>
                        {getStatusText(internship.status)}
                      </StatusBadge>
                    </InternshipInfo>

                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                        {internship.company || 'Unknown Company'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        📍 {internship.location || 'Remote'}
                      </div>
                    </div>

                    <SkillTags>
                      {(internship.skills || []).slice(0, 4).map((skill, idx) => (
                        <SkillTag key={idx}>{skill}</SkillTag>
                      ))}
                      {(internship.skills || []).length > 4 && (
                        <SkillTag>+{(internship.skills || []).length - 4}</SkillTag>
                      )}
                    </SkillTags>

                    <div style={{ textAlign: 'center', fontWeight: '600', fontSize: '1.1rem' }}>
                      {internship.applicationsCount}
                    </div>

                    <div style={{ textAlign: 'center', fontWeight: '600', fontSize: '1.1rem', color: '#4CAF50' }}>
                      {internship.offersCount}
                    </div>

                    <SeatIndicator 
                      fillPercentage={internship.fillPercentage}
                      alert={internship.seatsRemaining <= 2 && internship.seatsRemaining > 0}
                    >
                      <div className="seats-text">
                        {internship.seatsFilled}/{internship.seats || 0}
                      </div>
                      <div className="seats-bar">
                        <motion.div
                          className="seats-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${internship.fillPercentage}%` }}
                          transition={{ duration: 1, delay: animationDelay + (index * 0.1) }}
                        />
                      </div>
                    </SeatIndicator>

                    <ConversionRate rate={internship.conversionRate}>
                      <div className="rate">{internship.conversionRate}%</div>
                      <div className="label">Success</div>
                    </ConversionRate>

                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onInternshipClick && onInternshipClick(internship);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View
                    </ActionButton>
                  </TableRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </PageButton>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PageButton
                  key={page}
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {page}
                </PageButton>
              ))}

              <PageButton
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </TableContainer>
  );
};

export default InternshipTable;
