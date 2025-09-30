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
  grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr 1fr 100px;
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
  grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr 1fr 100px;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  align-items: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .details {
    .name {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }

    .department {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

const InternshipInfo = styled.div`
  .role {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .company {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const StatusBadge = styled.div`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  background: ${({ status }) => {
    switch (status) {
      case 'pending': return 'rgba(255, 152, 0, 0.1)';
      case 'approved': return 'rgba(33, 150, 243, 0.1)';
      case 'interview_scheduled': return 'rgba(156, 39, 176, 0.1)';
      case 'offered': return 'rgba(76, 175, 80, 0.1)';
      case 'accepted': return 'rgba(76, 175, 80, 0.2)';
      case 'rejected': return 'rgba(244, 67, 54, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'approved': return '#2196F3';
      case 'interview_scheduled': return '#9C27B0';
      case 'offered': return '#4CAF50';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#f44336';
      default: return '#9E9E9E';
    }
  }};
  border: 1px solid ${({ status }) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'approved': return '#2196F3';
      case 'interview_scheduled': return '#9C27B0';
      case 'offered': return '#4CAF50';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#f44336';
      default: return '#9E9E9E';
    }
  }};
`;

const PriorityIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ priority }) => {
    switch (priority) {
      case 'high': return 'rgba(244, 67, 54, 0.1)';
      case 'medium': return 'rgba(255, 152, 0, 0.1)';
      case 'low': return 'rgba(76, 175, 80, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  color: ${({ priority }) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  }};
  border: 1px solid ${({ priority }) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  }};
`;

const TimelineIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  .date {
    font-size: 0.8rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }

  .time-ago {
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.textSecondary};
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

const ApplicationsTable = ({ 
  applications = [], 
  students = [], 
  internships = [], 
  onApplicationClick, 
  animationDelay = 0 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Enhance applications with student and internship data
  const enhancedApplications = useMemo(() => {
    return applications.map(application => {
      const student = students.find(s => s.id === application.studentId) || {};
      const internship = internships.find(i => i.id === application.internshipId) || {};

      // Calculate priority based on application age and status
      let priority = 'low';
      const daysSinceApplication = application.createdAt ? 
        Math.floor((Date.now() - (application.createdAt.toDate ? application.createdAt.toDate() : new Date(application.createdAt)).getTime()) / (1000 * 60 * 60 * 24)) : 0;

      if (application.status === 'pending' && daysSinceApplication > 7) {
        priority = 'high';
      } else if (application.status === 'interview_scheduled' || daysSinceApplication > 3) {
        priority = 'medium';
      }

      return {
        ...application,
        studentName: student.name || 'Unknown Student',
        studentDepartment: student.department || 'N/A',
        studentYear: student.year || 'N/A',
        internshipRole: internship.role || 'Unknown Role',
        internshipCompany: internship.company || 'Unknown Company',
        priority,
        daysSinceApplication
      };
    });
  }, [applications, students, internships]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return enhancedApplications.filter(application => {
      const matchesSearch = application.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           application.internshipRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           application.internshipCompany?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || application.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [enhancedApplications, searchTerm, statusFilter, priorityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'interview_scheduled': return 'Interview';
      case 'offered': return 'Offered';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <TableContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
    >
      <TableHeader>
        <div className="title">
          <span className="icon">📋</span>
          Applications
          <span className="count">{filteredApplications.length}</span>
        </div>

        <TableControls>
          <SearchInput
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="interview_scheduled">Interview</option>
            <option value="offered">Offered</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </FilterSelect>

          <FilterSelect
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </FilterSelect>
        </TableControls>
      </TableHeader>

      {filteredApplications.length === 0 ? (
        <EmptyState>
          <div className="icon">📋</div>
          <h3>No Applications Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </EmptyState>
      ) : (
        <>
          <Table>
            <TableHead>
              <div>Student</div>
              <div>Internship</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Applied</div>
              <div>Updated</div>
              <div>Action</div>
            </TableHead>

            <TableBody>
              <AnimatePresence>
                {paginatedApplications.map((application, index) => (
                  <TableRow
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => onApplicationClick && onApplicationClick(application)}
                  >
                    <StudentInfo>
                      <div className="avatar">
                        {getInitials(application.studentName)}
                      </div>
                      <div className="details">
                        <div className="name">{application.studentName}</div>
                        <div className="department">
                          {application.studentDepartment} • {application.studentYear}
                        </div>
                      </div>
                    </StudentInfo>

                    <InternshipInfo>
                      <div className="role">{application.internshipRole}</div>
                      <div className="company">{application.internshipCompany}</div>
                    </InternshipInfo>

                    <StatusBadge status={application.status}>
                      {getStatusText(application.status)}
                    </StatusBadge>

                    <PriorityIndicator priority={application.priority}>
                      {getPriorityIcon(application.priority)}
                    </PriorityIndicator>

                    <TimelineIndicator>
                      <div className="date">{formatDate(application.createdAt)}</div>
                      <div className="time-ago">{getTimeAgo(application.createdAt)}</div>
                    </TimelineIndicator>

                    <TimelineIndicator>
                      <div className="date">{formatDate(application.updatedAt)}</div>
                      <div className="time-ago">{getTimeAgo(application.updatedAt)}</div>
                    </TimelineIndicator>

                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplicationClick && onApplicationClick(application);
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

export default ApplicationsTable;
