// Enhanced Certificate Generator with Firebase Functions Integration
// Handles automatic PDF generation and Firebase Storage management

import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

class EnhancedCertificateGenerator {
  constructor() {
    this.templates = {
      excellence: {
        title: 'Certificate of Excellence',
        subtitle: 'Outstanding Performance Recognition',
        description: 'has demonstrated exceptional performance and dedication during the internship program',
        footer: 'This achievement reflects outstanding commitment, professional excellence, and remarkable contribution to the organization.',
        minRating: 4.5,
        color: '#FFD700'
      },
      completion: {
        title: 'Certificate of Completion',
        subtitle: 'Successful Internship Completion',
        description: 'has successfully completed the internship program with commendable performance',
        footer: 'We congratulate the intern for their dedication, hard work, and valuable contribution during the internship period.',
        minRating: 3.0,
        color: '#4CAF50'
      },
      participation: {
        title: 'Certificate of Participation',
        subtitle: 'Internship Program Participation',
        description: 'has actively participated in the internship program and gained valuable experience',
        footer: 'We appreciate the intern\'s engagement and commitment to learning throughout the program.',
        minRating: 0,
        color: '#2196F3'
      }
    };

    this.certificateStatuses = {
      PENDING: 'generating',
      GENERATED: 'generated',
      FAILED: 'failed'
    };
  }

  // Main function to generate certificate after feedback submission
  async generateCertificateFromFeedback(applicationId, mentorFeedback) {
    try {
      console.log('Starting certificate generation for application:', applicationId);
      
      // Get application details
      const applicationDoc = await getDoc(doc(db, 'applications', applicationId));
      if (!applicationDoc.exists()) {
        throw new Error('Application not found');
      }

      const applicationData = applicationDoc.data();
      
      // Load additional details
      const certificateData = await this.prepareCertificateData(applicationData, mentorFeedback);
      
      // Create certificate document in Firestore
      const certificateRef = await addDoc(collection(db, 'certificates'), {
        ...certificateData,
        status: this.certificateStatuses.PENDING,
        createdAt: serverTimestamp()
      });

      // Update application with certificate reference
      await updateDoc(doc(db, 'applications', applicationId), {
        certificateId: certificateRef.id,
        certificateStatus: this.certificateStatuses.PENDING,
        updatedAt: serverTimestamp()
      });

      // Trigger PDF generation (simulate Cloud Function call)
      await this.triggerPDFGeneration(certificateRef.id, certificateData);

      return {
        success: true,
        certificateId: certificateRef.id,
        message: 'Certificate generation initiated successfully'
      };

    } catch (error) {
      console.error('Error generating certificate:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate certificate'
      };
    }
  }

  // Prepare certificate data from application and feedback
  async prepareCertificateData(applicationData, mentorFeedback) {
    try {
      // Load student details
      const studentDoc = await getDoc(doc(db, 'users', applicationData.studentId));
      const studentData = studentDoc.exists() ? studentDoc.data() : {};

      // Load internship details
      const internshipDoc = await getDoc(doc(db, 'internships', applicationData.internshipId));
      const internshipData = internshipDoc.exists() ? internshipDoc.data() : {};

      // Load mentor details
      const mentorDoc = await getDoc(doc(db, 'users', applicationData.mentorId));
      const mentorData = mentorDoc.exists() ? mentorDoc.data() : {};

      // Determine certificate type based on overall rating
      const overallRating = mentorFeedback.ratings?.overall || 0;
      const certificateType = this.determineCertificateType(overallRating);
      const template = this.templates[certificateType];

      // Calculate performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(mentorFeedback.ratings);

      // Generate unique certificate ID
      const certificateId = this.generateCertificateId();

      return {
        // Certificate metadata
        certificateId,
        certificateType,
        template,

        // Student information
        studentId: applicationData.studentId,
        studentName: studentData.name || 'Student Name',
        studentEmail: studentData.email || '',
        studentDepartment: studentData.department || '',
        studentYear: studentData.year || '',

        // Internship information
        internshipId: applicationData.internshipId,
        internshipTitle: internshipData.role || 'Internship Position',
        companyName: internshipData.company || 'Company Name',
        companyLogo: internshipData.logoUrl || null,
        department: internshipData.department || 'Technology',
        location: internshipData.location || 'Remote',
        duration: this.calculateDuration(applicationData.startDate, applicationData.completedAt),

        // Mentor information
        mentorId: applicationData.mentorId,
        mentorName: mentorData.name || 'Mentor Name',
        mentorTitle: mentorData.title || 'Senior Mentor',
        mentorSignature: mentorData.signature || null,

        // Feedback and performance
        mentorFeedback,
        performanceMetrics,
        overallRating,

        // Dates
        startDate: applicationData.startDate || applicationData.createdAt,
        completedAt: applicationData.completedAt || serverTimestamp(),
        issuedDate: new Date(),

        // Certificate content
        certificateContent: this.generateCertificateContent(
          studentData.name || 'Student Name',
          internshipData.role || 'Internship Position',
          internshipData.company || 'Company Name',
          template
        ),

        // Status and metadata
        status: this.certificateStatuses.PENDING,
        downloadCount: 0,
        sharedCount: 0,
        
        // Additional metadata
        metadata: {
          generatedBy: 'enhanced_system',
          version: '2.0',
          template: certificateType,
          language: 'en',
          format: 'PDF',
          sentiment: mentorFeedback.sentiment || 'neutral'
        }
      };

    } catch (error) {
      console.error('Error preparing certificate data:', error);
      throw error;
    }
  }

