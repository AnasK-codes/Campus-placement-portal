// Certificate Generator Utility for Campus Placement Portal
// Integrates with Firebase Cloud Functions for PDF generation

import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';

class CertificateGenerator {
  constructor() {
    this.templates = {
      internship: {
        title: 'Internship Completion Certificate',
        subtitle: 'This is to certify that',
        description: 'has successfully completed the internship program',
        footer: 'We congratulate the intern for their dedication and excellent performance.'
      },
      excellence: {
        title: 'Certificate of Excellence',
        subtitle: 'This is to certify that',
        description: 'has demonstrated exceptional performance during the internship',
        footer: 'This achievement reflects outstanding commitment and professional excellence.'
      },
      participation: {
        title: 'Certificate of Participation',
        subtitle: 'This is to certify that',
        description: 'has actively participated in the internship program',
        footer: 'We appreciate the valuable contribution and active engagement.'
      }
    };
  }

  // Generate certificate data structure
  async generateCertificate(applicationData, mentorFeedback, performanceMetrics = {}) {
    try {
      // Validate required data
      if (!applicationData || !applicationData.studentId || !applicationData.internshipId) {
        throw new Error('Invalid application data provided');
      }

      // Fetch student and internship details
      const [studentDoc, internshipDoc] = await Promise.all([
        getDoc(doc(db, 'users', applicationData.studentId)),
        getDoc(doc(db, 'internships', applicationData.internshipId))
      ]);

      if (!studentDoc.exists() || !internshipDoc.exists()) {
        throw new Error('Student or internship data not found');
      }

      const studentData = studentDoc.data();
      const internshipData = internshipDoc.data();

      // Determine certificate type based on performance
      const overallRating = performanceMetrics.overall || 4.0;
      let certificateType = 'internship';
      if (overallRating >= 4.5) {
        certificateType = 'excellence';
      } else if (overallRating < 3.5) {
        certificateType = 'participation';
      }

      // Calculate internship duration
      const startDate = applicationData.startDate || applicationData.approvedAt;
      const endDate = applicationData.completedAt || new Date();
      const duration = this.calculateDuration(startDate, endDate);

      // Generate certificate data
      const certificateData = {
        // Student Information
        studentId: applicationData.studentId,
        studentName: studentData.name,
        studentEmail: studentData.email,
        studentDepartment: studentData.department,
        studentYear: studentData.year,

        // Internship Information
        internshipId: applicationData.internshipId,
        internshipTitle: internshipData.role,
        companyName: internshipData.company,
        companyLogo: internshipData.logoUrl,
        department: internshipData.department,
        location: internshipData.location,
        duration: duration,

        // Mentor Information
        mentorId: applicationData.mentorId,
        mentorName: mentorFeedback?.mentorName || 'Academic Mentor',
        mentorSignature: mentorFeedback?.signature,

        // Certificate Details
        certificateType: certificateType,
        template: this.templates[certificateType],
        certificateId: this.generateCertificateId(),
        
        // Performance Metrics
        performance: {
          overall: performanceMetrics.overall || 4.0,
          technical: performanceMetrics.technical || 4.0,
          communication: performanceMetrics.communication || 4.0,
          teamwork: performanceMetrics.teamwork || 4.0,
          punctuality: performanceMetrics.punctuality || 4.5,
          projectsCompleted: performanceMetrics.projectsCompleted || 3,
          skillsGained: performanceMetrics.skillsGained || ['Problem Solving', 'Team Collaboration', 'Technical Skills'],
          attendanceRate: performanceMetrics.attendanceRate || 95,
          feedback: mentorFeedback?.comments || 'Excellent performance throughout the internship period.'
        },

        // Timestamps
        startDate: startDate,
        completedAt: endDate,
        createdAt: serverTimestamp(),
        
        // Status
        status: 'pending', // Will be updated to 'generated' after PDF creation
        fileUrl: null, // Will be populated after PDF generation
        downloadCount: 0,

        // Additional metadata
        metadata: {
          generatedBy: 'system',
          version: '1.0',
          template: certificateType,
          language: 'en',
          format: 'PDF'
        }
      };

      return certificateData;
    } catch (error) {
      console.error('Error generating certificate data:', error);
      throw error;
    }
  }

