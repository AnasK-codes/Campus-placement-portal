# Deployment Guide - Campus Placement Portal

This guide covers deploying the Campus Placement Portal with authentication and RBAC to production.

## Prerequisites

1. **Firebase Project**: Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. **Firebase CLI**: Install with `npm install -g firebase-tools`
3. **Domain**: Optional custom domain for hosting
4. **Email Service**: Configure email templates in Firebase Auth

## Pre-Deployment Checklist

### 1. Firebase Project Setup
- [ ] Create Firebase project
- [ ] Enable Authentication (Email/Password, Google)
- [ ] Create Firestore database
- [ ] Enable Cloud Storage
- [ ] Enable Cloud Functions
- [ ] Configure authorized domains

### 2. Environment Configuration
- [ ] Update `.env` with production Firebase config
- [ ] Set `VITE_USE_FIREBASE_EMULATOR=false`
- [ ] Configure email action URLs
- [ ] Set up custom domain (if applicable)

### 3. Security Configuration
- [ ] Review and deploy Firestore security rules
- [ ] Review and deploy Storage security rules
- [ ] Configure CORS for your domain
- [ ] Set up Firebase App Check (recommended)

## Step-by-Step Deployment

### Step 1: Configure Firebase Project

1. **Initialize Firebase in your project**:
   ```bash
   firebase login
   firebase init
   ```

2. **Select services**:
   - Firestore
   - Functions
   - Hosting
   - Storage

3. **Configure Firestore**:
   - Use existing `firestore.rules`
   - Use existing `firestore.indexes.json`

4. **Configure Functions**:
   - Language: TypeScript
   - Use existing `functions/` directory

5. **Configure Hosting**:
   - Public directory: `dist`
   - Single-page app: Yes
   - Automatic builds: No

### Step 2: Update Environment Variables

Create production `.env` file:
```bash
# Production Firebase Configuration
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Production Settings
VITE_USE_FIREBASE_EMULATOR=false
VITE_APP_ENVIRONMENT=production

# Remove test account credentials in production
```

### Step 3: Configure Authentication

1. **Enable Sign-in Methods**:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google (configure OAuth consent screen)

2. **Configure Email Templates**:
   - Customize email verification template
   - Customize password reset template
   - Set sender name and reply-to address

3. **Set Authorized Domains**:
   - Add your production domain
   - Add localhost for development (if needed)

### Step 4: Deploy Security Rules

Deploy Firestore and Storage rules:
```bash
npm run deploy:rules
```

Verify rules in Firebase Console:
- Test rules with the Rules Playground
- Ensure role-based access works correctly

### Step 5: Deploy Cloud Functions

1. **Build and deploy functions**:
   ```bash
   npm run deploy:functions
   ```

2. **Verify function deployment**:
   - Check Firebase Console → Functions
   - Test `assignUserRole` function
   - Monitor function logs

3. **Set up function environment variables** (if needed):
   ```bash
   firebase functions:config:set someservice.key="THE API KEY"
   ```

### Step 6: Build and Deploy Frontend

1. **Build the React app**:
   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting**:
   ```bash
   npm run deploy:hosting
   ```

3. **Verify deployment**:
   - Visit your Firebase Hosting URL
   - Test authentication flow
   - Verify role-based access

### Step 7: Create Admin Account

1. **Create first admin account**:
   ```bash
   # Use Firebase Console or create via signup
   # Then manually set admin role in Firestore
   ```

2. **Set admin custom claims**:
   ```javascript
   // In Firebase Console → Functions
   // Call assignUserRole with admin credentials
   ```

## Post-Deployment Configuration

### 1. Email Configuration

Configure email action URLs in Firebase Console:
- **Email verification**: `https://yourdomain.com/auth/verify-pending`
- **Password reset**: `https://yourdomain.com/auth/login`

### 2. Domain Configuration

If using custom domain:
1. Add custom domain in Firebase Hosting
2. Update authorized domains in Authentication
3. Update email action URLs

### 3. Monitoring Setup

