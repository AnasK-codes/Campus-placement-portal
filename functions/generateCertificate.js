const functions = require('firebase-functions');
const admin = require('firebase-admin');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

/**
 * Cloud Function to generate certificates
 * Can be triggered via callable function or Firestore trigger
 */
exports.generateCertificate = functions.runWith({ 
  memory: '512MB',
  timeoutSeconds: 540 
}).https.onCall(async (data, context) => {
  try {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to generate certificates.'
      );
    }

    const { applicationId } = data;
    if (!applicationId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Application ID is required.'
      );
    }

    // Get user role and verify permissions
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const userRole = userDoc.data()?.role;
    
    if (!['mentor', 'placement', 'admin'].includes(userRole)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Insufficient permissions to generate certificates.'
      );
    }

    // Get application data
    const applicationDoc = await db.collection('applications').doc(applicationId).get();
    if (!applicationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Application not found.'
      );
    }

    const applicationData = applicationDoc.data();

    // Verify application is completed and feedback is finalized
    if (applicationData.status !== 'completed' || 
        applicationData.mentorFeedback?.status !== 'finalized') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Application must be completed with finalized mentor feedback.'
      );
    }

    // Verify mentor permissions (mentors can only generate for their assigned students)
    if (userRole === 'mentor' && applicationData.mentorId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Mentors can only generate certificates for their assigned students.'
      );
    }

    // Get student and internship data
    const [studentDoc, internshipDoc] = await Promise.all([
      db.collection('users').doc(applicationData.studentId).get(),
      db.collection('internships').doc(applicationData.internshipId).get()
    ]);

    if (!studentDoc.exists || !internshipDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Student or internship data not found.'
      );
    }

    const studentData = studentDoc.data();
    const internshipData = internshipDoc.data();

    // Generate unique verification ID
    const verificationId = uuidv4();
    const certificateId = `cert_${applicationId}_${Date.now()}`;

    // Prepare certificate data
    const certificateData = {
      verificationId,
      studentName: studentData.name || 'Student Name',
      studentEmail: studentData.email,
      studentDepartment: studentData.department,
      internshipTitle: internshipData.role || 'Internship Role',
      companyName: internshipData.company || 'Company Name',
      mentorName: applicationData.mentorName || 'Mentor Name',
      mentorDesignation: applicationData.mentorDesignation || 'Mentor',
      duration: internshipData.duration || '3 months',
      startDate: applicationData.startDate,
      endDate: applicationData.endDate,
      completionDate: applicationData.completedAt || admin.firestore.Timestamp.now(),
      feedback: applicationData.mentorFeedback,
      performance: calculatePerformanceMetrics(applicationData.mentorFeedback),
      generatedAt: admin.firestore.Timestamp.now(),
      generatedBy: context.auth.uid
    };

    // Generate certificate PDF
    const pdfBuffer = await generateCertificatePDF(certificateData);

    // Upload PDF to Firebase Storage
    const fileName = `certificates/${applicationData.studentId}/${certificateId}.pdf`;
    const file = storage.bucket().file(fileName);
    
    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          studentId: applicationData.studentId,
          applicationId: applicationId,
          verificationId: verificationId,
          generatedAt: new Date().toISOString()
        }
      }
    });

    // Get download URL
    const [downloadUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491' // Far future date for permanent access
    });

    // Update application with certificate data
    const certificateMetadata = {
      id: certificateId,
      verificationId: verificationId,
      url: downloadUrl,
      fileName: fileName,
      status: 'active',
      generatedAt: admin.firestore.Timestamp.now(),
      generatedBy: context.auth.uid,
      studentId: applicationData.studentId,
      applicationId: applicationId
    };

    // Update application document
    await applicationDoc.ref.update({
      certificate: certificateMetadata,
      certificateStatus: 'generated',
      updatedAt: admin.firestore.Timestamp.now()
    });

    // Store certificate metadata for verification
    await db.collection('certificates').doc(verificationId).set({
      ...certificateMetadata,
      studentName: certificateData.studentName,
      companyName: certificateData.companyName,
      internshipTitle: certificateData.internshipTitle,
      completionDate: certificateData.completionDate,
      mentorName: certificateData.mentorName,
      performance: certificateData.performance,
      isValid: true
    });

    // Create audit log
    await db.collection('audit').add({
      action: 'certificate_generated',
      actorUid: context.auth.uid,
      actorRole: userRole,
      targetRef: `applications/${applicationId}`,
      metadata: {
        certificateId: certificateId,
        verificationId: verificationId,
        studentId: applicationData.studentId,
        studentName: certificateData.studentName,
        companyName: certificateData.companyName
      },
      timestamp: admin.firestore.Timestamp.now(),
      ip: context.rawRequest?.ip || 'unknown'
    });

    // Send notification to student
    await db.collection('notifications').add({
      userId: applicationData.studentId,
      type: 'certificate_generated',
      title: 'Certificate Ready! 🎉',
      message: `Your internship certificate for ${certificateData.internshipTitle} at ${certificateData.companyName} is ready for download.`,
      data: {
        certificateId: certificateId,
        verificationId: verificationId,
        downloadUrl: downloadUrl,
        applicationId: applicationId
      },
      read: false,
      createdAt: admin.firestore.Timestamp.now()
    });

    // Optional: Send email notification (implement with your preferred email service)
    try {
      await sendCertificateEmail(certificateData, downloadUrl);
    } catch (emailError) {
      console.warn('Failed to send certificate email:', emailError);
      // Don't fail the entire function if email fails
    }

    return {
      success: true,
      certificateId: certificateId,
      verificationId: verificationId,
      downloadUrl: downloadUrl,
      message: 'Certificate generated successfully!'
    };

  } catch (error) {
    console.error('Certificate generation error:', error);
    
    // Log error to audit trail
    if (data.applicationId) {
      try {
        await db.collection('audit').add({
          action: 'certificate_generation_failed',
          actorUid: context.auth?.uid || 'unknown',
          targetRef: `applications/${data.applicationId}`,
          error: error.message,
          timestamp: admin.firestore.Timestamp.now()
        });

        // Update application with error status
        await db.collection('applications').doc(data.applicationId).update({
          certificateStatus: 'failed',
          certificateError: error.message,
          updatedAt: admin.firestore.Timestamp.now()
        });
      } catch (auditError) {
        console.error('Failed to log error:', auditError);
      }
    }

    // Re-throw as HttpsError for proper client handling
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Certificate generation failed. Please try again.',
      { originalError: error.message }
    );
  }
});

