/**
 * Medical Taxonomy & Symptom to Specialty Mapping
 * Used by HealPoint AI to accurately match patient concerns to the right clinical department.
 */

export const MEDICAL_TAXONOMY = {
  Dermatology: {
    name: 'Dermatology',
    keywords: [
      'skin', 'acne', 'rash', 'pimples', 'itching', 'eczema', 'psoriasis', 
      'mole', 'hair loss', 'dandruff', 'scalp', 'dry skin', 'sunburn', 
      'dark spots', 'pigmentation', 'fungal infection', 'dermatitis'
    ],
    description: 'Specializes in conditions of the skin, hair, and nails.',
    commonConditions: ['Acne Vulgaris', 'Eczema', 'Psoriasis', 'Alopecia', 'Skin Allergies']
  },
  Cardiology: {
    name: 'Cardiology',
    keywords: [
      'heart', 'chest pain', 'palpitations', 'high blood pressure', 'hypertension', 
      'cholesterol', 'shortness of breath', 'arrhythmia', 'heart rate', 'cardiac',
      'angina', 'cardiovascular', 'irregular heartbeat'
    ],
    description: 'Specializes in heart disorders and the cardiovascular system.',
    commonConditions: ['Hypertension', 'Coronary Artery Disease', 'Arrhythmia', 'High Cholesterol']
  },
  Neurology: {
    name: 'Neurology',
    keywords: [
      'headache', 'migraine', 'dizziness', 'vertigo', 'seizure', 'numbness', 
      'tingling', 'tremor', 'memory loss', 'nerve pain', 'brain', 'sciatica', 
      'fainting', 'blackout', 'paralysis'
    ],
    description: 'Specializes in disorders of the nervous system, brain, and spinal cord.',
    commonConditions: ['Migraine', 'Epilepsy', 'Peripheral Neuropathy', 'Tension Headaches']
  },
  'General Medicine': {
    name: 'General Medicine',
    keywords: [
      'fever', 'cold', 'cough', 'flu', 'fatigue', 'weakness', 'body ache', 
      'infection', 'vomiting', 'nausea', 'malaise', 'general checkup', 'weight loss',
      'chills', 'viral fever', 'stomach upset', 'food poisoning', 'routine visit'
    ],
    description: 'Specializes in comprehensive primary care and general illness diagnosis.',
    commonConditions: ['Viral Infection', 'Seasonal Flu', 'General Weakness', 'Diabetes Management']
  },
  Orthopedics: {
    name: 'Orthopedics',
    keywords: [
      'bone', 'joint', 'knee pain', 'back pain', 'fracture', 'arthritis', 
      'shoulder pain', 'spine', 'ligament', 'sprain', 'swelling joint', 
      'hip pain', 'neck stiffness', 'osteoporosis', 'slip disc'
    ],
    description: 'Specializes in the musculoskeletal system including bones, joints, and ligaments.',
    commonConditions: ['Osteoarthritis', 'Lumbar Strain', 'Ligament Tear', 'Joint Inflammation']
  },
  Pediatrics: {
    name: 'Pediatrics',
    keywords: [
      'child', 'baby', 'infant', 'toddler', 'kid', 'pediatric', 'vaccination', 
      'growth', 'teething', 'child fever', 'newborn', 'measles', 'mumps', 'colic'
    ],
    description: 'Specializes in the medical care of infants, children, and adolescents.',
    commonConditions: ['Pediatric Immunization', 'Colic', 'Childhood Viral Illness', 'Growth Assessment']
  },
  Gastroenterology: {
    name: 'Gastroenterology',
    keywords: [
      'stomach', 'acidity', 'acid reflux', 'gerd', 'gas', 'bloating', 'constipation', 
      'diarrhea', 'indigestion', 'liver', 'ulcer', 'abdomen pain', 'gut', 'ibs'
    ],
    description: 'Specializes in the digestive system and its disorders.',
    commonConditions: ['GERD / Acidity', 'Irritable Bowel Syndrome', 'Gastritis', 'Fatty Liver']
  },
  Ophthalmology: {
    name: 'Ophthalmology',
    keywords: [
      'eye', 'vision', 'blurry vision', 'dry eyes', 'eye strain', 'red eye', 
      'cataract', 'glaucoma', 'spectacles', 'irritation eye', 'conjunctivitis'
    ],
    description: 'Specializes in eye care, vision correction, and ocular surgery.',
    commonConditions: ['Refractive Errors', 'Dry Eye Syndrome', 'Conjunctivitis', 'Cataract']
  },
  ENT: {
    name: 'ENT',
    keywords: [
      'ear', 'nose', 'throat', 'sinus', 'sinusitis', 'earache', 'tinnitus', 
      'hearing', 'tonsil', 'sore throat', 'nasal blockage', 'sneezing', 'allergy'
    ],
    description: 'Specializes in Ear, Nose, and Throat diseases.',
    commonConditions: ['Chronic Sinusitis', 'Otitis Media', 'Allergic Rhinitis', 'Tonsillitis']
  },
  Psychiatry: {
    name: 'Psychiatry',
    keywords: [
      'anxiety', 'depression', 'stress', 'insomnia', 'sleep disorder', 'panic attack', 
      'mood swing', 'mental health', 'adhd', 'bipolar', 'counseling', 'burnout'
    ],
    description: 'Specializes in mental health, emotional wellness, and behavioral disorders.',
    commonConditions: ['Generalized Anxiety', 'Depressive Episode', 'Sleep Disturbance', 'Chronic Stress']
  },
  Gynecology: {
    name: 'Gynecology',
    keywords: [
      'period', 'menstrual', 'pregnancy', 'pcos', 'pcod', 'cramps', 'fertility', 
      'pelvic', 'women health', 'menopause', 'vaginal infection', 'hormonal imbalance'
    ],
    description: 'Specializes in female reproductive health and maternity care.',
    commonConditions: ['PCOS/PCOD', 'Dysmenorrhea', 'Pregnancy Checkups', 'Hormone Fluctuations']
  },
  Endocrinology: {
    name: 'Endocrinology',
    primaryDepartment: 'General Medicine',
    keywords: [
      'diabetes', 'thyroid', 'hormone', 'blood sugar', 'hba1c', 'tsh', 'insulin',
      'hypothyroid', 'hyperthyroid', 'glucose', 'metabolism', 'endocrine'
    ],
    description: 'Specializes in hormonal and metabolic disorders including diabetes and thyroid conditions.',
    commonConditions: ['Type 2 Diabetes', 'Hypothyroidism', 'Hyperthyroidism', 'Metabolic Syndrome']
  },
  Nephrology: {
    name: 'Nephrology',
    primaryDepartment: 'General Medicine',
    keywords: [
      'kidney', 'creatinine', 'urea', 'bun', 'renal', 'filtration', 'egfr',
      'proteinuria', 'urine protein', 'dialysis', 'kidney stone'
    ],
    description: 'Specializes in kidney function, filtration, and renal disorders.',
    commonConditions: ['Chronic Kidney Disease', 'Renal Impairment', 'Proteinuria', 'Electrolyte Imbalance']
  },
  Hematology: {
    name: 'Hematology',
    primaryDepartment: 'General Medicine',
    keywords: [
      'blood', 'hemoglobin', 'anemia', 'platelet', 'thrombocytopenia', 'rbc',
      'wbc', 'iron deficiency', 'bleeding', 'clotting', 'ferritin'
    ],
    description: 'Specializes in disorders of the blood and blood-forming tissues.',
    commonConditions: ['Iron Deficiency Anemia', 'Thrombocytopenia', 'Leukopenia', 'Blood Dyscrasia']
  }
};

/**
 * Emergency Red-Flag Keywords
 * If any of these are present, prioritize emergency redirection immediately.
 */
export const EMERGENCY_FLAGS = [
  'chest pain and breathlessness',
  'difficulty breathing',
  'loss of consciousness',
  'sudden severe chest pain',
  'slurred speech',
  'facial drooping',
  'paralysis of one side',
  'coughing blood',
  'severe burn',
  'suicide',
  'kill myself',
  'unconscious',
  'severe bleeding',
  'overdose'
];
