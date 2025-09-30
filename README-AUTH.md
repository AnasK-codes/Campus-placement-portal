# Authentication & Role-Based Access Control (RBAC)

## Overview

The Campus Placement Portal implements a comprehensive authentication and role-based access control system using Firebase Auth, Firestore, and Cloud Functions. This system ensures secure access to different features based on user roles and approval status.

## Architecture

### Authentication Flow
1. **User Registration** → Email verification → Role approval → Access granted
2. **Role Assignment** → Custom claims set via Cloud Functions
3. **Access Control** → Protected routes check authentication, verification, and roles

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `student` | College students | Create applications, read internships, access mock tests |
| `faculty` | Academic staff | Read student profiles, approve applications |
| `placement` | Placement cell staff | Approve roles, manage internships, view analytics |
| `recruiter` | Company representatives | Create internships, read applications |
| `admin` | System administrators | Full access to all features |

### Approval Workflow

1. **Automatic Approval**: Faculty and placement staff with college emails
2. **Manual Approval**: Students and recruiters require placement team approval
3. **Custom Claims**: Set via Cloud Functions for role enforcement

## Key Features

### 🔐 Secure Authentication
- Email/password and Google OAuth support
- Email verification required
- Password reset functionality
- Session persistence

### 👥 Role-Based Access
- Five distinct user roles with specific permissions
- Custom claims for server-side role enforcement
- Protected routes with role checking
- Dynamic UI based on user permissions

### ✅ Approval System
- Admin panel for role approvals
- Real-time status updates
- Automated notifications
- Audit logging

### 🛡️ Security Features
- Firestore security rules enforce role-based access
- Cloud Functions validate permissions
- Input validation and sanitization
- Protection against privilege escalation

## Implementation Details

### Firebase Configuration
```javascript
// Enhanced firebase.js with auth helpers
export const signUpWithEmail = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const createUserDocument = async (user, additionalData = {}) => {
  // Creates user document with role and approval status
};
```

### AuthContext
```javascript
// Role-based state management
const { currentUser, userRole, hasRole, canAccess } = useAuth();

// Permission checking
const canViewAdminPanel = hasRole(['admin', 'placement']);
const canCreateApplication = canAccess(['student'], ['create_application']);
```

### Protected Routes
```javascript
<ProtectedRoute requiredRoles={['admin', 'placement']}>
  <RoleApprovals />
</ProtectedRoute>
```

### Cloud Functions
```typescript
// Role assignment with validation
export const assignUserRole = functions.https.onCall(async (data, context) => {
  // Verify caller permissions
  // Set custom claims
  // Update Firestore document
  // Log approval
});
```

### Security Rules
```javascript
// Role-based Firestore access
allow read: if isAuthenticated() && (
  isOwner(userId) ||
  hasAnyRole(['admin', 'placement'])
);
```

## File Structure

```
src/
├── contexts/
│   └── AuthContext.jsx          # Authentication state management
├── components/
│   └── ProtectedRoute.jsx       # Route protection wrapper
├── pages/
│   ├── auth/
│   │   ├── Login.jsx           # Login page
│   │   ├── Signup.jsx          # Registration with role selection
│   │   ├── VerifyPending.jsx   # Email verification status
│   │   └── ResetPassword.jsx   # Password reset
│   └── admin/
│       └── RoleApprovals.jsx   # Admin panel for approvals
├── firebase.js                 # Enhanced Firebase configuration
functions/
├── src/
│   └── index.ts                # Cloud Functions for role management
├── package.json
└── tsconfig.json
firestore.rules                 # Security rules
storage.rules                   # File access rules
firebase.json                   # Firebase configuration
```

## Usage Examples

### User Registration
```javascript
// Sign up with role selection
const handleSignup = async (formData) => {
  const { user } = await signUpWithEmail(email, password);
  await createUserDocument(user, {
    name: `${firstName} ${lastName}`,
    role: 'pending',
    requestedRole: selectedRole,
    approved: false
  });
  await sendVerificationEmail(user);
};
```

### Role Checking
```javascript
// In components
const { hasRole, canAccess } = useAuth();

// Simple role check
if (hasRole(['admin', 'placement'])) {
  // Show admin features
}

// Permission-based check
if (canAccess(['student'], ['create_application'])) {
  // Show application form
}
```

### Approval Process
```javascript
// In admin panel
const handleApprove = async (userId, role) => {
  await assignUserRole({ uid: userId, role });
  // User automatically gets custom claims and access
};
```

## Testing

### Development Setup
```bash
# Setup development environment
npm run setup

# Start emulators
npm run dev:emulators

# Seed test accounts
npm run seed
```

### Test Accounts
- **Admin**: admin@university.edu / TestAdmin123!
- **Placement**: placement@university.edu / TestPlacement123!
- **Student**: student.approved@university.edu / TestStudent123!
- **Recruiter**: recruiter.approved@company.com / TestRecruiter123!

### Testing Scenarios
1. **Registration Flow**: Sign up → Verify email → Await approval
2. **Role Approval**: Admin approves pending users
3. **Access Control**: Test protected routes with different roles
4. **Security Rules**: Verify Firestore access restrictions

## Security Considerations

### Best Practices Implemented
- ✅ Email verification required
- ✅ Role-based access control
- ✅ Custom claims for server-side validation
- ✅ Comprehensive security rules
- ✅ Input validation and sanitization
- ✅ Audit logging for approvals
- ✅ Protection against privilege escalation

### Security Rules Highlights
```javascript
// Users can only modify their own profiles
allow update: if isOwner(userId) && 
  // Cannot change role or approval status
  request.resource.data.role == resource.data.role &&
  request.resource.data.approved == resource.data.approved;

// Only placement/admin can approve roles
allow update: if canApproveRoles() && 
  request.resource.data.diff(resource.data).affectedKeys().hasOnly([
    'role', 'approved', 'approvedAt', 'approvedBy'
  ]);
```

## Deployment

### Production Checklist
- [ ] Update Firebase configuration
- [ ] Deploy security rules: `npm run deploy:rules`
- [ ] Deploy Cloud Functions: `npm run deploy:functions`
- [ ] Test with real email delivery
- [ ] Verify custom claims work correctly
- [ ] Monitor function performance
- [ ] Set up error monitoring

### Environment Variables
```bash
# Production .env
VITE_FIREBASE_API_KEY=your_production_key
VITE_FIREBASE_PROJECT_ID=your_production_project
VITE_USE_FIREBASE_EMULATOR=false
```

## Troubleshooting

### Common Issues
1. **Custom claims not working**: Ensure Cloud Functions are deployed
2. **Email verification fails**: Check Auth settings and redirect URLs
3. **Permission denied**: Verify security rules and user roles
4. **Function timeout**: Check function logs and optimize queries

### Debug Tools
- Firebase Emulator UI: http://localhost:4000
- Function logs: `firebase functions:log`
- Security rules simulator in Firebase Console
- Browser dev tools for client-side debugging

## Integration with Existing Systems

This authentication system seamlessly integrates with:
- **AI-Powered Mock Test Generator**: Role-based test access
- **Peer-to-Peer Doubt Solver**: User reputation and permissions
- **Placement Management**: Role-specific dashboards and features

The system maintains the established red/black theme and provides a consistent user experience across all components.

---

For detailed testing instructions, see [TESTING.md](./TESTING.md)
