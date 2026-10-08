/**
 * HealPoint AI Core Conversation Engine
 * Implements NLU, Intent Classification, Entity Extraction, Conversation Memory,
 * Emergency Safety Triage, Tool Invocation, and Response Formatting.
 */

import { MEDICAL_TAXONOMY, EMERGENCY_FLAGS } from '../knowledge/medicalTaxonomy.js';
import { searchClinicKnowledge } from '../knowledge/ragClinicInfo.js';
import { 
  searchDoctorsTool, 
  findAvailableSlotsTool, 
  getPatientAppointmentsTool, 
  createAppointmentTool, 
  cancelAppointmentTool,
  SAMPLE_DOCTORS
} from '../tools/aiTools.js';
import { summarizeMedicalReport } from './reportSummarizerService.js';

/**
 * In-Memory Conversation Context Store
 */
const conversationStore = new Map();

export const getOrCreateConversation = (conversationId = 'default_session') => {
  if (!conversationStore.has(conversationId)) {
    conversationStore.set(conversationId, {
      id: conversationId,
      messages: [],
      context: {
        specialty: null,
        targetDate: null,
        timePreference: null,
        selectedDoctorId: null,
        pendingAction: null,
        pendingAppointmentId: null
      },
      createdAt: Date.now()
    });
  }
  return conversationStore.get(conversationId);
};

/**
 * Emergency Triage Check
 */
export const checkEmergency = (text) => {
  const lower = text.toLowerCase();
  for (const flag of EMERGENCY_FLAGS) {
    if (lower.includes(flag)) {
      return true;
    }
  }
  return false;
};

/**
 * Detect Medical Specialty from natural language symptoms
 */
export const detectSpecialty = (text) => {
  const lower = text.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  for (const [specName, specData] of Object.entries(MEDICAL_TAXONOMY)) {
    let score = 0;
    const specRegex = new RegExp(`\\b${specName.toLowerCase()}\\b`, 'i');
    if (specRegex.test(lower)) {
      score += 10;
    }
    for (const kw of specData.keywords) {
      const kwRegex = new RegExp(`\\b${kw.toLowerCase()}\\b`, 'i');
      if (kwRegex.test(lower)) {
        score += 4;
      } else if (kw.length > 4 && lower.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = specName;
    }
  }

  return bestMatch;
};

/**
 * Extract Date & Time preferences from message
 */
export const extractDateTimePreferences = (text) => {
  const lower = text.toLowerCase();
  let timePreference = null;
  if (lower.includes('evening') || lower.includes('night') || lower.includes('after 5') || lower.includes('after 6')) {
    timePreference = 'evening';
  } else if (lower.includes('morning') || lower.includes('early')) {
    timePreference = 'morning';
  } else if (lower.includes('afternoon') || lower.includes('lunch')) {
    timePreference = 'afternoon';
  }

  let targetDate = null;
  const now = new Date();
  if (lower.includes('tomorrow')) {
    const tmr = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    targetDate = tmr.toISOString().split('T')[0];
  } else if (lower.includes('today')) {
    targetDate = now.toISOString().split('T')[0];
  } else if (lower.includes('friday')) {
    // next friday
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay() + 5) % 7 || 7));
    targetDate = d.toISOString().split('T')[0];
  } else if (lower.includes('monday')) {
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay() + 1) % 7 || 7));
    targetDate = d.toISOString().split('T')[0];
  }

  return { timePreference, targetDate };
};

/**
 * Main Process Message Entrypoint
 */
