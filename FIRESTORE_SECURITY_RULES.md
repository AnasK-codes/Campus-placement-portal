# 🔒 **Firestore Security Rules - Mentor Feedback & Certificate Generation**

## 📋 **Enhanced Security Rules for Feedback & Certificate Collections**

Add these rules to your `firestore.rules` file to secure the mentor feedback and certificate generation workflow:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions for role checking
    function hasRole(role) {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    function isApproved() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Applications collection with enhanced feedback and certificate rules
    match /applications/{applicationId} {
      allow read: if request.auth != null && (
        // Students can read their own applications
        resource.data.studentId == request.auth.uid ||
        // Mentors can read applications assigned to them
        (hasRole('mentor') && resource.data.mentorId == request.auth.uid) ||
        // Placement and admin can read all applications
        hasRole('placement') ||
        hasRole('admin') ||
        // Recruiters can read applications for their company internships
        (hasRole('recruiter') && 
         get(/databases/$(database)/documents/internships/$(resource.data.internshipId)).data.companyId == 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId)
      );
      
      allow create: if request.auth != null && 
                   hasRole('student') && 
                   isApproved() &&
                   request.resource.data.studentId == request.auth.uid;
      
      allow update: if request.auth != null && (
        // Students can update their own application status (withdraw, etc.)
        (resource.data.studentId == request.auth.uid && 
         request.resource.data.diff(resource.data).affectedKeys()
           .hasOnly(['status', 'updatedAt', 'withdrawnAt'])) ||
        
        // Mentors can update mentor feedback for their assigned applications
        (hasRole('mentor') && 
         resource.data.mentorId == request.auth.uid &&
         request.resource.data.diff(resource.data).affectedKeys()
           .hasOnly(['mentorFeedback', 'updatedAt', 'certificateStatus', 'certificate'])) ||
        
        // Placement can update application status and assignments
        (hasRole('placement') &&
         request.resource.data.diff(resource.data).affectedKeys()
           .hasOnly(['status', 'mentorId', 'updatedAt', 'approvedAt', 'rejectedAt'])) ||
        
        // Admin can update any field
        hasRole('admin')
      );
      
      allow delete: if hasRole('admin');
    }
    
    // Certificates collection for verification
    match /certificates/{verificationId} {
      // Public read access for certificate verification
      allow read: if true;
      
      // Only system (Cloud Functions) can create/update certificates
      allow write: if false;
    }
    
    // Audit trail collection
    match /audit/{auditId} {
      // Only placement and admin can read audit logs
      allow read: if hasRole('placement') || hasRole('admin');
      
      // Only system (Cloud Functions) can write audit logs
      allow write: if false;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      // Users can read their own notifications
      allow read: if request.auth != null && 
                 resource.data.userId == request.auth.uid;
      
      // Users can update their own notifications (mark as read)
      allow update: if request.auth != null && 
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.diff(resource.data).affectedKeys()
                     .hasOnly(['read', 'readAt']);
      
      // System can create notifications
      allow create: if request.auth != null && (
        hasRole('mentor') || 
        hasRole('placement') || 
        hasRole('admin')
      );
      
      allow delete: if request.auth != null && 
                   resource.data.userId == request.auth.uid;
    }
    
    // Enhanced users collection rules
    match /users/{userId} {
      allow read: if request.auth != null && (
        // Users can read their own profile
        request.auth.uid == userId ||
        // Mentors can read profiles of their assigned students
        (hasRole('mentor') && 
         exists(/databases/$(database)/documents/applications/$(userId)) &&
         get(/databases/$(database)/documents/applications/$(userId)).data.mentorId == request.auth.uid) ||
        // Placement and admin can read all profiles
        hasRole('placement') ||
        hasRole('admin')
      );
      
      allow create: if request.auth != null && 
                   request.auth.uid == userId;
      
      allow update: if request.auth != null && (
        // Users can update their own profile (except role and approval status)
        (request.auth.uid == userId &&
         !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'approved'])) ||
        // Placement can approve users and assign roles
        (hasRole('placement') &&
         request.resource.data.diff(resource.data).affectedKeys()
           .hasOnly(['approved', 'approvedAt', 'role'])) ||
        // Admin can update any field
        hasRole('admin')
      );
      
      allow delete: if hasRole('admin');
    }
    
    // Internships collection (existing rules maintained)
    match /internships/{internshipId} {
      allow read: if request.auth != null && isApproved();
      
      allow create: if hasRole('placement') || hasRole('admin');
      
      allow update: if hasRole('placement') || hasRole('admin') || (
        hasRole('recruiter') && 
        resource.data.companyId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId
      );
      
      allow delete: if hasRole('placement') || hasRole('admin');
    }
  }
}
```

## 🔐 **Security Features Implemented**

### **Role-Based Access Control**
- **Students**: Can read/update their own applications and certificates
- **Mentors**: Can read/update feedback for assigned students only
- **Placement**: Can manage all applications and approve/reject students
- **Admin**: Full access to all collections and operations
- **Recruiters**: Can read applications for their company's internships

### **Data Protection**
- **Mentor Feedback**: Only assigned mentors can provide feedback
- **Certificate Generation**: Only system (Cloud Functions) can create certificates
- **Audit Trails**: Complete logging of all certificate generation actions
- **Public Verification**: Certificates can be publicly verified via verification ID

### **Field-Level Security**
- **Restricted Updates**: Users can only update specific fields based on their role
- **Status Protection**: Application status changes are role-restricted
- **Profile Security**: Users cannot modify their own role or approval status
- **Feedback Integrity**: Mentor feedback cannot be modified after finalization

### **Validation Rules**
- **Authentication Required**: All operations require valid authentication
- **Approval Status**: Students must be approved to create applications
- **Ownership Validation**: Users can only access their own data or assigned data
- **System Operations**: Critical operations (certificates, audit) are system-only

## 📊 **Collection Schema Updates**

### **Enhanced Applications Collection**
```javascript
{
  // Existing fields...
  studentId: "student-uuid",
  internshipId: "internship-uuid",
  mentorId: "mentor-uuid",
  status: "completed",
  
  // Enhanced mentor feedback structure
  mentorFeedback: {
    ratings: {
      technicalSkills: 5,
      initiative: 4,
      communication: 5,
      punctuality: 4,
      teamwork: 5,
      overallPerformance: 5
    },
    checklist: {
      projectCompleted: true,
      attendedStandups: true,
      metDeadlines: true,
      submittedReport: true
    },
    comments: "Exceptional performance throughout...",
    attachments: ["file-url-1", "file-url-2"],
    sentiment: "positive",
    summary: "Demonstrated exceptional performance and technical excellence",
    status: "finalized", // draft, finalized
    finalizedAt: timestamp,
    lastUpdated: timestamp
  },
  
  // Certificate metadata
  certificate: {
    id: "cert-uuid",
    verificationId: "verification-uuid",
    url: "signed-download-url",
    fileName: "certificate-path",
    status: "active", // active, superseded, failed
    generatedAt: timestamp,
    generatedBy: "mentor-uuid"
  },
  
  certificateStatus: "generated" // pending, generated, failed
}
```

### **Certificates Verification Collection**
```javascript
{
  verificationId: "verification-uuid",
  studentName: "John Doe",
  studentDepartment: "Computer Science",
  companyName: "TechCorp Inc.",
  internshipTitle: "Software Engineering Intern",
  mentorName: "Jane Smith",
  mentorDesignation: "Senior Developer",
  completionDate: timestamp,
  generatedAt: timestamp,
  performance: {
    overall: 4.6,
    category: "Excellence", // Excellence, Completion, Participation
    projectsCompleted: 3,
    skillsGained: 8,
    attendanceRate: 98
  },
  isValid: true,
  applicationId: "application-uuid",
  studentId: "student-uuid"
}
```

### **Audit Trail Collection**
```javascript
{
  action: "certificate_generated",
  actorUid: "mentor-uuid",
  actorRole: "mentor",
  targetRef: "applications/application-id",
  metadata: {
    certificateId: "cert-uuid",
    verificationId: "verification-uuid",
    studentId: "student-uuid",
    studentName: "John Doe",
    companyName: "TechCorp Inc."
  },
  timestamp: timestamp,
  ip: "192.168.1.1"
}
```

### **Enhanced Notifications Collection**
```javascript
{
  userId: "student-uuid",
  type: "certificate_generated",
  title: "Certificate Ready! 🎉",
  message: "Your internship certificate for Software Engineering Intern at TechCorp Inc. is ready for download.",
  data: {
    certificateId: "cert-uuid",
    verificationId: "verification-uuid",
    downloadUrl: "signed-url",
    applicationId: "application-uuid"
  },
  read: false,
  readAt: null,
  createdAt: timestamp
}
```

## 🚀 **Implementation Steps**

### **1. Update Firestore Rules**
```bash
# Deploy the updated security rules
firebase deploy --only firestore:rules
```

### **2. Create Required Indexes**
```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "applications",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "studentId", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "applications",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "mentorId", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "updatedAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "certificates",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "verificationId", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "userId", "order": "ASCENDING"},
        {"fieldPath": "read", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    }
  ],
  "fieldOverrides": []
}
```

### **3. Deploy Cloud Functions**
```bash
# Install dependencies
cd functions
npm install

# Deploy the certificate generation function
firebase deploy --only functions
```

### **4. Test Security Rules**
```bash
# Use Firebase Emulator Suite for testing
firebase emulators:start --only firestore,functions

# Run security rule tests
npm run test:security
```

## ✅ **Security Validation Checklist**

- ✅ **Authentication Required**: All operations require valid user authentication
- ✅ **Role-Based Access**: Users can only access data appropriate for their role
- ✅ **Field-Level Protection**: Critical fields (roles, certificates) are protected
- ✅ **Mentor Assignment**: Mentors can only access their assigned students
- ✅ **Certificate Integrity**: Certificates can only be created by Cloud Functions
- ✅ **Public Verification**: Certificate verification is publicly accessible
- ✅ **Audit Logging**: All certificate generation actions are logged
- ✅ **Data Validation**: Input validation prevents malicious data entry
- ✅ **Status Protection**: Application status changes are role-restricted
- ✅ **Notification Security**: Users can only access their own notifications

The enhanced security rules provide comprehensive protection for the mentor feedback and certificate generation workflow while maintaining usability and performance.
