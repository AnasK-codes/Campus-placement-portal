# 🧪 **Testing Guide - Mentor Feedback & Certificate Generation**

## 🎯 **Comprehensive Testing Strategy**

This guide provides detailed testing procedures for the Mentor Feedback & Certificate Generation workflow using Firebase Emulator Suite and manual testing scenarios.

---

## 🚀 **Setup & Prerequisites**

### **1. Firebase Emulator Configuration**
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize emulators (if not already done)
firebase init emulators

# Start emulator suite
firebase emulators:start --only firestore,functions,storage,auth
```

### **2. Test Data Setup**
```javascript
// Create test accounts with different roles
const testAccounts = [
  {
    uid: 'student-test-001',
    email: 'student@university.edu',
    role: 'student',
    approved: true,
    name: 'John Doe',
    department: 'Computer Science',
    year: '3rd Year'
  },
  {
    uid: 'mentor-test-001', 
    email: 'mentor@company.com',
    role: 'mentor',
    approved: true,
    name: 'Jane Smith',
    designation: 'Senior Developer'
  },
  {
    uid: 'placement-test-001',
    email: 'placement@university.edu', 
    role: 'placement',
    approved: true,
    name: 'Admin User'
  }
];
```

---

## 🧪 **Test Scenarios**

### **Scenario 1: Complete Feedback Submission Workflow**

#### **Test Case 1.1: Mentor Accesses Feedback Form**
```javascript
// Test Steps:
1. Login as mentor (mentor-test-001)
2. Navigate to /mentor/dashboard
3. Verify pending feedback list shows completed internships
4. Click "Provide Feedback" for a completed application
5. Verify feedback form loads with student and internship data

// Expected Results:
✅ Mentor can only see applications assigned to them
✅ Form loads with correct student/internship information
✅ All rating categories are displayed with interactive stars
✅ Comments field has character counter and validation
✅ Checklist items are properly displayed
```

#### **Test Case 1.2: Feedback Form Validation**
```javascript
// Test Steps:
1. Try to submit form without ratings
2. Try to submit with comments < 20 characters
3. Verify validation messages appear
4. Fill all required fields correctly
5. Submit form

// Expected Results:
✅ Form prevents submission without all ratings
✅ Character count validation works correctly
✅ Error messages are user-friendly and clear
✅ Form submits successfully when all validations pass
```

#### **Test Case 1.3: AI Sentiment Analysis**
```javascript
// Test Steps:
1. Enter positive feedback: "Exceptional performance, exceeded expectations"
2. Verify sentiment badge shows "positive" with green color
3. Enter negative feedback: "Poor performance, needs improvement"  
4. Verify sentiment badge shows "negative" with red color
5. Check auto-generated summary appears

// Expected Results:
✅ Sentiment analysis works in real-time
✅ Visual indicators match sentiment correctly
✅ AI-generated summary is relevant and concise
✅ Mentor can edit the auto-generated summary
```

### **Scenario 2: Certificate Generation Process**

#### **Test Case 2.1: Automatic Certificate Generation**
```javascript
// Test Steps:
1. Complete feedback submission as mentor
2. Verify loading overlay appears during certificate generation
3. Check Firebase Storage for generated PDF
4. Verify certificate metadata in Firestore
5. Check student receives notification

// Expected Results:
✅ Certificate PDF is generated and stored in Firebase Storage
✅ Certificate metadata is correctly saved in Firestore
✅ Verification ID is unique and properly formatted
✅ Student notification is created with download link
✅ Certificate appears in student dashboard immediately
```

#### **Test Case 2.2: PDF Content Validation**
```javascript
// Test Steps:
1. Download generated certificate PDF
2. Verify all student information is correct
3. Check company and internship details
4. Verify mentor name and signature area
5. Confirm QR code is embedded and functional

