import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Valid roles that can be assigned
const VALID_ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  PLACEMENT: 'placement',
  RECRUITER: 'recruiter',
  ADMIN: 'admin'
} as const;

// Roles that can approve other roles
const APPROVER_ROLES = [VALID_ROLES.PLACEMENT, VALID_ROLES.ADMIN];

// Interface for the assignUserRole function parameters
interface AssignUserRoleData {
  uid: string;
  role: string;
}

/**
 * Cloud Function to assign user roles and custom claims
 * Only placement staff and admins can call this function
 */
export const assignUserRole = functions.https.onCall(
  async (data: AssignUserRoleData, context) => {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to call this function.'
      );
    }

    const callerId = context.auth.uid;
    const { uid, role } = data;

    // Validate input parameters
    if (!uid || typeof uid !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'User ID is required and must be a string.'
      );
    }

    if (!role || typeof role !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Role is required and must be a string.'
      );
    }

    // Validate role is in allowed list
    if (!Object.values(VALID_ROLES).includes(role as any)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid role. Must be one of: ${Object.values(VALID_ROLES).join(', ')}`
      );
    }

    try {
      // Get caller's custom claims to verify permissions
      const callerRecord = await admin.auth().getUser(callerId);
      const callerClaims = callerRecord.customClaims || {};
      const callerRole = callerClaims.role;

      // Check if caller has permission to assign roles
      if (!APPROVER_ROLES.includes(callerRole)) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Only placement staff and admins can assign user roles.'
        );
      }

      // Get the target user's current data
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(uid)
        .get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User document not found.'
        );
      }

      const userData = userDoc.data();
      
      // Verify the user has requested this role (security check)
      if (userData?.requestedRole !== role) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'User has not requested this role or role mismatch.'
        );
      }

      // Set custom claims for the user
      await admin.auth().setCustomUserClaims(uid, {
        role: role,
        approved: true,
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        approvedBy: callerId
      });

      // Update user document in Firestore
      await admin.firestore()
        .collection('users')
        .doc(uid)
        .update({
          role: role,
          approved: true,
          requestedRole: admin.firestore.FieldValue.delete(),
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedBy: callerId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      // Create approval log entry
      await admin.firestore()
        .collection('approvalLogs')
        .add({
          userId: uid,
          role: role,
          approvedBy: callerId,
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          userEmail: userData?.email || 'unknown',
          userName: userData?.name || 'unknown'
        });

      // Send approval notification email (optional - would need email service)
      // await sendApprovalEmail(userData?.email, userData?.name, role);

      functions.logger.info(`Role ${role} assigned to user ${uid} by ${callerId}`);

      return {
        success: true,
        message: `Successfully assigned ${role} role to user`,
        uid: uid,
        role: role,
        approvedBy: callerId,
        approvedAt: new Date().toISOString()
      };

    } catch (error) {
      functions.logger.error('Error in assignUserRole:', error);
      
      // Re-throw HttpsError as-is
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      // Wrap other errors
      throw new functions.https.HttpsError(
        'internal',
        'An internal error occurred while assigning the role.'
      );
    }
  }
);

/**
 * Cloud Function to revoke user roles
 * Only admins can call this function
 */
export const revokeUserRole = functions.https.onCall(
  async (data: { uid: string }, context) => {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to call this function.'
      );
    }

    const callerId = context.auth.uid;
    const { uid } = data;

    // Validate input
    if (!uid || typeof uid !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'User ID is required and must be a string.'
      );
    }

    try {
      // Get caller's custom claims to verify permissions
      const callerRecord = await admin.auth().getUser(callerId);
      const callerClaims = callerRecord.customClaims || {};
      const callerRole = callerClaims.role;

      // Only admins can revoke roles
      if (callerRole !== VALID_ROLES.ADMIN) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Only admins can revoke user roles.'
        );
      }

      // Get current user data
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(uid)
        .get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User document not found.'
        );
      }

      const userData = userDoc.data();
      const previousRole = userData?.role;

      // Remove custom claims
      await admin.auth().setCustomUserClaims(uid, {});

      // Update user document
      await admin.firestore()
        .collection('users')
        .doc(uid)
        .update({
          role: 'pending',
          approved: false,
          revokedAt: admin.firestore.FieldValue.serverTimestamp(),
          revokedBy: callerId,
          previousRole: previousRole,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      // Log the revocation
      await admin.firestore()
        .collection('revocationLogs')
        .add({
          userId: uid,
          previousRole: previousRole,
          revokedBy: callerId,
          revokedAt: admin.firestore.FieldValue.serverTimestamp(),
          userEmail: userData?.email || 'unknown',
          userName: userData?.name || 'unknown'
        });

      functions.logger.info(`Role revoked for user ${uid} by ${callerId}`);

      return {
        success: true,
        message: 'Successfully revoked user role',
        uid: uid,
        previousRole: previousRole,
        revokedBy: callerId
      };

    } catch (error) {
      functions.logger.error('Error in revokeUserRole:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'An internal error occurred while revoking the role.'
      );
    }
  }
);

/**
 * Cloud Function to get user role information
 * Users can only get their own role info, admins can get any user's info
 */
export const getUserRole = functions.https.onCall(
  async (data: { uid?: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to call this function.'
      );
    }

    const callerId = context.auth.uid;
    const targetUid = data.uid || callerId;

    try {
      // If requesting another user's info, check permissions
      if (targetUid !== callerId) {
        const callerRecord = await admin.auth().getUser(callerId);
        const callerClaims = callerRecord.customClaims || {};
        const callerRole = callerClaims.role;

        if (callerRole !== VALID_ROLES.ADMIN) {
          throw new functions.https.HttpsError(
            'permission-denied',
            'You can only access your own role information.'
          );
        }
      }

      // Get user's auth record and custom claims
      const userRecord = await admin.auth().getUser(targetUid);
      const customClaims = userRecord.customClaims || {};

      // Get user document from Firestore
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(targetUid)
        .get();

      const userData = userDoc.exists ? userDoc.data() : {};

      return {
        uid: targetUid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        role: customClaims.role || 'pending',
        approved: customClaims.approved || false,
        approvedAt: customClaims.approvedAt || null,
        firestoreRole: userData?.role || 'pending',
        firestoreApproved: userData?.approved || false,
        requestedRole: userData?.requestedRole || null,
        createdAt: userData?.createdAt || null
      };

    } catch (error) {
      functions.logger.error('Error in getUserRole:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'An internal error occurred while getting role information.'
      );
    }
  }
);

/**
 * Firestore trigger to sync role changes
 * Ensures custom claims stay in sync with Firestore data
 */
export const syncUserRole = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if role or approval status changed
    const roleChanged = beforeData.role !== afterData.role;
    const approvalChanged = beforeData.approved !== afterData.approved;

    if (roleChanged || approvalChanged) {
      try {
        // Update custom claims to match Firestore data
        const customClaims = {
          role: afterData.role,
          approved: afterData.approved
        };

        await admin.auth().setCustomUserClaims(userId, customClaims);
        
        functions.logger.info(
          `Synced custom claims for user ${userId}: role=${afterData.role}, approved=${afterData.approved}`
        );
      } catch (error) {
        functions.logger.error(`Error syncing custom claims for user ${userId}:`, error);
      }
    }
  });

/**
 * HTTP function to check system health
 */
export const healthCheck = functions.https.onRequest((req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    functions: [
      'assignUserRole',
      'revokeUserRole', 
      'getUserRole',
      'syncUserRole'
    ]
  });
});