/**
 * Calculate performance metrics from mentor feedback
 */
function calculatePerformanceMetrics(feedback) {
  if (!feedback || !feedback.ratings) {
    return {
      overall: 4.0,
      category: 'Completion',
      projectsCompleted: 1,
      skillsGained: 5,
      attendanceRate: 95
    };
  }

  const ratings = feedback.ratings;
  const ratingValues = Object.values(ratings).filter(r => typeof r === 'number' && r > 0);
  const overall = ratingValues.length > 0 
    ? ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length 
    : 4.0;

  // Determine certificate category based on performance
  let category = 'Participation';
  if (overall >= 4.5) {
    category = 'Excellence';
  } else if (overall >= 3.5) {
    category = 'Completion';
  }

  return {
    overall: Math.round(overall * 10) / 10,
    category: category,
    projectsCompleted: feedback.checklist?.projectCompleted ? 
      (feedback.projectCount || 1) : 0,
    skillsGained: feedback.skillsCount || Math.floor(overall * 2),
    attendanceRate: feedback.checklist?.attendedStandups ? 95 : 85
  };
}

/**
 * Generate certificate PDF using PDFKit
 */
async function generateCertificatePDF(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Certificate dimensions
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const centerX = pageWidth / 2;

      // Colors
      const primaryRed = '#D32F2F';
      const goldColor = '#FFD700';
      const darkGray = '#333333';

      // Background and border
      doc.rect(25, 25, pageWidth - 50, pageHeight - 50)
         .stroke(primaryRed, 3);

      doc.rect(35, 35, pageWidth - 70, pageHeight - 70)
         .stroke(goldColor, 1);

      // Header
      doc.fontSize(36)
         .fillColor(primaryRed)
         .font('Helvetica-Bold')
         .text('CERTIFICATE OF COMPLETION', 0, 80, { align: 'center' });

      doc.fontSize(16)
         .fillColor(darkGray)
         .font('Helvetica')
         .text('Campus Placement Portal', 0, 130, { align: 'center' });

      // Main content
      doc.fontSize(18)
         .fillColor(darkGray)
         .text('This is to certify that', 0, 180, { align: 'center' });

      doc.fontSize(32)
         .fillColor(primaryRed)
         .font('Helvetica-Bold')
         .text(data.studentName, 0, 220, { align: 'center' });

      doc.fontSize(16)
         .fillColor(darkGray)
         .font('Helvetica')
         .text('has successfully completed the internship program as', 0, 270, { align: 'center' });

      doc.fontSize(24)
         .fillColor(primaryRed)
         .font('Helvetica-Bold')
         .text(data.internshipTitle, 0, 300, { align: 'center' });

      doc.fontSize(18)
         .fillColor(darkGray)
         .font('Helvetica')
         .text(`at ${data.companyName}`, 0, 340, { align: 'center' });

      // Performance summary
      if (data.feedback && data.feedback.summary) {
        doc.fontSize(14)
           .fillColor(darkGray)
           .text(`"${data.feedback.summary}"`, 100, 380, { 
             align: 'center', 
             width: pageWidth - 200 
           });
      }

      // Duration and dates
      const completionDate = data.completionDate.toDate ? 
        data.completionDate.toDate() : new Date(data.completionDate);
      
      doc.fontSize(14)
         .text(`Duration: ${data.duration}`, 100, 430);
      
      doc.text(`Completion Date: ${completionDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 100, 450);

      // Performance metrics
      if (data.performance) {
        doc.text(`Overall Rating: ${data.performance.overall}/5.0`, 100, 470);
        doc.text(`Certificate Type: ${data.performance.category}`, 100, 490);
      }

      // Mentor signature area
      doc.fontSize(12)
         .text('Mentor:', pageWidth - 300, 430);
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(data.mentorName, pageWidth - 300, 450);
      
      doc.fontSize(12)
         .font('Helvetica')
         .text(data.mentorDesignation || 'Mentor', pageWidth - 300, 470);

      // Verification section
      doc.fontSize(10)
         .fillColor(darkGray)
         .text(`Verification ID: ${data.verificationId}`, 50, pageHeight - 100);

      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, pageHeight - 85);

      // Generate QR code for verification
      try {
        const verificationUrl = `https://your-domain.com/verify?vid=${data.verificationId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
          width: 80,
          margin: 1,
          color: {
            dark: primaryRed,
            light: '#FFFFFF'
          }
        });

        // Convert data URL to buffer
        const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
        doc.image(qrBuffer, pageWidth - 130, pageHeight - 130, { width: 80, height: 80 });

        doc.fontSize(8)
           .text('Scan to verify', pageWidth - 130, pageHeight - 45, { width: 80, align: 'center' });
      } catch (qrError) {
        console.warn('Failed to generate QR code:', qrError);
      }

      // Footer
      doc.fontSize(10)
         .fillColor(primaryRed)
         .text('Campus Placement Portal - Authentic Certificate', 0, pageHeight - 30, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Send certificate email notification (stub implementation)
 */
async function sendCertificateEmail(certificateData, downloadUrl) {
  // Implement with your preferred email service (SendGrid, Nodemailer, etc.)
  console.log(`Certificate email would be sent to ${certificateData.studentEmail}`);
  
  // Example implementation with Nodemailer (uncomment and configure):
  /*
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransporter({
    // Configure your email service
  });

  const mailOptions = {
    from: 'noreply@campusplacement.com',
    to: certificateData.studentEmail,
    subject: `🎉 Your Internship Certificate is Ready!`,
    html: `
      <h2>Congratulations, ${certificateData.studentName}!</h2>
      <p>Your internship certificate for <strong>${certificateData.internshipTitle}</strong> at <strong>${certificateData.companyName}</strong> is now ready.</p>
      <p><a href="${downloadUrl}" style="background: #D32F2F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Certificate</a></p>
      <p>Verification ID: ${certificateData.verificationId}</p>
      <p>Best regards,<br>Campus Placement Portal Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
  */
}

/**
 * Firestore trigger for automatic certificate generation
 */
exports.onFeedbackFinalized = functions.firestore
  .document('applications/{applicationId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if feedback was just finalized
    if (before.mentorFeedback?.status !== 'finalized' && 
        after.mentorFeedback?.status === 'finalized' &&
        after.status === 'completed' &&
        !after.certificate) {
      
      try {
        // Auto-generate certificate
        const result = await exports.generateCertificate.run({
          applicationId: context.params.applicationId
        }, {
          auth: { uid: after.mentorId }, // Use mentor's ID for auth context
          rawRequest: { ip: 'firestore-trigger' }
        });
        
        console.log('Auto-generated certificate:', result);
      } catch (error) {
        console.error('Auto certificate generation failed:', error);
      }
    }
  });

module.exports = exports;