// Expected Results:
✅ PDF contains all required information accurately
✅ Professional layout with red/white theme
✅ QR code links to correct verification URL
✅ Certificate type matches performance rating
✅ Unique verification ID is displayed
```

#### **Test Case 2.3: Performance-Based Certificate Types**
```javascript
// Test Performance Scenarios:
Scenario A: All ratings 4.5-5.0 → Excellence Certificate
Scenario B: Average ratings 3.5-4.4 → Completion Certificate  
Scenario C: Average ratings 2.0-3.4 → Participation Certificate

// Test Steps:
1. Submit feedback with different rating combinations
2. Verify correct certificate type is generated
3. Check certificate title and content match type
4. Verify performance metrics are calculated correctly

// Expected Results:
✅ Certificate type correctly determined by ratings
✅ Certificate content reflects performance level
✅ Performance metrics are accurately calculated
✅ Visual styling matches certificate category
```

### **Scenario 3: Certificate Verification System**

#### **Test Case 3.1: Public Certificate Verification**
```javascript
// Test Steps:
1. Get verification ID from generated certificate
2. Navigate to /verify?vid=<verificationId> (without login)
3. Verify certificate information displays correctly
4. Test with invalid verification ID
5. Test with expired/revoked certificate

// Expected Results:
✅ Valid certificates display complete information
✅ Invalid IDs show appropriate error messages
✅ Verification page is publicly accessible
✅ Certificate status is accurately reflected
✅ Performance metrics are properly displayed
```

#### **Test Case 3.2: QR Code Verification**
```javascript
// Test Steps:
1. Scan QR code from generated certificate PDF
2. Verify it redirects to correct verification URL
3. Check verification page loads correctly
4. Verify all certificate details match original

// Expected Results:
✅ QR code scans correctly and redirects properly
✅ Verification URL contains correct verification ID
✅ Certificate details match original application data
✅ Mobile verification experience is optimized
```

### **Scenario 4: Student Certificate Dashboard**

#### **Test Case 4.1: Certificate Display and Management**
```javascript
// Test Steps:
1. Login as student (student-test-001)
2. Navigate to /student/certificates
3. Verify certificates are displayed in grid/list view
4. Test filtering by certificate type
5. Test download and share functionality

// Expected Results:
✅ All student certificates are displayed correctly
✅ Filtering works for different certificate types
✅ Download generates secure PDF access
✅ Share functionality works with native API
✅ Certificate statistics are accurate
```

#### **Test Case 4.2: Real-time Certificate Updates**
```javascript
// Test Steps:
1. Have student dashboard open in one tab
2. Generate new certificate as mentor in another tab
3. Verify certificate appears immediately in student dashboard
4. Check celebration animation triggers
5. Verify notification is received

// Expected Results:
✅ New certificates appear without page refresh
✅ Celebration animation plays for new certificates
✅ Statistics update in real-time
✅ Notifications are delivered instantly
✅ Certificate grid updates smoothly
```

### **Scenario 5: Security & Access Control**

#### **Test Case 5.1: Role-Based Access Control**
```javascript
// Test Steps:
1. Try accessing mentor feedback form as student
2. Try accessing other mentor's feedback forms
3. Try direct URL access to restricted pages
4. Verify proper error messages and redirects

// Expected Results:
✅ Students cannot access mentor-only pages
✅ Mentors can only access their assigned students
✅ Proper error messages for unauthorized access
✅ Automatic redirects to appropriate dashboards
```

#### **Test Case 5.2: Data Security Validation**
```javascript
// Test Steps:
1. Try to modify certificate data directly in Firestore
2. Attempt to access other users' certificates
3. Try to modify feedback after finalization
4. Test audit trail logging

// Expected Results:
✅ Certificate data cannot be modified by users
✅ Users can only access their own data
✅ Finalized feedback cannot be edited
✅ All actions are properly logged in audit trail
```

### **Scenario 6: Error Handling & Edge Cases**

#### **Test Case 6.1: Network Failure Scenarios**
```javascript
// Test Steps:
1. Disconnect network during feedback submission
2. Reconnect and verify form state is preserved
3. Test certificate generation with network issues
4. Verify proper error messages and retry mechanisms

