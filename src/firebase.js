import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

// Firebase configuration - use environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "campus-placement-portal.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "campus-placement-portal",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "campus-placement-portal.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Connect to emulators in development
// COMMENTED OUT: Using live Firebase cloud project instead of emulators
// if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectStorageEmulator(storage, 'localhost', 9199);
//     connectFunctionsEmulator(functions, 'localhost', 5001);
//     console.log('🔥 Connected to Firebase Emulators');
//   } catch (error) {
//     console.warn('Firebase Emulator connection failed:', error);
//   }
// }

// Auth helper functions
export const signUpWithEmail = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  return signInWithPopup(auth, googleProvider);
};

export const logOut = async () => {
  return signOut(auth);
};

export const sendVerificationEmail = async (user) => {
  return sendEmailVerification(user, {
    url: `${window.location.origin}/auth/verify-pending`,
    handleCodeInApp: true
  });
};

export const resetPassword = async (email) => {
  return sendPasswordResetEmail(auth, email, {
    url: `${window.location.origin}/auth/login`,
    handleCodeInApp: true
  });
};

// Firestore helper functions
export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const { displayName, email, uid } = user;
    const createdAt = serverTimestamp();
    
    try {
      await setDoc(userRef, {
        uid,
        name: displayName || additionalData.name || '',
        email,
        role: 'pending',
        approved: false,
        createdAt,
        skills: [],
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }
  
  return userRef;
};

export const getUserDocument = async (uid) => {
  if (!uid) return null;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
  } catch (error) {
    console.error('Error getting user document:', error);
    return null;
  }
};

export const updateUserDocument = async (uid, data) => {
  if (!uid) return;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

// Cloud Functions
export const assignUserRole = httpsCallable(functions, 'assignUserRole');

// Role validation
export const VALID_ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  PLACEMENT: 'placement',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
  PENDING_STUDENT: 'pending_student',
  PENDING_RECRUITER: 'pending_recruiter'
};

export const ROLE_PERMISSIONS = {
  [VALID_ROLES.STUDENT]: ['read_own_profile', 'create_application', 'read_internships'],
  [VALID_ROLES.FACULTY]: ['read_own_profile', 'read_students', 'approve_applications'],
  [VALID_ROLES.PLACEMENT]: ['read_all_profiles', 'approve_roles', 'manage_internships', 'read_analytics'],
  [VALID_ROLES.RECRUITER]: ['read_anonymized_profiles', 'create_internships', 'read_applications'],
  [VALID_ROLES.ADMIN]: ['full_access']
};

export const isValidRole = (role) => {
  return Object.values(VALID_ROLES).includes(role);
};

export const hasPermission = (userRole, permission) => {
  if (userRole === VALID_ROLES.ADMIN) return true;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

// Email validation for college domains
export const isCollegeEmail = (email) => {
  const collegeDomains = [
    '.edu',
    '.ac.in',
    '.edu.in',
    'university.edu',
    'college.edu'
  ];
  
  return collegeDomains.some(domain => email.toLowerCase().includes(domain));
};

// Role approval requests
export const createRoleApprovalRequest = async (userId, userEmail, requestedRole, additionalData = {}) => {
  try {
    const requestData = {
      userId,
      userEmail,
      requestedRole,
      status: 'pending',
      createdAt: new Date(),
      ...additionalData
    };
    
    await addDoc(collection(db, 'roleApprovalRequests'), requestData);
    console.log('Role approval request created successfully');
  } catch (error) {
    console.error('Error creating role approval request:', error);
    throw error;
  }
};

export const getRoleApprovalRequests = async () => {
  try {
    const q = query(
      collection(db, 'roleApprovalRequests'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching role approval requests:', error);
    throw error;
  }
};

export const updateRoleApprovalRequest = async (requestId, status, reviewedBy) => {
  try {
    const requestRef = doc(db, 'roleApprovalRequests', requestId);
    await updateDoc(requestRef, {
      status,
      reviewedBy,
      reviewedAt: new Date()
    });
    console.log('Role approval request updated successfully');
  } catch (error) {
    console.error('Error updating role approval request:', error);
    throw error;
  }
};

export default app;
