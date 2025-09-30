import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import aiSkillService from '../services/aiSkillService';
import InternshipCard from './InternshipCard';

const FormContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const FormLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
  }
`;

const FormSection = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .icon {
    font-size: 1.4rem;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, error }) => error ? '#f44336' : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
  }

  ${({ error }) => error && `
    animation: shake 0.5s ease-in-out;
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `}
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, error }) => error ? '#f44336' : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SkillsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SkillsInput = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SkillsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SkillTag = styled(motion.span)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ suggested, theme }) => 
    suggested ? 'rgba(76, 175, 80, 0.1)' : theme.colors.gradient};
  color: ${({ suggested }) => suggested ? '#4CAF50' : 'white'};
  border: 1px solid ${({ suggested }) => suggested ? '#4CAF50' : 'transparent'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;

  .remove-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.7rem;
    color: inherit;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const AISection = styled(motion.div)`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .ai-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-weight: 600;
    color: #667eea;
  }

  .ai-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const SuggestionTag = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: #667eea;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    transform: translateY(-1px);
  }
`;

const AnalyzeButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.xl};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PreviewSection = styled(motion.div)`
  position: sticky;
  top: 20px;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 0.8rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const InternshipForm = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    description: '',
    responsibilities: '',
    stipendMin: '',
    stipendMax: '',
    departments: [],
    years: [],
    skills: [],
    seats: '',
    duration: '',
    conversionPotential: false,
    location: '',
    type: 'full-time'
  });

  const [skillInput, setSkillInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics', 
    'Mechanical', 'Civil', 'Electrical', 'All Departments'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'All Years'];

  useEffect(() => {
    // Auto-analyze when description or responsibilities change
    const timer = setTimeout(() => {
      if (formData.description || formData.responsibilities) {
        handleAIAnalysis();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData.description, formData.responsibilities]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleAIAnalysis = async () => {
    const textToAnalyze = `${formData.description} ${formData.responsibilities}`.trim();
    if (!textToAnalyze) return;

    setAnalyzing(true);
    try {
      const analysis = await aiSkillService.extractSkillsFromText(
        textToAnalyze,
        formData.role,
        formData.company
      );

      setAiSuggestions(analysis.suggestions || []);
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddSuggestion = (suggestion) => {
    if (!formData.skills.includes(suggestion.name)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, suggestion.name]
      }));
    }
    setAiSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.stipendMin) newErrors.stipendMin = 'Minimum stipend is required';
    if (!formData.seats) newErrors.seats = 'Number of seats is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (formData.departments.length === 0) newErrors.departments = 'Select at least one department';
    if (formData.years.length === 0) newErrors.years = 'Select at least one year';
    if (formData.skills.length === 0) newErrors.skills = 'Add at least one skill';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const internshipData = {
        ...formData,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'active',
        applicationsCount: 0,
        viewsCount: 0
      };

      await addDoc(collection(db, 'internships'), internshipData);
      
      // Reset form
      setFormData({
        role: '', company: '', description: '', responsibilities: '',
        stipendMin: '', stipendMax: '', departments: [], years: [],
        skills: [], seats: '', duration: '', conversionPotential: false,
        location: '', type: 'full-time'
      });
      
      alert('Internship posted successfully!');
    } catch (error) {
      console.error('Error posting internship:', error);
      alert('Failed to post internship. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <FormLayout>
        <div>
          <FormSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionTitle>
              <span className="icon">📝</span>
              Post New Internship
            </SectionTitle>

            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="role">Role/Designation *</Label>
                  <Input
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g., Frontend Developer Intern"
                    error={errors.role}
                  />
                  {errors.role && <ErrorMessage>{errors.role}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g., TechCorp Solutions"
                    error={errors.company}
                  />
                  {errors.company && <ErrorMessage>{errors.company}</ErrorMessage>}
                </FormGroup>
              </FormGrid>

              <FormGroup>
                <Label htmlFor="description">Job Description *</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the internship role, what the intern will learn, and the work environment..."
                  error={errors.description}
                />
                {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="responsibilities">Key Responsibilities</Label>
                <TextArea
                  id="responsibilities"
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleInputChange}
                  placeholder="List the main tasks and responsibilities the intern will handle..."
                />
              </FormGroup>

              {(formData.description || formData.responsibilities) && (
                <AISection
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="ai-header">
                    <span>🤖</span>
                    AI Skill Suggestions
                    <AnalyzeButton
                      onClick={handleAIAnalysis}
                      disabled={analyzing}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {analyzing ? '🔄 Analyzing...' : '🔍 Re-analyze'}
                    </AnalyzeButton>
                  </div>
                  
                  {aiSuggestions.length > 0 && (
                    <div className="ai-suggestions">
                      <AnimatePresence>
                        {aiSuggestions.map((suggestion, index) => (
                          <SuggestionTag
                            key={suggestion.name}
                            onClick={() => handleAddSuggestion(suggestion)}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            title={suggestion.reason}
                          >
                            + {suggestion.name}
                          </SuggestionTag>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </AISection>
              )}

              <SkillsSection>
                <Label>Required Skills *</Label>
                <SkillsInput>
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill and press Enter"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  />
                  <AnalyzeButton
                    type="button"
                    onClick={handleAddSkill}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add
                  </AnalyzeButton>
                </SkillsInput>
                
                <SkillsList>
                  <AnimatePresence>
                    {formData.skills.map((skill, index) => (
                      <SkillTag
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {skill}
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          ×
                        </button>
                      </SkillTag>
                    ))}
                  </AnimatePresence>
                </SkillsList>
                {errors.skills && <ErrorMessage>{errors.skills}</ErrorMessage>}
              </SkillsSection>

              <FormGrid>
                <FormGroup>
                  <Label htmlFor="stipendMin">Minimum Stipend (₹) *</Label>
                  <Input
                    id="stipendMin"
                    name="stipendMin"
                    type="number"
                    value={formData.stipendMin}
                    onChange={handleInputChange}
                    placeholder="15000"
                    error={errors.stipendMin}
                  />
                  {errors.stipendMin && <ErrorMessage>{errors.stipendMin}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="stipendMax">Maximum Stipend (₹)</Label>
                  <Input
                    id="stipendMax"
                    name="stipendMax"
                    type="number"
                    value={formData.stipendMax}
                    onChange={handleInputChange}
                    placeholder="25000"
                  />
                </FormGroup>
              </FormGrid>

              <FormGrid>
                <FormGroup>
                  <Label htmlFor="seats">Number of Seats *</Label>
                  <Input
                    id="seats"
                    name="seats"
                    type="number"
                    value={formData.seats}
                    onChange={handleInputChange}
                    placeholder="5"
                    error={errors.seats}
                  />
                  {errors.seats && <ErrorMessage>{errors.seats}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="duration">Duration *</Label>
                  <Select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Duration</option>
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                  </Select>
                  {errors.duration && <ErrorMessage>{errors.duration}</ErrorMessage>}
                </FormGroup>
              </FormGrid>

              <FormGrid>
                <FormGroup>
                  <Label>Eligible Departments *</Label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {departments.map(dept => (
                      <SkillTag
                        key={dept}
                        suggested={formData.departments.includes(dept)}
                        onClick={() => handleMultiSelect('departments', dept)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {dept}
                      </SkillTag>
                    ))}
                  </div>
                  {errors.departments && <ErrorMessage>{errors.departments}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label>Eligible Years *</Label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {years.map(year => (
                      <SkillTag
                        key={year}
                        suggested={formData.years.includes(year)}
                        onClick={() => handleMultiSelect('years', year)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {year}
                      </SkillTag>
                    ))}
                  </div>
                  {errors.years && <ErrorMessage>{errors.years}</ErrorMessage>}
                </FormGroup>
              </FormGrid>

              <FormGrid>
                <FormGroup>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Bangalore, Remote"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <input
                      type="checkbox"
                      name="conversionPotential"
                      checked={formData.conversionPotential}
                      onChange={handleInputChange}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Conversion to Full-time Possible
                  </Label>
                </FormGroup>
              </FormGrid>

              <SubmitButton
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {submitting ? '🔄 Posting...' : '📝 Post Internship'}
              </SubmitButton>
            </form>
          </FormSection>
        </div>

        <PreviewSection
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <SectionTitle>
            <span className="icon">👁️</span>
            Preview
          </SectionTitle>
          <InternshipCard internship={formData} preview={true} />
        </PreviewSection>
      </FormLayout>
    </FormContainer>
  );
};

export default InternshipForm;
