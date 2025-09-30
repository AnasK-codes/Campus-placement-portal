# Test Credentials for Campus Placement Portal

## Role-Based Authentication Test Accounts

Use these credentials to test the role-based authentication system:

### Admin Dashboard
- **Email**: `admin@test.com`
- **Password**: `password123`
- **Role**: `admin`
- **Dashboard**: `/admin`

### Faculty Dashboard
- **Email**: `faculty@test.com`
- **Password**: `password123`
- **Role**: `faculty`
- **Dashboard**: `/faculty`

### Placement Cell Dashboard
- **Email**: `placement@test.com`
- **Password**: `password123`
- **Role**: `placement`
- **Dashboard**: `/placement`

### Recruiter Dashboard
- **Email**: `recruiter@test.com`
- **Password**: `password123`
- **Role**: `recruiter`
- **Dashboard**: `/recruiter`

### Student Dashboard
- **Email**: `student@test.com`
- **Password**: `password123`
- **Role**: `student`
- **Dashboard**: `/student`

## Testing Instructions

1. **Login Process**: 
   - Go to `/login` or `/auth/login`
   - Use any of the above credentials
   - After successful login, you'll be automatically redirected to the appropriate role-based dashboard

2. **Role-Based Access**:
   - Try accessing different dashboard URLs directly
   - You should only be able to access dashboards that match your role
   - Unauthorized access attempts will show an "Access Restricted" page

3. **Protected Routes**:
   - All dashboard routes are protected and require authentication
   - Users without proper roles will be redirected or shown access denied

## Features Implemented

✅ **Firebase Authentication** - Email/Password login  
✅ **Role-Based Routing** - Automatic redirection based on user role  
✅ **Protected Routes** - Role-based access control  
✅ **User Management** - Firestore integration for user profiles  
✅ **Security Rules** - Comprehensive Firestore security rules  
✅ **Dashboard Components** - Unique dashboards for each role  

## Next Steps

- Test all login scenarios
- Verify role-based access control
- Check dashboard functionality
- Test Firebase security rules
- Add additional features as needed
