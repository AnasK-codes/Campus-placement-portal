/**
 * Seed script to create test accounts for development
 * Run with: node scripts/seedAccounts.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration (use your actual config)
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "campus-placement-portal.firebaseapp.com",
  projectId: "campus-placement-portal",
  storageBucket: "campus-placement-portal.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Test accounts data
const testAccounts = [
  {
    email: 'admin@university.edu',
    password: 'TestAdmin123!',
    name: 'System Administrator',
    role: 'admin',
    approved: true,
    department: 'IT',
    phone: '+1-555-0001'
  },
  {
    email: 'placement@university.edu',
    password: 'TestPlacement123!',
    name: 'Placement Officer',
    role: 'placement',
    approved: true,
    department: 'Placement Cell',
    phone: '+1-555-0002'
  },
  {
    email: 'faculty@university.edu',
    password: 'TestFaculty123!',
    name: 'Dr. John Faculty',
    role: 'faculty',
    approved: true,
    department: 'Computer Science',
    phone: '+1-555-0003'
  },
  {
    email: 'student.approved@university.edu',
    password: 'TestStudent123!',
    name: 'Alice Student',
    role: 'student',
    approved: true,
    department: 'Computer Science',
    year: '3',
    rollNumber: 'CS2021001',
    phone: '+1-555-0004',
    skills: ['JavaScript', 'React', 'Node.js', 'Python']
  },
  {
    email: 'student.pending@university.edu',
    password: 'TestStudent123!',
    name: 'Bob Pending',
    role: 'pending',
    approved: false,
    requestedRole: 'student',
    department: 'Computer Science',
    year: '2',
    rollNumber: 'CS2022001',
    phone: '+1-555-0005',
    skills: ['Java', 'Python', 'SQL']
  },
  {
    email: 'recruiter.approved@company.com',
    password: 'TestRecruiter123!',
    name: 'Jane Recruiter',
    role: 'recruiter',
    approved: true,
    company: 'Tech Corp',
    phone: '+1-555-0006'
  },
  {
    email: 'recruiter.pending@company.com',
    password: 'TestRecruiter123!',
    name: 'Mike Pending',
    role: 'pending',
    approved: false,
    requestedRole: 'recruiter',
    company: 'StartupXYZ',
    phone: '+1-555-0007'
  }
];

async function createAccount(accountData) {
  try {
    console.log(`Creating account for ${accountData.email}...`);
    
    // Create user account
    const { user } = await createUserWithEmailAndPassword(
      auth, 
      accountData.email, 
      accountData.password
    );
    
    console.log(`✅ Created auth account for ${accountData.email}`);
    
    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: accountData.email,
      name: accountData.name,
      role: accountData.role,
      approved: accountData.approved,
      createdAt: serverTimestamp(),
      emailVerified: true, // Auto-verify for test accounts
      ...accountData
    };
    
    // Remove password from document
    delete userDoc.password;
    
    await setDoc(doc(db, 'users', user.uid), userDoc);
    console.log(`✅ Created Firestore document for ${accountData.email}`);
    
    // If account should be approved, set custom claims
    if (accountData.approved && accountData.role !== 'pending') {
      try {
        const assignUserRole = httpsCallable(functions, 'assignUserRole');
        await assignUserRole({ 
          uid: user.uid, 
          role: accountData.role 
        });
        console.log(`✅ Set custom claims for ${accountData.email} (${accountData.role})`);
      } catch (error) {
        console.log(`⚠️  Could not set custom claims for ${accountData.email}: ${error.message}`);
        console.log('   This is normal if Cloud Functions are not deployed yet.');
      }
    }
    
    return { success: true, uid: user.uid };
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  Account ${accountData.email} already exists, skipping...`);
      return { success: false, reason: 'already-exists' };
    } else {
      console.error(`❌ Failed to create ${accountData.email}:`, error.message);
      return { success: false, reason: error.message };
    }
  }
}

async function seedAccounts() {
  console.log('🌱 Starting account seeding process...\n');
  
  const results = {
    created: 0,
    skipped: 0,
    failed: 0
  };
  
  for (const accountData of testAccounts) {
    const result = await createAccount(accountData);
    
    if (result.success) {
      results.created++;
    } else if (result.reason === 'already-exists') {
      results.skipped++;
    } else {
      results.failed++;
    }
    
    // Small delay between account creations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Seeding Results:');
  console.log(`   ✅ Created: ${results.created}`);
  console.log(`   ⚠️  Skipped: ${results.skipped}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  
  if (results.created > 0) {
    console.log('\n🎉 Test accounts created successfully!');
    console.log('\n📋 Test Account Credentials:');
    console.log('   Admin: admin@university.edu / TestAdmin123!');
    console.log('   Placement: placement@university.edu / TestPlacement123!');
    console.log('   Faculty: faculty@university.edu / TestFaculty123!');
    console.log('   Student (Approved): student.approved@university.edu / TestStudent123!');
    console.log('   Student (Pending): student.pending@university.edu / TestStudent123!');
    console.log('   Recruiter (Approved): recruiter.approved@company.com / TestRecruiter123!');
    console.log('   Recruiter (Pending): recruiter.pending@company.com / TestRecruiter123!');
    
    console.log('\n⚠️  Important Notes:');
    console.log('   - These are test accounts for development only');
    console.log('   - Do not use these credentials in production');
    console.log('   - Email verification is auto-enabled for test accounts');
    console.log('   - Custom claims may need manual setup if Cloud Functions are not deployed');
  }
  
  process.exit(0);
}

// Run the seeding process
seedAccounts().catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
