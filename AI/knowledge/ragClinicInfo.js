/**
 * RAG Knowledge Base for HealPoint Clinics
 * Contains verified clinic policies, insurance guidelines, video consultation FAQs, and appointment rules.
 */

export const CLINIC_KNOWLEDGE = [
  {
    topic: 'Booking & Cancellation Policy',
    keywords: ['cancel', 'refund', 'reschedule', 'cancellation policy', 'fee refund'],
    content: 'Appointments can be rescheduled or cancelled up to 2 hours before the scheduled time. Cancelled appointments with advance payments are eligible for automatic refunds within 3-5 business days.'
  },
  {
    topic: 'Telemedicine & Video Consultations',
    keywords: ['video call', 'telemedicine', 'online consultation', 'how video works', 'camera'],
    content: 'HealPoint telemedicine consultations happen securely in your web browser using WebRTC. No extra software download is required. Ensure camera and microphone permissions are enabled on your browser.'
  },
  {
    topic: 'Digital Prescriptions & Medical Records',
    keywords: ['prescription', 'medical record', 'download prescription', 'lab report'],
    content: 'Following your consultation, the attending doctor generates a verified digital prescription containing dosage instructions. You can view, print, or download this anytime from your Patient Dashboard under Medical Records.'
  },
  {
    topic: 'Insurance & Co-Pay',
    keywords: ['insurance', 'co-pay', 'coverage', 'policy', 'claim'],
    content: 'HealPoint supports major health insurance providers. Patients can store their insurance policy in their dashboard to automatically verify eligibility and compute applicable co-pay amounts.'
  },
  {
    topic: 'Smart Waitlist System',
    keywords: ['waitlist', 'full', 'no slot', 'earlier slot', 'waiting'],
    content: 'If your preferred doctor has no available slots for a specific date, you can join their waitlist. If a cancellation occurs, you will receive an automated notification alert.'
  },
  {
    topic: 'Working Hours & Emergency Notice',
    keywords: ['emergency', 'urgent', 'hours', 'timing', 'open'],
    content: 'HealPoint connects you with private practitioners whose hours vary. For immediate medical emergencies (severe chest pain, breathing difficulty, stroke symptoms), dial your local emergency services (112 / 911) or visit the nearest emergency room immediately.'
  }
];

export const searchClinicKnowledge = (query) => {
  const q = query.toLowerCase();
  return CLINIC_KNOWLEDGE.filter(item => 
    item.keywords.some(k => q.includes(k)) || q.includes(item.topic.toLowerCase())
  );
};