  // Save certificate to Firestore and trigger PDF generation
  async createCertificate(applicationData, mentorFeedback, performanceMetrics = {}) {
    try {
      // Generate certificate data
      const certificateData = await this.generateCertificate(
        applicationData, 
        mentorFeedback, 
        performanceMetrics
      );

      // Save to Firestore
      const certificateRef = await addDoc(collection(db, 'certificates'), certificateData);
      
      // Update certificate with its own ID
      await updateDoc(certificateRef, {
        id: certificateRef.id
      });

      // Trigger Cloud Function for PDF generation
      await this.triggerPDFGeneration(certificateRef.id, certificateData);

      // Update application status
      await updateDoc(doc(db, 'applications', applicationData.id), {
        certificateGenerated: true,
        certificateId: certificateRef.id,
        status: 'completed'
      });

      return {
        success: true,
        certificateId: certificateRef.id,
        message: 'Certificate generation initiated successfully'
      };
    } catch (error) {
      console.error('Error creating certificate:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate certificate'
      };
    }
  }

  // Trigger Cloud Function for PDF generation
  async triggerPDFGeneration(certificateId, certificateData) {
    try {
      // In a real implementation, this would call a Cloud Function
      // For now, we'll simulate the PDF generation process
      
      // Simulate API call to Cloud Function
      const response = await fetch('/api/generateCertificatePDF', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateId,
          certificateData
        })
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const result = await response.json();
      
      // Update certificate with file URL
      await updateDoc(doc(db, 'certificates', certificateId), {
        status: 'generated',
        fileUrl: result.fileUrl,
        pdfGeneratedAt: serverTimestamp()
      });

      return result;
    } catch (error) {
      console.error('Error triggering PDF generation:', error);
      
      // Update certificate status to failed
      await updateDoc(doc(db, 'certificates', certificateId), {
        status: 'failed',
        error: error.message,
        failedAt: serverTimestamp()
      });
      
      throw error;
    }
  }

  // Generate unique certificate ID
  generateCertificateId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `CERT-${timestamp}-${randomStr}`.toUpperCase();
  }

  // Calculate internship duration
  calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return 'Not specified';

    const start = startDate.toDate ? startDate.toDate() : new Date(startDate);
    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.round(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.round(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    }
  }

  // Validate certificate data
  validateCertificateData(certificateData) {
    const requiredFields = [
      'studentName',
      'studentEmail',
      'internshipTitle',
      'companyName',
      'mentorName'
    ];

    const missingFields = requiredFields.filter(field => !certificateData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return true;
  }

  // Get certificate template by type
  getTemplate(type = 'internship') {
    return this.templates[type] || this.templates.internship;
  }

  // Generate certificate preview data (for UI preview)
  generatePreviewData(studentName, internshipTitle, companyName, certificateType = 'internship') {
    const template = this.getTemplate(certificateType);
    
    return {
      template,
      studentName,
      internshipTitle,
      companyName,
      certificateId: this.generateCertificateId(),
      previewMode: true,
      generatedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  }

  // Bulk certificate generation for multiple students
  async generateBulkCertificates(applications, mentorFeedback = {}, performanceMetrics = {}) {
    const results = [];
    
    for (const application of applications) {
      try {
        const result = await this.createCertificate(
          application,
          mentorFeedback[application.id] || {},
          performanceMetrics[application.id] || {}
        );
        results.push({ applicationId: application.id, ...result });
      } catch (error) {
        results.push({
          applicationId: application.id,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Get certificate statistics
  async getCertificateStats(mentorId) {
    try {
      // This would typically be done with a more efficient query
      // For now, we'll use a simple approach
      const certificatesQuery = query(
        collection(db, 'certificates'),
        where('mentorId', '==', mentorId)
      );

      const snapshot = await getDocs(certificatesQuery);
      const certificates = [];
      snapshot.forEach(doc => {
        certificates.push({ id: doc.id, ...doc.data() });
      });

      const stats = {
        total: certificates.length,
        generated: certificates.filter(cert => cert.status === 'generated').length,
        pending: certificates.filter(cert => cert.status === 'pending').length,
        failed: certificates.filter(cert => cert.status === 'failed').length,
        excellence: certificates.filter(cert => cert.certificateType === 'excellence').length,
        totalDownloads: certificates.reduce((sum, cert) => sum + (cert.downloadCount || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error getting certificate stats:', error);
      return {
        total: 0,
        generated: 0,
        pending: 0,
        failed: 0,
        excellence: 0,
        totalDownloads: 0
      };
    }
  }
}

// Export singleton instance
export default new CertificateGenerator();

// Export individual functions for specific use cases
export const {
  generateCertificate,
  createCertificate,
  generateCertificateId,
  calculateDuration,
  validateCertificateData,
  getTemplate,
  generatePreviewData,
  generateBulkCertificates,
  getCertificateStats
} = new CertificateGenerator();