// Expected Results:
✅ Form data is preserved during network issues
✅ Proper error messages for network failures
✅ Retry mechanisms work correctly
✅ User can recover from network errors gracefully
```

#### **Test Case 6.2: Invalid Data Handling**
```javascript
// Test Steps:
1. Submit feedback with invalid rating values
2. Try to generate certificate for incomplete application
3. Test with missing required fields
4. Verify proper validation and error handling

// Expected Results:
✅ Invalid data is rejected with clear messages
✅ Certificate generation fails gracefully for invalid data
✅ Required field validation works correctly
✅ Error messages are user-friendly and actionable
```

---

## 🔧 **Automated Testing Setup**

### **1. Jest Test Configuration**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/components/FeedbackFormDetailed.jsx',
    'src/pages/mentor/FinalizeFeedback.jsx',
    'src/pages/student/Certificates.jsx',
    'src/pages/CertificateVerification.jsx'
  ]
};
```

### **2. Component Testing Examples**
```javascript
// FeedbackFormDetailed.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeedbackFormDetailed from '../components/FeedbackFormDetailed';

describe('FeedbackFormDetailed', () => {
  test('renders all rating categories', () => {
    render(<FeedbackFormDetailed studentData={mockStudent} internshipData={mockInternship} />);
    
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Teamwork & Collaboration')).toBeInTheDocument();
  });

  test('validates minimum comment length', async () => {
    render(<FeedbackFormDetailed studentData={mockStudent} internshipData={mockInternship} />);
    
    const commentField = screen.getByPlaceholderText(/provide detailed feedback/i);
    fireEvent.change(commentField, { target: { value: 'Short' } });
    
    const submitButton = screen.getByText('Finalize & Generate Certificate');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument();
    });
  });

  test('triggers AI sentiment analysis', async () => {
    render(<FeedbackFormDetailed studentData={mockStudent} internshipData={mockInternship} />);
    
    const commentField = screen.getByPlaceholderText(/provide detailed feedback/i);
    fireEvent.change(commentField, { 
      target: { value: 'Exceptional performance throughout the internship period' } 
    });
    
    await waitFor(() => {
      expect(screen.getByText('positive')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
```

### **3. Cloud Functions Testing**
```javascript
// functions/test/generateCertificate.test.js
const test = require('firebase-functions-test')();
const admin = require('firebase-admin');

describe('generateCertificate', () => {
  let generateCertificate;

  before(() => {
    generateCertificate = require('../generateCertificate').generateCertificate;
  });

  it('should generate certificate for valid application', async () => {
    const data = { applicationId: 'test-app-001' };
    const context = { 
      auth: { uid: 'mentor-test-001' },
      rawRequest: { ip: '127.0.0.1' }
    };

    const result = await generateCertificate(data, context);
    
    expect(result.success).toBe(true);
    expect(result.certificateId).toBeDefined();
    expect(result.verificationId).toBeDefined();
    expect(result.downloadUrl).toBeDefined();
  });

  it('should reject unauthorized users', async () => {
    const data = { applicationId: 'test-app-001' };
    const context = { auth: null };

    try {
      await generateCertificate(data, context);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.code).toBe('unauthenticated');
    }
  });
});
```

---

## 📊 **Performance Testing**

### **1. Load Testing Scenarios**
```javascript
// Test concurrent certificate generation
const loadTest = async () => {
  const promises = [];
  
  for (let i = 0; i < 10; i++) {
    promises.push(generateCertificate({
      applicationId: `test-app-${i.toString().padStart(3, '0')}`
    }));
  }
  
  const results = await Promise.all(promises);
  console.log(`Generated ${results.length} certificates concurrently`);
};
```

