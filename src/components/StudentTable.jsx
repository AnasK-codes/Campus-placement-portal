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
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 100px;
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
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 100px;
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

    .email {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
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
      case 'placed': return 'rgba(76, 175, 80, 0.1)';
      case 'active': return 'rgba(33, 150, 243, 0.1)';
      case 'inactive': return 'rgba(158, 158, 158, 0.1)';
      case 'at-risk': return 'rgba(244, 67, 54, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'placed': return '#4CAF50';
      case 'active': return '#2196F3';
      case 'inactive': return '#9E9E9E';
      case 'at-risk': return '#f44336';
      default: return '#9E9E9E';
    }
  }};
  border: 1px solid ${({ status }) => {
    switch (status) {
      case 'placed': return '#4CAF50';
      case 'active': return '#2196F3';
      case 'inactive': return '#9E9E9E';
      case 'at-risk': return '#f44336';
      default: return '#9E9E9E';
    }
  }};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${({ percentage }) => {
    if (percentage >= 80) return 'linear-gradient(90deg, #4CAF50, #66BB6A)';
    if (percentage >= 60) return 'linear-gradient(90deg, #FF9800, #FFB74D)';
    return 'linear-gradient(90deg, #f44336, #ef5350)';
  }};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
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

const StudentTable = ({ students = [], applications = [], onStudentClick, animationDelay = 0 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate student statistics
  const studentsWithStats = useMemo(() => {
    return students.map(student => {
      const studentApplications = applications.filter(app => app.studentId === student.id);
      const offers = studentApplications.filter(app => 
        app.status === 'offered' || app.status === 'accepted'
      );

      // Calculate profile completion
      let completionScore = 0;
      const totalFields = 10;
      
      if (student.name) completionScore++;
      if (student.email) completionScore++;
      if (student.department) completionScore++;
      if (student.year) completionScore++;
      if (student.phone) completionScore++;
      if (student.skills && student.skills.length > 0) completionScore++;
      if (student.resume) completionScore++;
      if (student.projects && student.projects.length > 0) completionScore++;
      if (student.experience) completionScore++;
      if (student.bio) completionScore++;

      const profileCompletion = Math.round((completionScore / totalFields) * 100);

      // Determine status
      let status = 'inactive';
      if (offers.length > 0) {
        status = 'placed';
      } else if (studentApplications.length > 0) {
        status = 'active';
      } else if (profileCompletion < 50) {
        status = 'at-risk';
      }

      return {
        ...student,
        applicationsCount: studentApplications.length,
        offersCount: offers.length,
        profileCompletion,
        status
      };
    });
  }, [students, applications]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return studentsWithStats.filter(student => {
      const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter;
      const matchesYear = yearFilter === 'all' || student.year === yearFilter;
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesYear && matchesStatus;
    });
  }, [studentsWithStats, searchTerm, departmentFilter, yearFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const departments = [...new Set(students.map(s => s.department).filter(Boolean))];
  const years = [...new Set(students.map(s => s.year).filter(Boolean))];

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'placed': return 'Placed';
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'at-risk': return 'At Risk';
      default: return 'Unknown';
    }
  };

  return (
    <TableContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
    >
      <TableHeader>
        <div className="title">
          <span className="icon">👥</span>
          Students
          <span className="count">{filteredStudents.length}</span>
        </div>

        <TableControls>
          <SearchInput
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <FilterSelect
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="placed">Placed</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="at-risk">At Risk</option>
          </FilterSelect>
        </TableControls>
      </TableHeader>

      {filteredStudents.length === 0 ? (
        <EmptyState>
          <div className="icon">👥</div>
          <h3>No Students Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </EmptyState>
      ) : (
        <>
          <Table>
            <TableHead>
              <div>Student</div>
              <div>Department</div>
              <div>Year</div>
              <div>Profile</div>
              <div>Applications</div>
              <div>Offers</div>
              <div>Action</div>
            </TableHead>

            <TableBody>
              <AnimatePresence>
                {paginatedStudents.map((student, index) => (
                  <TableRow
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => onStudentClick && onStudentClick(student)}
                  >
                    <StudentInfo>
                      <div className="avatar">
                        {getInitials(student.name)}
                      </div>
                      <div className="details">
                        <div className="name">{student.name || 'Unknown'}</div>
                        <div className="email">{student.email}</div>
                      </div>
                    </StudentInfo>

                    <div>{student.department || 'N/A'}</div>
                    <div>{student.year || 'N/A'}</div>

                    <div>
                      <ProgressBar>
                        <ProgressFill
                          percentage={student.profileCompletion}
                          initial={{ width: 0 }}
                          animate={{ width: `${student.profileCompletion}%` }}
                          transition={{ duration: 1, delay: animationDelay + (index * 0.1) }}
                        >
                          {student.profileCompletion}%
                        </ProgressFill>
                      </ProgressBar>
                    </div>

                    <div style={{ textAlign: 'center', fontWeight: '600' }}>
                      {student.applicationsCount}
                    </div>

                    <div>
                      <StatusBadge status={student.offersCount > 0 ? 'placed' : 'active'}>
                        {student.offersCount}
                      </StatusBadge>
                    </div>

                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onStudentClick && onStudentClick(student);
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

export default StudentTable;
