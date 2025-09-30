import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import SearchBar from '../../components/SearchBar';
import InternshipCard from '../../components/InternshipCard';

const BrowseContainer = styled.div`
  min-height: calc(100vh - 70px);
  padding: ${({ theme }) => theme.spacing.xl} 0;
  background: ${({ theme }) => theme.colors.surface};
`;

const BrowseContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ResultsCount = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const SortSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
`;

const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const JobCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const JobTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CompanyName = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const JobType = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, type }) => {
    switch(type) {
      case 'Full-time': return '#4caf50';
      case 'Part-time': return '#ff9800';
      case 'Internship': return '#2196f3';
      case 'Contract': return '#9c27b0';
      default: return theme.colors.primary;
    }
  }};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const JobDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const JobDetail = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  .icon {
    font-size: 1rem;
  }
`;

const JobDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SkillTag = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8rem;
  font-weight: 500;
`;

const ApplyButton = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
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

  .message {
    font-size: 1.2rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

// Mock job data
const mockJobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechCorp Solutions",
    type: "Internship",
    location: "Bangalore, India",
    salary: "₹15,000 - ₹25,000",
    duration: "3-6 months",
    posted: "2 days ago",
    description: "Join our dynamic team as a Frontend Developer Intern. You'll work on exciting projects using React, JavaScript, and modern web technologies. Perfect opportunity to gain hands-on experience in a fast-paced startup environment.",
    skills: ["React", "JavaScript", "HTML/CSS", "Git", "Responsive Design"],
    category: "Technology",
    experience: "Fresher"
  },
  {
    id: 2,
    title: "Data Science Intern",
    company: "DataViz Analytics",
    type: "Internship",
    location: "Mumbai, India",
    salary: "₹20,000 - ₹30,000",
    duration: "4-6 months",
    posted: "1 day ago",
    description: "Exciting opportunity to work with big data and machine learning algorithms. You'll analyze large datasets, create visualizations, and build predictive models using Python and various ML libraries.",
    skills: ["Python", "Machine Learning", "Pandas", "NumPy", "SQL", "Tableau"],
    category: "Data Science",
    experience: "Fresher"
  },
  {
    id: 3,
    title: "Mobile App Developer",
    company: "AppCraft Studios",
    type: "Full-time",
    location: "Hyderabad, India",
    salary: "₹4,00,000 - ₹6,00,000",
    duration: "Permanent",
    posted: "3 days ago",
    description: "Looking for a passionate Mobile App Developer to join our team. You'll be responsible for developing cross-platform mobile applications using React Native and Flutter.",
    skills: ["React Native", "Flutter", "Dart", "JavaScript", "Mobile UI/UX"],
    category: "Technology",
    experience: "1-2 years"
  },
  {
    id: 4,
    title: "Digital Marketing Intern",
    company: "Growth Marketing Co.",
    type: "Internship",
    location: "Delhi, India",
    salary: "₹12,000 - ₹18,000",
    duration: "3 months",
    posted: "1 week ago",
    description: "Learn digital marketing strategies including SEO, social media marketing, content creation, and analytics. Great opportunity to understand the digital marketing landscape.",
    skills: ["SEO", "Social Media", "Content Writing", "Google Analytics", "PPC"],
    category: "Marketing",
    experience: "Fresher"
  },
  {
    id: 5,
    title: "Backend Developer",
    company: "CloudTech Systems",
    type: "Full-time",
    location: "Pune, India",
    salary: "₹5,00,000 - ₹8,00,000",
    duration: "Permanent",
    posted: "5 days ago",
    description: "Join our backend team to build scalable APIs and microservices. You'll work with Node.js, databases, and cloud technologies to create robust backend systems.",
    skills: ["Node.js", "Express", "MongoDB", "AWS", "Docker", "REST APIs"],
    category: "Technology",
    experience: "2-3 years"
  },
  {
    id: 6,
    title: "UI/UX Design Intern",
    company: "Design Studio Pro",
    type: "Internship",
    location: "Chennai, India",
    salary: "₹10,000 - ₹15,000",
    duration: "2-4 months",
    posted: "4 days ago",
    description: "Creative opportunity to work on user interface and user experience design projects. You'll create wireframes, prototypes, and design systems for web and mobile applications.",
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
    category: "Design",
    experience: "Fresher"
  }
];

const BrowseJobs = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    location: 'all',
    experience: 'all'
  });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    filterAndSortJobs();
  }, [searchTerm, filters, sortBy]);

  const filterAndSortJobs = () => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filters.type === 'all' || job.type === filters.type;
      const matchesCategory = filters.category === 'all' || job.category === filters.category;
      const matchesLocation = filters.location === 'all' || job.location.includes(filters.location);
      const matchesExperience = filters.experience === 'all' || job.experience === filters.experience;

      return matchesSearch && matchesType && matchesCategory && matchesLocation && matchesExperience;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.posted) - new Date(a.posted);
        case 'salary':
          return parseInt(b.salary.replace(/[^\d]/g, '')) - parseInt(a.salary.replace(/[^\d]/g, ''));
        case 'company':
          return a.company.localeCompare(b.company);
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const handleApply = (jobId) => {
    alert(`Applied to job ${jobId}! You will be redirected to the application form.`);
    // Here you would typically redirect to an application form or handle the application logic
  };

  return (
    <BrowseContainer>
      <BrowseContent>
        <Header>
          <Title>
            💼 Browse Jobs & Internships
          </Title>
          <Subtitle>
            Discover amazing opportunities that match your skills and interests.
            Start your career journey today!
          </Subtitle>
        </Header>

        <div style={{ marginBottom: '2rem' }}>
          <SearchBar
            placeholder="Search jobs, companies, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <FiltersContainer>
          <FilterGroup>
            <FilterLabel>Job Type</FilterLabel>
            <FilterSelect
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Category</FilterLabel>
            <FilterSelect
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Data Science">Data Science</option>
              <option value="Marketing">Marketing</option>
              <option value="Design">Design</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Location</FilterLabel>
            <FilterSelect
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="all">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Experience</FilterLabel>
            <FilterSelect
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="Fresher">Fresher</option>
              <option value="1-2 years">1-2 years</option>
              <option value="2-3 years">2-3 years</option>
            </FilterSelect>
          </FilterGroup>
        </FiltersContainer>

        <ResultsHeader>
          <ResultsCount>
            Showing {filteredJobs.length} of {jobs.length} jobs
          </ResultsCount>
          <SortSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="salary">Highest Salary</option>
            <option value="company">Company A-Z</option>
          </SortSelect>
        </ResultsHeader>

        {filteredJobs.length === 0 ? (
          <EmptyState>
            <div className="icon">🔍</div>
            <div className="message">No jobs found matching your criteria</div>
            <p>Try adjusting your filters or search terms</p>
          </EmptyState>
        ) : (
          <JobsGrid>
            <AnimatePresence>
              {filteredJobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <JobHeader>
                    <div>
                      <JobTitle>{job.title}</JobTitle>
                      <CompanyName>{job.company}</CompanyName>
                    </div>
                    <JobType type={job.type}>{job.type}</JobType>
                  </JobHeader>

                  <JobDetails>
                    <JobDetail>
                      <span className="icon">📍</span>
                      {job.location}
                    </JobDetail>
                    <JobDetail>
                      <span className="icon">💰</span>
                      {job.salary}
                    </JobDetail>
                    <JobDetail>
                      <span className="icon">⏰</span>
                      {job.duration}
                    </JobDetail>
                    <JobDetail>
                      <span className="icon">📅</span>
                      {job.posted}
                    </JobDetail>
                  </JobDetails>

                  <JobDescription>{job.description}</JobDescription>

                  <SkillsContainer>
                    {job.skills.map((skill, skillIndex) => (
                      <SkillTag key={skillIndex}>{skill}</SkillTag>
                    ))}
                  </SkillsContainer>

                  <ApplyButton
                    onClick={() => handleApply(job.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Apply Now 🚀
                  </ApplyButton>
                </JobCard>
              ))}
            </AnimatePresence>
          </JobsGrid>
        )}
      </BrowseContent>
    </BrowseContainer>
  );
};

export default BrowseJobs;