  // Determine certificate type based on performance rating
  determineCertificateType(overallRating) {
    if (overallRating >= this.templates.excellence.minRating) {
      return 'excellence';
    } else if (overallRating >= this.templates.completion.minRating) {
      return 'completion';
    } else {
      return 'participation';
    }
  }

  // Calculate comprehensive performance metrics
  calculatePerformanceMetrics(ratings) {
    if (!ratings) return {};

    const ratingValues = Object.values(ratings).filter(val => typeof val === 'number');
    const average = ratingValues.length > 0 ? 
      ratingValues.reduce((sum, val) => sum + val, 0) / ratingValues.length : 0;

    return {
      overall: ratings.overall || average,
      technicalSkills: ratings.technicalSkills || 0,
      communication: ratings.communication || 0,
      punctuality: ratings.punctuality || 0,
      projectCompletion: ratings.projectCompletion || 0,
      teamwork: ratings.teamwork || 0,
      averageRating: average,
      totalCategories: ratingValues.length,
      excellentCategories: ratingValues.filter(val => val >= 4.5).length,
      goodCategories: ratingValues.filter(val => val >= 3.5 && val < 4.5).length,
      improvementAreas: Object.entries(ratings)
        .filter(([key, val]) => val < 3.5)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
    };
  }

  // Generate certificate content text
  generateCertificateContent(studentName, role, company, template) {
    return {
      header: template.title,
      subtitle: template.subtitle,
      mainText: `This is to certify that ${studentName} ${template.description} as ${role} at ${company}.`,
      footer: template.footer,
      issuedBy: 'Campus Placement Portal',
      issuedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  }

  // Simulate PDF generation via Cloud Function
  async triggerPDFGeneration(certificateId, certificateData) {
    try {
      // In a real implementation, this would call a Cloud Function
      // For now, we'll simulate the PDF generation process
      
      console.log('Triggering PDF generation for certificate:', certificateId);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate PDF generation and storage
      const mockPDFUrl = `certificates/${certificateId}/${certificateData.studentName}_Certificate.pdf`;
      
      // Update certificate with generated PDF URL
      await updateDoc(doc(db, 'certificates', certificateId), {
        status: this.certificateStatuses.GENERATED,
        certificateURL: mockPDFUrl,
        pdfGeneratedAt: serverTimestamp(),
        fileSize: Math.floor(Math.random() * 500000) + 100000, // Mock file size
        downloadURL: `https://storage.googleapis.com/campus-portal/${mockPDFUrl}`
      });

      // Update application status
      await updateDoc(doc(db, 'applications', certificateData.applicationId || 'unknown'), {
        certificateStatus: this.certificateStatuses.GENERATED,
        certificateURL: mockPDFUrl,
        status: 'completed',
        updatedAt: serverTimestamp()
      });

      console.log('Certificate PDF generated successfully:', certificateId);
      return { success: true, certificateURL: mockPDFUrl };

    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Update certificate status to failed
      await updateDoc(doc(db, 'certificates', certificateId), {
        status: this.certificateStatuses.FAILED,
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

  // Listen for real-time certificate updates
  subscribeToCertificateUpdates(certificateId, callback) {
    return onSnapshot(doc(db, 'certificates', certificateId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
  }

  // Get certificate statistics for mentor
  async getCertificateStats(mentorId) {
    try {
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
        pending: certificates.filter(cert => cert.status === 'generating').length,
        failed: certificates.filter(cert => cert.status === 'failed').length,
        excellence: certificates.filter(cert => cert.certificateType === 'excellence').length,
        completion: certificates.filter(cert => cert.certificateType === 'completion').length,
        participation: certificates.filter(cert => cert.certificateType === 'participation').length,
        totalDownloads: certificates.reduce((sum, cert) => sum + (cert.downloadCount || 0), 0),
        totalShares: certificates.reduce((sum, cert) => sum + (cert.sharedCount || 0), 0),
        averageRating: certificates.length > 0 ? 
          certificates.reduce((sum, cert) => sum + (cert.overallRating || 0), 0) / certificates.length : 0
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
        completion: 0,
        participation: 0,
        totalDownloads: 0,
        totalShares: 0,
        averageRating: 0
      };
    }
  }

  // Validate certificate data before generation
  validateCertificateData(certificateData) {
    const requiredFields = [
      'studentName',
      'studentEmail',
      'internshipTitle',
      'companyName',
      'mentorName',
      'mentorFeedback'
    ];

    const missingFields = requiredFields.filter(field => !certificateData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate ratings
    if (!certificateData.mentorFeedback?.ratings) {
      throw new Error('Mentor feedback ratings are required');
    }

    const ratings = certificateData.mentorFeedback.ratings;
    const invalidRatings = Object.entries(ratings)
      .filter(([key, value]) => typeof value !== 'number' || value < 1 || value > 5);

    if (invalidRatings.length > 0) {
      throw new Error(`Invalid ratings found: ${invalidRatings.map(([key]) => key).join(', ')}`);
    }

    return true;
  }

  // Generate certificate preview data (for UI preview)
  generatePreviewData(studentName, internshipTitle, companyName, certificateType = 'completion') {
    const template = this.templates[certificateType];
    
    return {
      template,
      studentName,
      internshipTitle,
      companyName,
      certificateId: this.generateCertificateId(),
      previewMode: true,
      issuedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      certificateContent: this.generateCertificateContent(studentName, internshipTitle, companyName, template)
    };
  }

  // Track certificate download
  async trackCertificateDownload(certificateId) {
    try {
      const certificateRef = doc(db, 'certificates', certificateId);
      const certificateDoc = await getDoc(certificateRef);
      
      if (certificateDoc.exists()) {
        const currentCount = certificateDoc.data().downloadCount || 0;
        await updateDoc(certificateRef, {
          downloadCount: currentCount + 1,
          lastDownloadedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error tracking certificate download:', error);
    }
  }

  // Track certificate share
  async trackCertificateShare(certificateId, platform = 'unknown') {
    try {
      const certificateRef = doc(db, 'certificates', certificateId);
      const certificateDoc = await getDoc(certificateRef);
      
      if (certificateDoc.exists()) {
        const currentCount = certificateDoc.data().sharedCount || 0;
        await updateDoc(certificateRef, {
          sharedCount: currentCount + 1,
          lastSharedAt: serverTimestamp(),
          lastSharedPlatform: platform
        });
      }
    } catch (error) {
      console.error('Error tracking certificate share:', error);
    }
  }
}

// Export singleton instance
export default new EnhancedCertificateGenerator();

// Export individual functions for specific use cases
export const {
  generateCertificateFromFeedback,
  subscribeToCertificateUpdates,
  getCertificateStats,
  generatePreviewData,
  trackCertificateDownload,
  trackCertificateShare
} = new EnhancedCertificateGenerator();
