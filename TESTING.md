# Testing Guide - Campus Placement Portal

This guide covers testing the authentication and role-based access control system using Firebase Emulators.

## Prerequisites

1. **Firebase CLI installed**: `npm install -g firebase-tools`
2. **Firebase project setup**: Run `firebase login` and `firebase init`
3. **Dependencies installed**: Run `npm install` and `cd functions && npm install`

## Quick Start

1. **Setup development environment**:
   ```bash
   npm run setup
   ```

2. **Start Firebase Emulators**:
   ```bash
   npm run dev:emulators
   ```

3. **Start React development server** (in another terminal):
   ```bash
   npm run dev
   ```

4. **Seed test accounts** (optional):
   ```bash
   npm run seed
   ```

## Test Accounts

The following test accounts are available for development:

| Role | Email | Password | Status |
|------|-------|----------|--------|
| Admin | admin@university.edu | TestAdmin123! | Approved |
| Placement | placement@university.edu | TestPlacement123! | Approved |
| Faculty | faculty@university.edu | TestFaculty123! | Approved |
| Student | student.approved@university.edu | TestStudent123! | Approved |
| Student | student.pending@university.edu | TestStudent123! | Pending |
| Recruiter | recruiter.approved@company.com | TestRecruiter123! | Approved |
| Recruiter | recruiter.pending@company.com | TestRecruiter123! | Pending |

## Testing Scenarios

### 1. User Registration Flow

**Test Case**: New user signup
1. Navigate to `/auth/signup`
2. Fill out the registration form
3. Select a role (Student/Faculty/Recruiter/Placement)
4. Submit the form
5. **Expected**: User receives verification email
6. **Expected**: User is redirected to verification pending page

**Test Case**: Email verification
1. Check Firebase Auth Emulator UI at `http://localhost:4000`
2. Find the verification email
3. Click the verification link
4. **Expected**: User's email is marked as verified
5. **Expected**: User sees appropriate status based on role

### 2. Role Approval Workflow

**Test Case**: Student role approval
1. Sign up as a student with college email
2. Verify email address
3. **Expected**: User sees "Pending Approval" status
4. Login as placement officer (`placement@university.edu`)
5. Navigate to `/admin/role-approvals`
6. **Expected**: See the pending student request
7. Click "Approve" on the student request
8. **Expected**: Student role is approved and custom claims are set

**Test Case**: Auto-approval for faculty
1. Sign up as faculty with college email (e.g., `@university.edu`)
2. Verify email address
3. **Expected**: Faculty role is auto-approved
4. **Expected**: User can immediately access dashboard

### 3. Protected Routes

**Test Case**: Unauthenticated access
1. Navigate to `/dashboard` without logging in
2. **Expected**: Redirected to login page

**Test Case**: Unverified email access
1. Sign up but don't verify email
2. Try to access `/dashboard`
3. **Expected**: Redirected to verification pending page

**Test Case**: Pending approval access
1. Sign up as student and verify email
2. Try to access `/dashboard` before approval
3. **Expected**: See "Pending Approval" message

**Test Case**: Role-based access
1. Login as student
2. Try to access `/admin/role-approvals`
3. **Expected**: Access denied message
4. Login as placement officer
5. Access `/admin/role-approvals`
6. **Expected**: Can view and manage role requests

### 4. Firestore Security Rules

**Test Case**: User document access
1. Login as student
2. Try to read own user document
3. **Expected**: Success
4. Try to read another user's document
5. **Expected**: Permission denied

**Test Case**: Role modification prevention
1. Login as student
2. Try to update own role in Firestore directly
3. **Expected**: Permission denied
4. Try to update approved status
5. **Expected**: Permission denied

**Test Case**: Admin operations
1. Login as admin
2. Try to read any user document
3. **Expected**: Success
4. Try to update any user document
5. **Expected**: Success

### 5. Cloud Functions

**Test Case**: Role assignment function
1. Login as placement officer
2. Call `assignUserRole` function with valid parameters
3. **Expected**: Function succeeds and sets custom claims
4. Login as student
5. Try to call `assignUserRole` function
6. **Expected**: Permission denied error

**Test Case**: Invalid role assignment
1. Login as placement officer
2. Try to assign invalid role (e.g., "invalid_role")
3. **Expected**: Function returns error
4. Try to assign role to non-existent user
5. **Expected**: Function returns error

## Manual Testing Checklist

### Authentication Flow
- [ ] User can sign up with email/password
- [ ] User can sign up with Google OAuth
- [ ] User receives verification email
- [ ] Email verification works correctly
- [ ] User can reset password
- [ ] User can sign in after verification
- [ ] User can sign out

### Role Management
- [ ] Role selection works during signup
- [ ] College email validation works
- [ ] Pending approval status is shown correctly
- [ ] Placement officers can approve roles
- [ ] Custom claims are set correctly
- [ ] Role badges display correctly in UI

### Access Control
- [ ] Protected routes block unauthenticated users
- [ ] Email verification is enforced
- [ ] Role-based access works correctly
- [ ] Admin panel is accessible to authorized users only
- [ ] User menu shows appropriate options

### UI/UX
- [ ] Theme toggle works in light/dark mode
- [ ] Responsive design works on mobile
- [ ] Loading states are shown appropriately
- [ ] Error messages are user-friendly
- [ ] Success messages are clear
- [ ] Animations work smoothly

## Emulator URLs

- **Firebase Emulator UI**: http://localhost:4000
- **Authentication Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080
- **Functions Emulator**: http://localhost:5001
- **Storage Emulator**: http://localhost:9199

## Troubleshooting

### Common Issues

1. **"Firebase project not found"**
   - Run `firebase use --add` to select your project
   - Make sure `.firebaserc` file exists

2. **"Custom claims not working"**
   - Ensure Cloud Functions are deployed or running in emulator
   - Check Functions emulator logs for errors
   - Verify user has proper permissions to call functions

3. **"Firestore permission denied"**
   - Check that security rules are deployed
   - Verify user has correct custom claims
   - Check emulator logs for rule evaluation details

4. **"Email verification not working"**
   - Check Auth emulator UI for verification emails
   - Ensure `handleCodeInApp` is set correctly
   - Verify redirect URLs are whitelisted

### Debug Tips

1. **Check Emulator Logs**:
   ```bash
   # View all emulator logs
   firebase emulators:start --debug
   ```

2. **Inspect Custom Claims**:
   ```javascript
   // In browser console
   const user = firebase.auth().currentUser;
   user.getIdTokenResult().then(result => console.log(result.claims));
   ```

3. **Test Firestore Rules**:
   ```bash
   # Run rules tests
   npm run test:rules
   ```

4. **Monitor Function Calls**:
   - Check Functions emulator logs in terminal
   - Use Firebase Emulator UI to inspect function calls

## Production Testing

Before deploying to production:

1. **Deploy to staging environment**
2. **Test with real Firebase project**
3. **Verify email delivery works**
4. **Test with actual domain URLs**
5. **Check security rules in production**
6. **Monitor function performance**
7. **Test with real user accounts**

## Security Considerations

1. **Never commit real credentials**
2. **Use environment variables for sensitive data**
3. **Test security rules thoroughly**
4. **Validate all user inputs**
5. **Monitor for suspicious activity**
6. **Keep Firebase SDK updated**
7. **Review custom claims regularly**

---

For more detailed testing scenarios or to report issues, please refer to the project documentation or create an issue in the repository.