1. **Enable Firebase Analytics**
2. **Set up Error Reporting**:
   ```javascript
   // Add to your app
   import { getAnalytics } from 'firebase/analytics';
   const analytics = getAnalytics(app);
   ```

3. **Monitor Cloud Functions**:
   - Set up alerts for function errors
   - Monitor function performance
   - Set up logging

### 4. Security Hardening

1. **Enable App Check**:
   ```bash
   # Configure App Check in Firebase Console
   # Add App Check SDK to your app
   ```

2. **Review Security Rules**:
   - Test with production data
   - Monitor rule usage
   - Update as needed

3. **Set up CORS** (if needed):
   ```bash
   # Configure CORS for your domain
   gsutil cors set cors.json gs://your-bucket-name
   ```

## Testing in Production

### 1. Authentication Flow Testing
- [ ] User registration works
- [ ] Email verification works
- [ ] Google OAuth works
- [ ] Password reset works
- [ ] Role approval workflow works

### 2. Security Testing
- [ ] Unauthorized access blocked
- [ ] Role-based access enforced
- [ ] Security rules working
- [ ] Custom claims set correctly

### 3. Performance Testing
- [ ] Page load times acceptable
- [ ] Function response times good
- [ ] Database queries optimized
- [ ] No memory leaks

## Monitoring and Maintenance

### 1. Regular Monitoring
- **Firebase Console**: Check usage, errors, performance
- **Function Logs**: Monitor for errors and performance issues
- **Analytics**: Track user engagement and conversion
- **Security**: Monitor for suspicious activity

### 2. Backup Strategy
- **Firestore**: Set up automated backups
- **User Data**: Export user data regularly
- **Code**: Maintain version control and releases

### 3. Updates and Maintenance
- **Dependencies**: Keep Firebase SDK updated
- **Security Rules**: Review and update regularly
- **Functions**: Monitor and optimize performance
- **UI**: Update based on user feedback

## Troubleshooting

### Common Production Issues

1. **Authentication not working**:
   - Check authorized domains
   - Verify API keys
   - Check email configuration

2. **Functions timing out**:
   - Optimize function code
   - Increase timeout limits
   - Check database indexes

3. **Security rules blocking access**:
   - Test rules with real data
   - Check custom claims
   - Review rule logic

4. **Email delivery issues**:
   - Check spam folders
   - Verify sender reputation
   - Configure SPF/DKIM records

### Debug Commands

```bash
# View function logs
firebase functions:log

# Test security rules
firebase firestore:rules:test

# Check deployment status
firebase deploy --dry-run

# View hosting logs
firebase hosting:channel:list
```

## Rollback Procedure

If issues occur after deployment:

1. **Rollback hosting**:
   ```bash
   firebase hosting:channel:deploy --expires 1h
   ```

2. **Rollback functions**:
   ```bash
   # Deploy previous version
   firebase deploy --only functions
   ```

3. **Rollback security rules**:
   ```bash
   # Deploy previous rules
   firebase deploy --only firestore:rules
   ```

## Performance Optimization

### 1. Frontend Optimization
- Enable gzip compression
- Optimize images and assets
- Use CDN for static assets
- Implement code splitting

### 2. Backend Optimization
- Optimize Firestore queries
- Use composite indexes
- Implement caching strategies
- Monitor function cold starts

### 3. Database Optimization
- Create appropriate indexes
- Optimize security rules
- Use subcollections for large datasets
- Implement pagination

## Security Best Practices

1. **Regular Security Audits**
2. **Monitor for Suspicious Activity**
3. **Keep Dependencies Updated**
4. **Use Environment Variables for Secrets**
5. **Implement Rate Limiting**
6. **Regular Backup and Recovery Testing**

---

## Quick Deployment Commands

```bash
# Complete deployment
npm run deploy

# Deploy specific services
npm run deploy:functions
npm run deploy:hosting
npm run deploy:rules

# Emergency rollback
firebase hosting:channel:deploy --expires 1h
```

For support and troubleshooting, refer to the [Firebase Documentation](https://firebase.google.com/docs) or create an issue in the project repository.
