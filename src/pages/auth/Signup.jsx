import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  signUpWithEmail, 
  signInWithGoogle, 
  createUserDocument, 
  sendVerificationEmail,
  isCollegeEmail,
  VALID_ROLES,
  createRoleApprovalRequest
} from '../../firebase';

const SignupContainer = styled.div`
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
`;

const SignupCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  width: 100%;
  max-width: 600px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: 1.1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  text-align: left;
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
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &.error {
    border-color: #f44336;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
  }
`;

const RoleSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const RoleOption = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.lg};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  text-align: center;
  transition: all ${({ theme }) => theme.transitions.fast};
  background: ${({ theme }) => theme.colors.background};

  &.selected {
    border-color: ${({ theme }) => theme.colors.primary};
    background: rgba(211, 47, 47, 0.05);
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }

  .icon {
    font-size: 2rem;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .title {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .description {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ErrorMessage = styled(motion.div)`
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid rgba(244, 67, 54, 0.2);
  font-size: 0.9rem;
  text-align: left;
`;

const SuccessMessage = styled(motion.div)`
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid rgba(76, 175, 80, 0.2);
  font-size: 0.9rem;
  text-align: left;
`;

const EmailHint = styled.div`
  background: rgba(255, 193, 7, 0.1);
  color: #ff8f00;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
  text-align: left;
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(211, 47, 47, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const GoogleButton = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: white;
  color: ${({ theme }) => theme.colors.text};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spacing.xl} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
  
  span {
    padding: 0 ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const LoginLink = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    selectedRole: '',
    department: '',
    year: '',
    rollNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const roleOptions = [
    {
      value: 'student',
      icon: '🎓',
      title: 'Student',
      description: 'Looking for internships and placements'
    },
    {
      value: 'faculty',
      icon: '👨‍🏫',
      title: 'Faculty',
      description: 'Academic staff member'
    },
    {
      value: 'recruiter',
      icon: '🏢',
      title: 'Recruiter',
      description: 'Company representative'
    },
    {
      value: 'placement',
      icon: '📋',
      title: 'Placement Cell',
      description: 'Placement office staff'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, selectedRole: role }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.selectedRole) return 'Please select your role';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    
    // Role-specific validations
    if (formData.selectedRole === 'student') {
      if (!formData.department) return 'Department is required for students';
      if (!formData.year) return 'Year is required for students';
      if (!formData.rollNumber) return 'Roll number is required for students';
    }
    
    if (formData.selectedRole === 'faculty' || formData.selectedRole === 'placement') {
      if (!isCollegeEmail(formData.email)) {
        return 'Faculty and placement staff must use college email addresses';
      }
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      // Create user account
      const { user } = await signUpWithEmail(formData.email, formData.password);
      
      // Determine role and approval status
      let role = 'pending';
      let approved = false;
      let requestedRole = formData.selectedRole;
      
      // Auto-approve faculty and placement if they have college email
      if ((formData.selectedRole === 'faculty' || formData.selectedRole === 'placement') 
          && isCollegeEmail(formData.email)) {
        role = formData.selectedRole;
        approved = true;
        requestedRole = null;
      }
      
      // Create user document in Firestore
      await createUserDocument(user, {
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
        rollNumber: formData.rollNumber,
        role,
        requestedRole,
        approved
      });

      // Create role approval request if not auto-approved
      if (!approved && requestedRole) {
        await createRoleApprovalRequest(user.uid, user.email, requestedRole, {
          name: `${formData.firstName} ${formData.lastName}`,
          department: formData.department,
          year: formData.year,
          rollNumber: formData.rollNumber,
          phone: formData.phone
        });
      }

      // Send verification email
      await sendVerificationEmail(user);
      
      setSuccess('Account created successfully! Please check your email to verify your account.');
      
      // Redirect to verification pending page
      setTimeout(() => {
        navigate('/auth/verify-pending');
      }, 2000);
      
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { user } = await signInWithGoogle();
      
      // Create user document with pending status
      await createUserDocument(user, {
        role: 'pending',
        approved: false,
        requestedRole: null // Will need to select role after Google signup
      });
      
      // Redirect to role selection or verification
      navigate('/auth/verify-pending');
      
    } catch (error) {
      console.error('Google signup error:', error);
      setError(error.message || 'Failed to sign up with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignupContainer>
      <SignupCard
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Title>
          Create a <span>Campus Account</span>
        </Title>
        <Subtitle>
          One profile for internships & placements
        </Subtitle>

        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </ErrorMessage>
        )}

        {success && (
          <SuccessMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {success}
          </SuccessMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <InputRow>
            <InputGroup>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </InputRow>

          <InputGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="john.doe@university.edu"
              value={formData.email}
              onChange={handleChange}
              className={formData.email && !isCollegeEmail(formData.email) ? 'error' : ''}
              required
            />
            {formData.email && !isCollegeEmail(formData.email) && (
              <EmailHint>
                💡 We recommend using your college email address for faster approval
              </EmailHint>
            )}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
            />
          </InputGroup>

          <InputGroup>
            <Label>Select Your Role</Label>
            <RoleSelector>
              {roleOptions.map((option) => (
                <RoleOption
                  key={option.value}
                  className={formData.selectedRole === option.value ? 'selected' : ''}
                  onClick={() => handleRoleSelect(option.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="icon">{option.icon}</div>
                  <div className="title">{option.title}</div>
                  <div className="description">{option.description}</div>
                </RoleOption>
              ))}
            </RoleSelector>
          </InputGroup>

          {formData.selectedRole === 'student' && (
            <>
              <InputRow>
                <InputGroup>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Other">Other</option>
                  </Select>
                </InputGroup>
                <InputGroup>
                  <Label htmlFor="year">Year</Label>
                  <Select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </Select>
                </InputGroup>
              </InputRow>
              <InputGroup>
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  type="text"
                  id="rollNumber"
                  name="rollNumber"
                  placeholder="CS2021001"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </>
          )}

          <InputRow>
            <InputGroup>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </InputRow>

          <Button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Form>

        <Divider>
          <span>or</span>
        </Divider>

        <GoogleButton
          onClick={handleGoogleSignup}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>🔍</span>
          Continue with Google
        </GoogleButton>

        <Divider>
          <span></span>
        </Divider>

        <LoginLink>
          Already have an account? <Link to="/auth/login">Sign in here</Link>
        </LoginLink>
      </SignupCard>
    </SignupContainer>
  );
};

export default Signup;
