import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5tbiceoljg9tmMTGb7yU6M9YKncTGODI",
  authDomain: "campus-placement-portal-f2faf.firebaseapp.com",
  projectId: "campus-placement-portal-f2faf",
  storageBucket: "campus-placement-portal-f2faf.firebasestorage.app",
  messagingSenderId: "539813984901",
  appId: "1:539813984901:web:401c3187c4d3132978c7ec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initial user accounts with roles
const initialUsers = [
  {
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    name: 'System Administrator'
  },
  {
    email: 'faculty@test.com',
    password: 'password123',
    role: 'faculty',
    name: 'Faculty Member'
  },
  {
    email: 'placement@test.com',
    password: 'password123',
    role: 'placement',
    name: 'Placement Officer'
  },
  {
    email: 'recruiter@test.com',
    password: 'password123',
    role: 'recruiter',
    name: 'Company Recruiter'
  },
  {
    email: 'student@test.com',
    password: 'password123',
    role: 'student',
    name: 'Student User'
  }
];

async function seedUsers() {
  console.log('🌱 Starting user seeding process...');
  
  for (const userData of initialUsers) {
    try {
      console.log(`Creating user: ${userData.email}`);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        approved: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Successfully created ${userData.role}: ${userData.email}`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating ${userData.email}:`, error.message);
      }
    }
  }
  
  console.log('🎉 User seeding completed!');
  process.exit(0);
}

// Run the seeding function
seedUsers().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