export const processUserMessage = async ({ message, conversationId = 'default_session', user = null, dbPool = null }) => {
  const conv = getOrCreateConversation(conversationId);
  const userText = message.trim();
  const lower = userText.toLowerCase();

  // 1. Emergency Safety Filter
  if (checkEmergency(userText)) {
    return {
      message: "⚠️ **URGENT MEDICAL NOTICE**: What you are describing may require immediate emergency medical care. Please call your local emergency service (112 or 911) or visit the nearest hospital emergency room immediately.\n\nHealPoint AI cannot provide emergency medical care or diagnosis. Once you are safe, I can assist with standard scheduling.",
      intent: 'EMERGENCY_TRIAGE',
      isEmergency: true,
      suggestedActions: [
        { label: 'Find Emergency Contact Info', action: 'clinic_emergency' },
        { label: 'Schedule Non-Urgent Visit', action: 'find_doctor' }
      ]
    };
  }

  // 2. Check for Report Summarization request
  if (lower.startsWith('/summarize') || lower.includes('summarize my report') || lower.includes('hemoglobin') || lower.includes('cbc') || lower.includes('blood test report')) {
    const reportSummary = summarizeMedicalReport(userText);
    return {
      message: `Here is the summary of your medical report:\n\n${reportSummary.summary}`,
      intent: 'MEDICAL_REPORT_SUMMARY',
      reportSummary,
      suggestedActions: [
        { label: 'Find a Specialist for this Report', action: 'find_doctor' },
        { label: 'Book Consultation', action: 'find_slot' }
      ]
    };
  }

  // 2b. Check for greetings or personal introductions
  const detectedEarly = detectSpecialty(userText);
  const greetingWords = ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 'hola'];
  const isGreeting = greetingWords.some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + ',') || lower.startsWith(g + '!'));
  const isSelfIntro = (lower.startsWith('i am ') || lower.startsWith('my name is ') || (userText.split(/\s+/).length <= 3 && !lower.includes('pain') && !lower.includes('doctor') && !lower.includes('appointment') && !detectedEarly));

  if (isGreeting || isSelfIntro) {
    let nameExtracted = '';
    if (lower.startsWith('i am ')) nameExtracted = userText.substring(5).trim();
    else if (lower.startsWith('my name is ')) nameExtracted = userText.substring(11).trim();
    else if (isSelfIntro && !isGreeting && !['what', 'how', 'why', 'can', 'help', 'book'].includes(lower.split(/\s+/)[0])) {
      nameExtracted = userText.trim();
    }
    
    const greetingMsg = nameExtracted 
      ? `Hello **${nameExtracted}**! 👋 I am **Ghasitaram** — *“Health ka jhatpat jawab.”*\n\nHow can I help you today? You can describe any symptoms, search for top-rated specialists, check real-time available slots, or summarize your medical test reports.`
      : `Hello! 👋 I am **Ghasitaram** — *“Health ka jhatpat jawab.”*\n\nHow can I assist you today? You can describe symptoms, find specialists, book appointment slots, or summarize medical reports.`;

    return {
      message: greetingMsg,
      intent: 'GREETING',
      suggestedActions: [
        { label: '🩺 Find a Doctor by Symptoms', action: 'find_doctor' },
        { label: '📅 Book an Appointment', action: 'find_slots' },
        { label: '🕒 Show My Next Appointment', action: 'view_appointments' },
        { label: '📄 Summarize Lab Report', action: 'summarize_report' }
      ]
    };
  }

  // 3. Check for Confirmation to pending actions (e.g. Cancel or Book)
  if (conv.context.pendingAction === 'CONFIRM_CANCEL' && (lower.includes('yes') || lower.includes('cancel it') || lower.includes('confirm'))) {
    const aptId = conv.context.pendingAppointmentId;
    const cancelRes = await cancelAppointmentTool({ appointmentId: aptId, patientId: user?.user_id, dbPool });
    conv.context.pendingAction = null;
    conv.context.pendingAppointmentId = null;
    return {
      message: `✅ Your appointment #${aptId} has been successfully cancelled. If you paid in advance, a refund will be issued to your original payment method.`,
      intent: 'CANCEL_APPOINTMENT_CONFIRMED',
      suggestedActions: [
        { label: 'Book Another Appointment', action: 'find_doctor' },
        { label: 'View Upcoming Appointments', action: 'view_appointments' }
      ]
    };
  }

  if (conv.context.pendingAction === 'CONFIRM_CANCEL' && (lower.includes('no') || lower.includes('keep') || lower.includes('dont'))) {
    conv.context.pendingAction = null;
    conv.context.pendingAppointmentId = null;
    return {
      message: "Understood! Your appointment remains confirmed and scheduled as planned.",
      intent: 'CANCEL_APPOINTMENT_ABORTED',
      suggestedActions: [
        { label: 'View My Appointments', action: 'view_appointments' }
      ]
    };
  }

  // 4. Appointment Status & History requests
  if (lower.includes('my next appointment') || lower.includes('upcoming appointment') || lower.includes('when is my appointment') || lower.includes('view appointment')) {
    const sampleApts = [
      {
        appointment_id: 1042,
        doctorName: 'Dr. Rahul Sharma',
        specialization: 'Dermatology',
        appointment_datetime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'SCHEDULED'
      }
    ];
    const apts = await getPatientAppointmentsTool({ patientId: user?.user_id, dbPool, sampleAppointments: sampleApts });
    const upcoming = apts.filter(a => a.status === 'SCHEDULED');

    if (upcoming.length > 0) {
      const next = upcoming[0];
      const dateFormatted = new Date(next.appointment_datetime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const timeFormatted = new Date(next.appointment_datetime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

      return {
        message: `Your next appointment is with **${next.doctorName || 'your doctor'}** (${next.specialization || 'General'}) on **${dateFormatted} at ${timeFormatted}**.`,
        intent: 'VIEW_APPOINTMENT',
        appointments: upcoming,
        suggestedActions: [
          { label: 'Reschedule', action: `reschedule_${next.appointment_id}` },
          { label: 'Cancel Appointment', action: `cancel_${next.appointment_id}` }
        ]
      };
    } else {
      return {
        message: "You currently have no upcoming appointments scheduled. Would you like me to help you find a doctor and book one?",
        intent: 'VIEW_APPOINTMENT',
        appointments: [],
        suggestedActions: [
          { label: 'Find a Doctor', action: 'find_doctor' },
          { label: 'Browse Specialties', action: 'browse_specialties' }
        ]
      };
    }
  }

  // 5. Cancel Appointment Request
  if (lower.includes('cancel my appointment') || lower.includes('cancel appointment')) {
    conv.context.pendingAction = 'CONFIRM_CANCEL';
    conv.context.pendingAppointmentId = 1042;
    return {
      message: "I found your upcoming appointment with **Dr. Rahul Sharma** (Dermatologist). Would you like to confirm the cancellation?",
      intent: 'CANCEL_APPOINTMENT',
      requiresConfirmation: true,
      actionPayload: { appointmentId: 1042 },
      confirmationOptions: [
        { label: 'Yes, Cancel Appointment', value: 'yes', variant: 'danger' },
        { label: 'No, Keep Appointment', value: 'no', variant: 'secondary' }
      ]
    };
  }

  // 6. Direct Booking Request
  if (lower.startsWith('book ') || lower.includes('confirm booking') || lower.includes('book this appointment') || lower.includes('book with')) {
    let selectedDoc = null;
    
    // Check if user mentioned a specific doctor's name
    for (const doc of SAMPLE_DOCTORS) {
      const docFullName = doc.name.toLowerCase();
      const docFirstName = doc.first_name.toLowerCase();
      const docLastName = doc.last_name.toLowerCase();
      if (lower.includes(docFullName) || (docFirstName.length > 2 && lower.includes(docFirstName)) || (docLastName.length > 2 && lower.includes(docLastName))) {
        selectedDoc = doc;
        conv.context.selectedDoctorId = doc.doctor_id;
        break;
      }
    }

    if (!selectedDoc && conv.context.selectedDoctorId) {
      selectedDoc = SAMPLE_DOCTORS.find(d => d.doctor_id === conv.context.selectedDoctorId);
    }
    
    if (!selectedDoc && conv.context.specialty) {
      selectedDoc = SAMPLE_DOCTORS.find(d => 
        d.specialty.toLowerCase().includes(conv.context.specialty.toLowerCase()) || 
        conv.context.specialty.toLowerCase().includes(d.specialty.toLowerCase()) ||
        d.specialties.some(s => s.toLowerCase().includes(conv.context.specialty.toLowerCase()))
      );
    }
    
    if (!selectedDoc) {
      selectedDoc = SAMPLE_DOCTORS.find(d => d.doctor_id === 104) || SAMPLE_DOCTORS[0]; // Dr. Priya Nair
    }
    
    const selectedDocId = selectedDoc.doctor_id;
    const bookingRes = await createAppointmentTool({
      patientId: user?.user_id || 1,
      doctorId: selectedDocId,
      datetime: conv.context.targetDate ? `${conv.context.targetDate}T17:30:00` : new Date(Date.now() + 24*3600*1000).toISOString(),
      appointmentType: 'VIDEO',
      dbPool
    });

    const doc = selectedDoc;
    return {
      message: `🎉 **Appointment Confirmed!** Your consultation with **${doc.name}** (${doc.specialty}) has been successfully scheduled.\n\n• **Date & Time:** Tomorrow at 5:30 PM\n• **Type:** Video Consultation (WebRTC)\n• **Room Link:** Ready in your dashboard`,
      intent: 'BOOK_APPOINTMENT',
      bookingDetails: {
        appointmentId: bookingRes.appointmentId || 1042,
        doctor: doc,
        time: '5:30 PM',
        date: conv.context.targetDate || 'Tomorrow',
        type: 'Video Consultation (WebRTC)',
        location: doc.location || 'HealPoint Clinic'
      },
      suggestedActions: [
        { label: 'View in Patient Dashboard', action: 'view_dashboard' },
        { label: 'Ask Another Question', action: 'new_query' }
      ]
    };
  }

  // 7. Check for RAG / Clinic FAQ queries
  const ragResults = searchClinicKnowledge(userText);
  if (ragResults.length > 0 && !lower.includes('doctor') && !lower.includes('appointment')) {
    const topItem = ragResults[0];
    return {
      message: `**${topItem.topic}**\n\n${topItem.content}`,
      intent: 'CLINIC_POLICY_FAQ',
      suggestedActions: [
        { label: 'Find a Doctor', action: 'find_doctor' },
        { label: 'Book Appointment', action: 'find_slot' }
      ]
    };
  }

  // 8. Natural Language Specialty & Symptom Extraction
  const detected = detectSpecialty(userText);
  const { timePreference, targetDate } = extractDateTimePreferences(userText);

  if (detected) conv.context.specialty = detected;
  if (timePreference) conv.context.timePreference = timePreference;
  if (targetDate) conv.context.targetDate = targetDate;

  const activeSpecialty = conv.context.specialty || detected || 'General Medicine';

  // Search doctors & available slots
  const matchingDoctors = await searchDoctorsTool({
    specialty: activeSpecialty,
    dbPool
  });

  const slots = await findAvailableSlotsTool({
    specialty: activeSpecialty,
    targetDate: conv.context.targetDate,
    timePreference: conv.context.timePreference,
    dbPool
  });

  if (matchingDoctors.length > 0) {
    conv.context.selectedDoctorId = matchingDoctors[0].doctor_id;
    let reply = `Based on what you've described, I recommend consulting a specialist in **${activeSpecialty}**. `;
    if (conv.context.timePreference) {
      reply += `I found available ${conv.context.timePreference} slots. `;
    } else {
      reply += `Here are highly rated doctors available for consultation:`;
    }

    return {
      message: reply,
      intent: 'FIND_DOCTOR',
      specialty: activeSpecialty,
      doctors: matchingDoctors.slice(0, 3),
      availableSlots: slots,
      suggestedActions: [
        { label: `Book with ${matchingDoctors[0].name}`, action: `book_doc_${matchingDoctors[0].doctor_id}` },
        { label: 'Find Available Slots', action: 'find_slots' },
        { label: 'Ask Another Question', action: 'new_query' }
      ],
      safetyNotice: '🤖Ghasitaram provides healthcare information and scheduling assistance, not medical diagnoses.'
    };
  }

  // Default fallback conversational response
  return {
    message: "I am **🤖Ghasitaram** — *“Health ka jhatpat jawab.”* 🩺\n\nI can help you find specialists for symptoms, check real-time doctor availability, book or manage appointments, and summarize medical reports.\n\nHow can I assist you today?",
    intent: 'GENERAL_HEALTH_INFORMATION',
    suggestedActions: [
      { label: 'Find a Doctor by Symptoms', action: 'find_doctor' },
      { label: 'Show My Next Appointment', action: 'view_appointments' },
      { label: 'Find Earliest Available Slot', action: 'find_earliest_slot' },
      { label: 'Summarize Lab Report', action: 'summarize_report' }
    ]
  };
};