### **2. Memory Usage Monitoring**
```javascript
// Monitor Cloud Function memory usage
const monitorMemory = () => {
  const used = process.memoryUsage();
  console.log('Memory Usage:', {
    rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`
  });
};
```

---

## ✅ **Testing Checklist**

### **Functional Testing**
- [ ] Mentor can access feedback form for assigned students only
- [ ] All rating categories work with star interactions
- [ ] Comment validation enforces minimum character requirements
- [ ] AI sentiment analysis provides real-time feedback
- [ ] Certificate generation creates valid PDF with QR code
- [ ] Certificate verification works with public access
- [ ] Student dashboard displays certificates correctly
- [ ] Download and share functionality works properly
- [ ] Real-time updates work across all dashboards

### **Security Testing**
- [ ] Role-based access control prevents unauthorized access
- [ ] Mentors cannot access other mentors' students
- [ ] Students cannot modify certificate data
- [ ] Certificate verification is publicly accessible
- [ ] Audit trail logs all certificate generation actions
- [ ] Firestore security rules prevent data tampering
- [ ] Authentication is required for all protected operations

### **Performance Testing**
- [ ] Certificate generation completes within 30 seconds
- [ ] PDF files are optimized for size and quality
- [ ] Real-time updates don't cause performance issues
- [ ] Multiple concurrent certificate generations work
- [ ] Memory usage stays within Cloud Function limits
- [ ] Database queries are optimized with proper indexing

### **User Experience Testing**
- [ ] Loading states provide clear feedback to users
- [ ] Error messages are user-friendly and actionable
- [ ] Mobile experience works perfectly on all devices
- [ ] Animations enhance UX without causing delays
- [ ] Form validation provides immediate feedback
- [ ] Certificate celebration animations work correctly

### **Integration Testing**
- [ ] Firebase Auth integration works correctly
- [ ] Firestore real-time listeners function properly
- [ ] Cloud Functions integrate with frontend seamlessly
- [ ] Firebase Storage handles PDF uploads correctly
- [ ] Notification system delivers messages reliably
- [ ] Email integration (if implemented) works properly

---

## 🚀 **Deployment Testing**

### **1. Staging Environment Testing**
```bash
# Deploy to staging environment
firebase use staging
firebase deploy --only functions,firestore:rules,storage:rules

# Run full test suite against staging
npm run test:staging
```

### **2. Production Readiness Checklist**
- [ ] All tests pass in staging environment
- [ ] Performance benchmarks meet requirements
- [ ] Security rules are properly configured
- [ ] Error handling covers all edge cases
- [ ] Monitoring and logging are set up
- [ ] Backup and recovery procedures are tested
- [ ] Documentation is complete and accurate

### **3. Post-Deployment Validation**
```bash
# Verify production deployment
firebase use production
firebase functions:log --limit 50

# Test critical paths in production
curl -X POST https://your-region-your-project.cloudfunctions.net/generateCertificate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"applicationId": "test-application"}'
```

---

## 📋 **Test Data Management**

### **Sample Test Data**
```javascript
// Create comprehensive test dataset
const testData = {
  students: [
    {
      uid: 'student-001',
      name: 'John Doe',
      email: 'john.doe@university.edu',
      department: 'Computer Science',
      year: '3rd Year',
      skills: ['JavaScript', 'React', 'Node.js']
    }
  ],
  mentors: [
    {
      uid: 'mentor-001', 
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      designation: 'Senior Developer',
      company: 'TechCorp Inc.'
    }
  ],
  applications: [
    {
      id: 'app-001',
      studentId: 'student-001',
      mentorId: 'mentor-001',
      internshipId: 'internship-001',
      status: 'completed',
      completedAt: new Date('2024-01-15')
    }
  ]
};
```

This comprehensive testing guide ensures the Mentor Feedback & Certificate Generation system is thoroughly validated before production deployment, covering all functional, security, performance, and user experience aspects.
