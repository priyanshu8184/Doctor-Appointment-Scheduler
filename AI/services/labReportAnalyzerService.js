/**
 * HealPoint AI - Intelligent Lab Report Analysis Engine
 * Extracts structured biomarker parameters from medical reports, evaluates reference ranges,
 * identifies abnormal findings, explains clinical significance in patient-friendly terms,
 * suggests potential health conditions for discussion, and recommends medical specialties.
 * 
 * Complies with strict medical safety standards:
 * - Clear distinction: AI observation ≠ medical diagnosis
 * - Uses cautious language: "may indicate", "can be associated with", "possible condition to discuss"
 * - Emergency detection for critical laboratory values
 * - Uses printed report reference ranges whenever detected, falling back to clinical standards
 */

import { MEDICAL_TAXONOMY } from '../knowledge/medicalTaxonomy.js';

/**
 * Standard Clinical Reference Ranges and Biomarker Knowledge Base
 */
export const COMPREHENSIVE_BIOMARKERS = {
  // --- CBC (Complete Blood Count) ---
  hemoglobin: {
    canonicalName: 'Hemoglobin (Hb)',
    category: 'Complete Blood Count (CBC)',
    min: 13.0,
    max: 17.5,
    unit: 'g/dL',
    description: 'Oxygen-carrying protein in red blood cells.',
    lowSignificance: 'A low hemoglobin value can be associated with conditions such as anemia, nutritional iron deficiency, blood loss, or chronic illness. The exact cause cannot be determined from this value alone.',
    highSignificance: 'Elevated hemoglobin may occur with dehydration, chronic hypoxia, high altitude adaptation, or bone marrow conditions.',
    possibleConditionsLow: ['Anemia', 'Iron Deficiency', 'Nutritional Deficiency'],
    possibleConditionsHigh: ['Polycythemia', 'Dehydration'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine',
    criticalLow: 7.0,
    criticalHigh: 20.0
  },
  rbc: {
    canonicalName: 'Red Blood Cell Count (RBC)',
    category: 'Complete Blood Count (CBC)',
    min: 4.5,
    max: 5.9,
    unit: 'million/mcL',
    description: 'Total count of red blood cells delivering oxygen to body tissues.',
    lowSignificance: 'Decreased RBC count is often observed in anemia or impaired red cell production.',
    highSignificance: 'Elevated RBC count can be related to low oxygen states, dehydration, or erythrocyte overproduction.',
    possibleConditionsLow: ['Anemia', 'Bone Marrow Suppression'],
    possibleConditionsHigh: ['Erythrocytosis', 'Hypoxia'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine',
    criticalLow: 2.5,
    criticalHigh: 7.5
  },
  wbc: {
    canonicalName: 'White Blood Cell Count (WBC / Leukocytes)',
    category: 'Complete Blood Count (CBC)',
    min: 4000,
    max: 11000,
    unit: '/mcL',
    description: 'Immune cells responsible for combating infections and inflammation.',
    lowSignificance: 'Low WBC count (leukopenia) may suggest viral infections, autoimmune conditions, or medication effects affecting immunity.',
    highSignificance: 'Elevated WBC count (leukocytosis) frequently indicates an active immune response to bacterial infection, systemic inflammation, or physical stress.',
    possibleConditionsLow: ['Leukopenia / Weakened Immune Response', 'Viral Infection'],
    possibleConditionsHigh: ['Bacterial Infection', 'Inflammatory Response'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine',
    criticalLow: 2000,
    criticalHigh: 30000
  },
  platelets: {
    canonicalName: 'Platelet Count',
    category: 'Complete Blood Count (CBC)',
    min: 150000,
    max: 450000,
    unit: '/mcL',
    description: 'Crucial cellular components responsible for blood clotting and wound healing.',
    lowSignificance: 'Low platelet count (thrombocytopenia) can increase bleeding tendency or bruising risk and requires medical evaluation.',
    highSignificance: 'High platelet count (thrombocytosis) may occur in response to reactive inflammation, infection, or clonal blood conditions.',
    possibleConditionsLow: ['Thrombocytopenia', 'Increased Bleeding Tendency'],
    possibleConditionsHigh: ['Reactive Thrombocytosis', 'Inflammatory State'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine',
    criticalLow: 50000,
    criticalHigh: 1000000
  },
  hematocrit: {
    canonicalName: 'Hematocrit (PCV)',
    category: 'Complete Blood Count (CBC)',
    min: 38.0,
    max: 50.0,
    unit: '%',
    description: 'Proportion of red blood cells in the total blood volume.',
    lowSignificance: 'Low hematocrit mirrors low red cell mass, often seen alongside low hemoglobin in anemia.',
    highSignificance: 'High hematocrit indicates hemoconcentration (e.g. dehydration) or excess red cell mass.',
    possibleConditionsLow: ['Anemia', 'Fluid Overload'],
    possibleConditionsHigh: ['Dehydration', 'Polycythemia'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine'
  },

  // --- Blood Sugar / Diabetes Panel ---
  fasting_glucose: {
    canonicalName: 'Fasting Blood Glucose',
    category: 'Blood Glucose & Diabetes Panel',
    min: 70,
    max: 99,
    unit: 'mg/dL',
    description: 'Blood sugar level measured after an overnight fast (minimum 8 hours).',
    lowSignificance: 'Low fasting glucose (hypoglycemia) can cause dizziness, shakiness, or weakness, often related to medication timing or prolonged fasting.',
    highSignificance: 'Elevated glucose can be associated with impaired blood sugar regulation. The interpretation depends on factors such as whether the test was fasting and the patient\'s clinical history.',
    possibleConditionsLow: ['Hypoglycemia'],
    possibleConditionsHigh: ['Impaired Fasting Glucose', 'Prediabetes', 'Diabetes Mellitus'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine',
    criticalLow: 50,
    criticalHigh: 350
  },
  random_glucose: {
    canonicalName: 'Random / Postprandial Blood Glucose',
    category: 'Blood Glucose & Diabetes Panel',
    min: 70,
    max: 140,
    unit: 'mg/dL',
    description: 'Blood sugar level measured regardless of the time since last meal.',
    lowSignificance: 'Low random glucose suggests possible hypoglycemia requiring clinical evaluation.',
    highSignificance: 'Elevated random glucose indicates post-meal glycemic spikes or impaired carbohydrate metabolism.',
    possibleConditionsLow: ['Hypoglycemia'],
    possibleConditionsHigh: ['Glucose Intolerance', 'Diabetes Mellitus'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine',
    criticalLow: 50,
    criticalHigh: 400
  },
  hba1c: {
    canonicalName: 'HbA1c (Glycated Hemoglobin)',
    category: 'Blood Glucose & Diabetes Panel',
    min: 4.0,
    max: 5.6,
    unit: '%',
    description: 'Estimates average blood glucose control over the preceding 2 to 3 months.',
    lowSignificance: 'Unusually low HbA1c may occasionally reflect shortened red cell survival or recent hemolytic episodes.',
    highSignificance: 'HbA1c between 5.7% and 6.4% suggests prediabetes, while 6.5% or above indicates chronic hyperglycemia and should be discussed with a doctor.',
    possibleConditionsLow: ['Hemolytic Anemia Indicator (Infrequent)'],
    possibleConditionsHigh: ['Prediabetes', 'Type 2 Diabetes Mellitus', 'Glycemic Dysregulation'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine'
  },

  // --- Lipid / Cholesterol Profile ---
  total_cholesterol: {
    canonicalName: 'Total Cholesterol',
    category: 'Lipid Profile',
    min: 125,
    max: 200,
    unit: 'mg/dL',
    description: 'Overall measure of cholesterol circulating in the blood.',
    lowSignificance: 'Markedly low total cholesterol may occasionally accompany severe malabsorption or malnutrition.',
    highSignificance: 'Elevated total cholesterol is a recognized cardiovascular risk factor and may warrant lifestyle modifications or medical review.',
    possibleConditionsLow: ['Malnutrition / Malabsorption (Rare)'],
    possibleConditionsHigh: ['Hypercholesterolemia', 'Cardiovascular Risk Factor'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'Cardiology'
  },
  ldl: {
    canonicalName: 'LDL Cholesterol ("Bad" Cholesterol)',
    category: 'Lipid Profile',
    min: 0,
    max: 100,
    unit: 'mg/dL',
    description: 'Low-density lipoprotein that can deposit in arterial walls.',
    lowSignificance: 'Low LDL is generally favorable for cardiovascular health.',
    highSignificance: 'Elevated LDL is associated with increased plaque formation in arteries and cardiovascular risk.',
    possibleConditionsLow: ['Optimal Lipid State'],
    possibleConditionsHigh: ['Atherosclerosis Risk', 'Dyslipidemia'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'Cardiology'
  },
  hdl: {
    canonicalName: 'HDL Cholesterol ("Good" Cholesterol)',
    category: 'Lipid Profile',
    min: 40,
    max: 60,
    unit: 'mg/dL',
    description: 'High-density lipoprotein that helps clear excess cholesterol from blood vessels.',
    lowSignificance: 'Low HDL cholesterol reduces protective vessel clearance and is considered a cardiovascular risk factor.',
    highSignificance: 'Higher HDL levels are generally protective for heart and blood vessels.',
    possibleConditionsLow: ['Reduced Cardiovascular Protection', 'Metabolic Syndrome Risk'],
    possibleConditionsHigh: ['Cardioprotective Profile'],
    specialtyLow: 'Cardiology',
    specialtyHigh: 'General Medicine'
  },
  triglycerides: {
    canonicalName: 'Triglycerides',
    category: 'Lipid Profile',
    min: 0,
    max: 150,
    unit: 'mg/dL',
    description: 'Form of fat stored in fat cells and used for energy between meals.',
    lowSignificance: 'Low triglyceride levels are typically benign.',
    highSignificance: 'Elevated triglycerides are associated with metabolic syndrome, insulin resistance, or lifestyle factors.',
    possibleConditionsLow: ['Normal / Low Lipids'],
    possibleConditionsHigh: ['Hypertriglyceridemia', 'Metabolic Risk Factor'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'Cardiology',
    criticalHigh: 500
  },

  // --- Thyroid Profile ---
  tsh: {
    canonicalName: 'Thyroid Stimulating Hormone (TSH)',
    category: 'Thyroid Function Test',
    min: 0.4,
    max: 4.5,
    unit: 'mIU/L',
    description: 'Pituitary hormone regulating the thyroid gland activity.',
    lowSignificance: 'Suppressed TSH often suggests that the thyroid gland is overactive (hyperthyroidism).',
    highSignificance: 'Elevated TSH frequently indicates an underactive thyroid gland (hypothyroidism), which can lead to fatigue, weight gain, or cold sensitivity.',
    possibleConditionsLow: ['Possible Hyperthyroidism / Overactive Thyroid'],
    possibleConditionsHigh: ['Possible Hypothyroidism / Underactive Thyroid'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine',
    criticalLow: 0.05,
    criticalHigh: 20.0
  },
  t3: {
    canonicalName: 'Triiodothyronine (Total/Free T3)',
    category: 'Thyroid Function Test',
    min: 0.8,
    max: 2.0,
    unit: 'ng/mL',
    description: 'Active circulating thyroid hormone controlling metabolic rate.',
    lowSignificance: 'Low T3 can indicate thyroid hypofunction or euthyroid sick state during systemic illness.',
    highSignificance: 'Elevated T3 can be seen in toxic thyroid conditions or hyperthyroidism.',
    possibleConditionsLow: ['Hypothyroidism'],
    possibleConditionsHigh: ['Hyperthyroidism', 'Thyrotoxicosis'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine'
  },
  t4: {
    canonicalName: 'Thyroxine (Total/Free T4)',
    category: 'Thyroid Function Test',
    min: 4.5,
    max: 12.0,
    unit: 'mcg/dL',
    description: 'Primary prohormone synthesized by the thyroid gland.',
    lowSignificance: 'Low T4 supports a diagnosis of thyroid underactivity (hypothyroidism).',
    highSignificance: 'High T4 is consistent with excess thyroid hormone production.',
    possibleConditionsLow: ['Hypothyroidism'],
    possibleConditionsHigh: ['Hyperthyroidism'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine'
  },

  // --- Kidney Function / Renal Panel (KFT) ---
  creatinine: {
    canonicalName: 'Serum Creatinine',
    category: 'Kidney Function Test (KFT)',
    min: 0.6,
    max: 1.2,
    unit: 'mg/dL',
    description: 'Waste product of muscle breakdown filtered out exclusively by kidneys.',
    lowSignificance: 'Low creatinine is generally due to lower muscle mass and rarely represents kidney pathology.',
    highSignificance: 'Elevated creatinine suggests decreased kidney filtration capacity and warrants medical investigation.',
    possibleConditionsLow: ['Low Muscle Mass'],
    possibleConditionsHigh: ['Impaired Renal Function', 'Kidney Strain', 'Dehydration'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine',
    criticalHigh: 4.0
  },
  blood_urea: {
    canonicalName: 'Blood Urea Nitrogen (BUN) / Urea',
    category: 'Kidney Function Test (KFT)',
    min: 7,
    max: 20,
    unit: 'mg/dL',
    description: 'Nitrogenous waste product synthesized by the liver from protein breakdown.',
    lowSignificance: 'Low BUN can occur in low protein diets or pregnancy.',
    highSignificance: 'Elevated BUN indicates reduced kidney clearance, high protein intake, or dehydration.',
    possibleConditionsLow: ['Low Protein Diet'],
    possibleConditionsHigh: ['Renal Clearance Impairment', 'Dehydration'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine'
  },
  uric_acid: {
    canonicalName: 'Uric Acid',
    category: 'Kidney & Metabolic Panel',
    min: 3.5,
    max: 7.2,
    unit: 'mg/dL',
    description: 'Waste product formed when the body metabolizes purines.',
    lowSignificance: 'Low uric acid levels are uncommon and rarely clinically concerning.',
    highSignificance: 'Elevated uric acid (hyperuricemia) can be associated with joint inflammation, gout attacks, or kidney stones.',
    possibleConditionsLow: ['Hypouricemia (Uncommon)'],
    possibleConditionsHigh: ['Hyperuricemia', 'Gout Risk', 'Joint Inflammation Risk'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'Orthopedics'
  },

  // --- Liver Function Test (LFT) ---
  sgpt_alt: {
    canonicalName: 'SGPT / ALT (Alanine Aminotransferase)',
    category: 'Liver Function Test (LFT)',
    min: 7,
    max: 45,
    unit: 'U/L',
    description: 'Enzyme found predominantly in liver cells; key indicator of hepatic cellular injury.',
    lowSignificance: 'Low ALT values are typical and considered normal.',
    highSignificance: 'Elevated ALT may indicate liver cell inflammation, fatty liver, medication reaction, or viral hepatitis.',
    possibleConditionsLow: ['Normal Hepatic State'],
    possibleConditionsHigh: ['Fatty Liver', 'Hepatic Inflammation', 'Drug-Induced Liver Strain'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'Gastroenterology',
    criticalHigh: 300
  },
  sgot_ast: {
    canonicalName: 'SGOT / AST (Aspartate Aminotransferase)',
    category: 'Liver Function Test (LFT)',
    min: 8,
    max: 40,
    unit: 'U/L',
    description: 'Enzyme found in liver, heart muscle, and skeletal muscle cells.',
    lowSignificance: 'Low AST values are normal.',
    highSignificance: 'Elevated AST reflects cellular stress in liver or muscle tissue and should be correlated with ALT.',
    possibleConditionsLow: ['Normal State'],
    possibleConditionsHigh: ['Liver Stress', 'Muscular Stress'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'Gastroenterology',
    criticalHigh: 300
  },
  bilirubin_total: {
    canonicalName: 'Total Bilirubin',
    category: 'Liver Function Test (LFT)',
    min: 0.2,
    max: 1.2,
    unit: 'mg/dL',
    description: 'Yellow pigment formed during the standard breakdown of red blood cells.',
    lowSignificance: 'Low bilirubin is physiologically normal.',
    highSignificance: 'Elevated bilirubin can cause visible jaundice (yellowing of eyes/skin) and may suggest liver processing or biliary clearance issues.',
    possibleConditionsLow: ['Normal'],
    possibleConditionsHigh: ['Hyperbilirubinemia / Jaundice', 'Biliary Clearance Issue', 'Hemolysis'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'Gastroenterology',
    criticalHigh: 5.0
  },

  // --- Vitamins & Essential Minerals ---
  vitamin_d: {
    canonicalName: 'Vitamin D (25-OH)',
    category: 'Vitamins & Minerals',
    min: 30.0,
    max: 100.0,
    unit: 'ng/mL',
    description: 'Fat-soluble vitamin essential for calcium absorption, bone strength, and immune balance.',
    lowSignificance: 'This result may indicate low vitamin D levels and should be discussed with a healthcare professional regarding dietary intake or safe supplementation.',
    highSignificance: 'Excessively elevated vitamin D may occur with over-supplementation.',
    possibleConditionsLow: ['Vitamin D Deficiency', 'Bone Density Concern', 'Fatigue Susceptibility'],
    possibleConditionsHigh: ['Vitamin D Hypervitaminosis'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine',
    criticalLow: 10.0
  },
  vitamin_b12: {
    canonicalName: 'Vitamin B12 (Cobalamin)',
    category: 'Vitamins & Minerals',
    min: 200,
    max: 900,
    unit: 'pg/mL',
    description: 'Water-soluble vitamin essential for nerve function and red blood cell generation.',
    lowSignificance: 'Low vitamin B12 levels may cause fatigue, memory issues, or peripheral tingling/numbness, and warrants doctor consultation.',
    highSignificance: 'Elevated B12 is often observed with recent supplementation.',
    possibleConditionsLow: ['Vitamin B12 Deficiency', 'Peripheral Neuropathy Risk', 'Megaloblastic Anemia Indicator'],
    possibleConditionsHigh: ['Post-Supplementation State'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine'
  },
  calcium: {
    canonicalName: 'Serum Calcium',
    category: 'Vitamins & Minerals',
    min: 8.5,
    max: 10.5,
    unit: 'mg/dL',
    description: 'Mineral essential for bone density, nerve signaling, and muscle contraction.',
    lowSignificance: 'Low calcium (hypocalcemia) can cause muscle cramps or tingling sensations.',
    highSignificance: 'Elevated calcium (hypercalcemia) can be associated with parathyroid or bone metabolic conditions.',
    possibleConditionsLow: ['Hypocalcemia', 'Calcium Deficiency'],
    possibleConditionsHigh: ['Hypercalcemia', 'Parathyroid Evaluation Needed'],
    specialtyLow: 'General Medicine',
    specialtyHigh: 'General Medicine'
  }
};

/**
 * Biomarker Extraction Regex Patterns
 * Parses test name, numerical value, unit, and optional custom printed reference range
 */
const EXTRACTION_RULES = [
  {
    key: 'hemoglobin',
    regex: /(?:hemoglobin|haemoglobin|\bhb\b)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(g\/dl|gm\/dl|g\/l))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'rbc',
    regex: /(?:rbc count|red blood cells?|total rbc|\brbc\b)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mil\/mcl|million\/mcl|10\^6\/ul|10\^6\/mcl))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'wbc',
    regex: /(?:wbc count|white blood cells?|total wbc|total leukocyte count|\btlc\b|\bwbc\b)(?:[\s:]+|[-=]+)([0-9,]+(?:\.[0-9]+)?)(?:\s*(\/mcl|\/cumm|\/ul|k\/ul))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9,.]+\s*-\s*[0-9,.]+))?/i
  },
  {
    key: 'platelets',
    regex: /(?:platelet count|total platelets?|\bplt\b)(?:[\s:]+|[-=]+)([0-9,]+(?:\.[0-9]+)?)(?:\s*(\/mcl|\/cumm|\/ul|lakhs?\/cumm|k\/ul))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9,.]+\s*-\s*[0-9,.]+))?/i
  },
  {
    key: 'hematocrit',
    regex: /(?:hematocrit|haematocrit|\bpcv\b)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(%))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'fasting_glucose',
    regex: /(?:fasting blood sugar|fasting glucose|fasting blood glucose|\bfbs\b|\bglucose\b)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mg\/dl|mmol\/l))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'random_glucose',
    regex: /(?:random blood sugar|random glucose|post prandial blood sugar|\brbs\b|\bppbs\b)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mg\/dl|mmol\/l))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'hba1c',
    regex: /(?:hba1c|glycated hemoglobin|glycosylated hemoglobin)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(%))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'total_cholesterol',
    regex: /(?:total cholesterol|serum cholesterol|cholesterol total)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mg\/dl))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'ldl',
    regex: /(?:ldl cholesterol|ldl-c|bad cholesterol|\bldl\b)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mg\/dl))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'hdl',
    regex: /(?:hdl cholesterol|hdl-c|good cholesterol|\bhdl\b)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mg\/dl))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'triglycerides',
    regex: /(?:triglycerides|serum triglycerides|\btg\b)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mg\/dl))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'tsh',
    regex: /(?:thyroid stimulating hormone|tsh 3rd gen|\btsh\b)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(miu\/l|uiu\/ml|uIU\/ml))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 't3',
    regex: /(?:triiodothyronine|total t3|free t3|\bt3\b)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(ng\/ml|pg\/ml))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 't4',
    regex: /(?:thyroxine|total t4|free t4|\bt4\b)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mcg\/dl|ng\/dl))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'creatinine',
    regex: /(?:serum creatinine|creatinine serum|creatinine)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mg\/dl))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'blood_urea',
    regex: /(?:blood urea nitrogen|serum urea|\bbun\b|urea)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mg\/dl))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'uric_acid',
    regex: /(?:serum uric acid|uric acid)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mg\/dl))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'sgpt_alt',
    regex: /(?:sgpt|alanine aminotransferase|\balt\b|alanine transaminase)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(u\/l|iu\/l))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'sgot_ast',
    regex: /(?:sgot|aspartate aminotransferase|\bast\b)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(u\/l|iu\/l))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'bilirubin_total',
    regex: /(?:total bilirubin|bilirubin total|serum bilirubin)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mg\/dl))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'vitamin_d',
    regex: /(?:vitamin d\b|vitamin d3|25-oh vitamin d|vit d|25-hydroxy vitamin d)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(ng\/ml|nmol\/l))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'vitamin_b12',
    regex: /(?:vitamin b12|vit b12|cyanocobalamin|b12)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(pg\/ml|pmol\/l))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  },
  {
    key: 'calcium',
    regex: /(?:serum calcium|total calcium|calcium)(?:[\s:]+|[-=]+)([0-9]+(?:\.[0-9]+)?)(?:\s*(mg\/dl))?(?:[\s\w,;:]*?(?:ref|range|normal)?[:\s]*([0-9.]+\s*-\s*[0-9.]+))?/i
  }
];

/**
 * Determine Report Type / Panel Category
 */
export const identifyReportCategory = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('complete blood count') || lower.includes('cbc') || (lower.includes('hemoglobin') && lower.includes('platelet'))) {
    return 'Complete Blood Count (CBC) Panel';
  }
  if (lower.includes('lipid profile') || lower.includes('cholesterol') || lower.includes('triglyceride')) {
    return 'Lipid & Cardiovascular Risk Profile';
  }
  if (lower.includes('thyroid') || lower.includes('tsh') || (lower.includes('t3') && lower.includes('t4'))) {
    return 'Thyroid Function Panel';
  }
  if (lower.includes('liver function') || lower.includes('lft') || lower.includes('sgpt') || lower.includes('bilirubin')) {
    return 'Liver Function Test (LFT) Panel';
  }
  if (lower.includes('kidney function') || lower.includes('kft') || lower.includes('renal') || lower.includes('creatinine')) {
    return 'Kidney Function (Renal) Panel';
  }
  if (lower.includes('glucose') || lower.includes('sugar') || lower.includes('hba1c') || lower.includes('diabetes')) {
    return 'Blood Glucose & Glycemic Profile';
  }
  if (lower.includes('vitamin') || lower.includes('vit d') || lower.includes('vit b12')) {
    return 'Vitamin & Micronutrient Panel';
  }
  return 'Comprehensive Laboratory Diagnostic Report';
};

/**
 * Main Laboratory Report Analyzer
 * Accepts extracted text string from document/image/PDF and returns structured AI analysis JSON.
 */
export const analyzeLabReport = (extractedText, options = {}) => {
  if (!extractedText || typeof extractedText !== 'string' || extractedText.trim().length === 0) {
    return {
      success: false,
      error: 'No text content provided for laboratory analysis.'
    };
  }

  const rawText = extractedText;
  const reportType = identifyReportCategory(rawText);
  const findings = [];
  const abnormalFindings = [];
  const possibleConditionsMap = new Map();
  const specialtyScoreMap = new Map();
  let hasCriticalValue = false;
  const criticalItems = [];

  // Parse lines or biomarker matches
  for (const rule of EXTRACTION_RULES) {
    const match = rawText.match(rule.regex);
    if (match && match[1]) {
      const numStr = match[1].replace(/,/g, '');
      const val = parseFloat(numStr);
      const bioInfo = COMPREHENSIVE_BIOMARKERS[rule.key];

      if (bioInfo && !isNaN(val)) {
        // Parse printed reference range if captured in report
        let minRange = bioInfo.min;
        let maxRange = bioInfo.max;
        let isCustomRange = false;
        let printedRangeStr = null;

        if (match[3]) {
          const rangeMatch = match[3].match(/([0-9.]+)\s*-\s*([0-9.]+)/);
          if (rangeMatch) {
            const parsedMin = parseFloat(rangeMatch[1]);
            const parsedMax = parseFloat(rangeMatch[2]);
            if (!isNaN(parsedMin) && !isNaN(parsedMax) && parsedMax > parsedMin) {
              minRange = parsedMin;
              maxRange = parsedMax;
              isCustomRange = true;
              printedRangeStr = `${parsedMin} - ${parsedMax} ${bioInfo.unit}`;
            }
          }
        }

        const effectiveRangeStr = printedRangeStr || `${minRange} – ${maxRange} ${bioInfo.unit}`;

        // Determine Status
        let status = 'normal';
        let statusLabel = 'Normal';
        let explanation = 'Result falls within the provided reference range.';
        let isAbnormal = false;
        let isCritical = false;

        // Check critical values
        if (bioInfo.criticalLow !== undefined && val <= bioInfo.criticalLow) {
          status = 'critical_low';
          statusLabel = 'Critical Low';
          explanation = bioInfo.lowSignificance;
          isAbnormal = true;
          isCritical = true;
        } else if (bioInfo.criticalHigh !== undefined && val >= bioInfo.criticalHigh) {
          status = 'critical_high';
          statusLabel = 'Critical High';
          explanation = bioInfo.highSignificance;
          isAbnormal = true;
          isCritical = true;
        } else if (val < minRange) {
          status = 'low';
          statusLabel = 'Low';
          explanation = bioInfo.lowSignificance;
          isAbnormal = true;
        } else if (val > maxRange) {
          status = 'high';
          statusLabel = 'High';
          explanation = bioInfo.highSignificance;
          isAbnormal = true;
        }

        if (isCritical) {
          hasCriticalValue = true;
          criticalItems.push(`${bioInfo.canonicalName}: ${val} ${bioInfo.unit}`);
        }

        const findingObj = {
          key: rule.key,
          test: bioInfo.canonicalName,
          category: bioInfo.category,
          value: String(val),
          unit: bioInfo.unit,
          status,
          statusLabel,
          referenceRange: effectiveRangeStr,
          isCustomRange,
          isAbnormal,
          explanation
        };

        findings.push(findingObj);

        if (isAbnormal) {
          abnormalFindings.push(findingObj);

          // Populate conditions
          const conds = status.includes('low') ? bioInfo.possibleConditionsLow : bioInfo.possibleConditionsHigh;
          const assignedSpecialty = status.includes('low') ? bioInfo.specialtyLow : bioInfo.specialtyHigh;

          if (conds && conds.length > 0) {
            for (const c of conds) {
              if (!possibleConditionsMap.has(c)) {
                possibleConditionsMap.set(c, {
                  name: c,
                  reason: status.includes('low') 
                    ? `Your ${bioInfo.canonicalName} result is below the reference range (${val} ${bioInfo.unit} vs ${effectiveRangeStr}). ${explanation}`
                    : `Your ${bioInfo.canonicalName} result is above the reference range (${val} ${bioInfo.unit} vs ${effectiveRangeStr}). ${explanation}`,
                  confidence: 'Possible',
                  recommendedAction: 'Discuss with a qualified healthcare professional.'
                });
              }
            }
          }

          // Accumulate specialty recommendation score
          if (assignedSpecialty) {
            const curr = specialtyScoreMap.get(assignedSpecialty) || { count: 0, reasons: [] };
            curr.count += 1;
            curr.reasons.push(`${bioInfo.canonicalName} is outside normal range (${statusLabel})`);
            specialtyScoreMap.set(assignedSpecialty, curr);
          }
        }
      }
    }
  }

  // Fallback if no specific biomarkers detected from standard patterns
  if (findings.length === 0) {
    findings.push({
      key: 'general_note',
      test: 'Diagnostic Summary Observation',
      category: 'General',
      value: 'Text Processed',
      unit: '',
      status: 'normal',
      statusLabel: 'Evaluated',
      referenceRange: 'Clinical Discretion',
      isCustomRange: false,
      isAbnormal: false,
      explanation: 'General diagnostic statements were extracted from the document. No standard laboratory numerical parameters were parsed.'
    });
  }

  // Rank recommended specialties
  const recommendedSpecialties = [];
  if (specialtyScoreMap.size > 0) {
    const sortedSpecs = Array.from(specialtyScoreMap.entries()).sort((a, b) => b[1].count - a[1].count);
    for (const [spec, info] of sortedSpecs) {
      recommendedSpecialties.push({
        specialty: spec,
        reason: `Recommended based on ${info.reasons.join(', ')}.`,
        matchCount: info.count,
        priority: recommendedSpecialties.length === 0 ? 'Primary' : 'Secondary'
      });
    }
  } else {
    // Default recommendation if all normal or general
    recommendedSpecialties.push({
      specialty: 'General Medicine',
      reason: 'A General Physician can review your diagnostic test results, assess baseline wellness, and advise on preventive health.',
      matchCount: 1,
      priority: 'Primary'
    });
  }

  // Generate Overall Summary
  let summary = '';
  if (abnormalFindings.length === 0) {
    summary = `Your report (${reportType}) appears to show that all detected laboratory parameters fall within the provided reference ranges. Routine follow-up with your primary healthcare provider is recommended for personalized interpretation.`;
  } else if (abnormalFindings.length === 1) {
    summary = `Your report contains 1 parameter (${abnormalFindings[0].test}) outside the provided reference range. This finding may require discussion with a healthcare professional to determine if further evaluation is warranted.`;
  } else {
    summary = `Your report contains ${abnormalFindings.length} values that are outside the provided reference ranges (${abnormalFindings.map(a => a.test).slice(0, 3).join(', ')}${abnormalFindings.length > 3 ? ' and others' : ''}). Some findings may require discussion with a healthcare professional.`;
  }

  // Urgency determination
  let urgency = 'routine';
  let emergencyNotice = null;
  if (hasCriticalValue) {
    urgency = 'urgent';
    emergencyNotice = `⚠️ Important Notice: Some laboratory parameters (${criticalItems.join(', ')}) fall significantly outside normal limits and may require prompt medical evaluation. Please consult a qualified healthcare professional promptly. If you are experiencing acute or severe symptoms, seek immediate emergency medical care.`;
  }

  return {
    success: true,
    reportType,
    summary,
    totalParametersDetected: findings.length,
    abnormalCount: abnormalFindings.length,
    urgency,
    isEmergency: hasCriticalValue,
    emergencyNotice,
    findings,
    abnormalFindings,
    possibleConditions: Array.from(possibleConditionsMap.values()),
    recommendedSpecialties,
    primarySpecialty: recommendedSpecialties[0]?.specialty || 'General Medicine',
    safetyNotice: 'HealPoint AI provides educational laboratory report observations and doctor matching assistance. AI observations do not constitute a definitive medical diagnosis. Always consult a qualified physician for clinical advice.',
    analyzedAt: new Date().toISOString()
  };
};

/**
 * Pre-defined Sample Lab Reports for Instant Demonstration
 * Allows jury, testing, and users to demo full pipeline without requiring local PDF files
 */
export const SAMPLE_LAB_REPORTS = [
  {
    id: 'sample_cbc_sugar_vitd',
    title: 'Complete Blood Count (CBC) + Glucose + Vitamin D',
    subtitle: 'Sample abnormal panel (Low Hemoglobin, High Glucose, Low Vit D)',
    reportType: 'Complete Blood Count & Metabolic Profile',
    date: '2026-10-08',
    text: `HEALPOINT DIAGNOSTIC LABORATORIES
Patient Name: Demo Patient    Age: 32 / M    Date: 08 Oct 2026

TEST DESCRIPTION                     RESULT    UNIT      REFERENCE RANGE
-------------------------------------------------------------------------
Hemoglobin                           10.2      g/dL      13.0 - 17.5
RBC Count                            3.9       mil/mcL   4.5 - 5.9
WBC Count                            7,200     /mcL      4,000 - 11,000
Platelet Count                       240,000   /mcL      150,000 - 450,000
Hematocrit (PCV)                     34.5      %         38.0 - 50.0
Fasting Blood Glucose                145       mg/dL     70 - 99
HbA1c                                6.8       %         4.0 - 5.6
Vitamin D (25-OH)                    14        ng/mL     30.0 - 100.0
Serum Calcium                        9.2       mg/dL     8.5 - 10.5
Serum Creatinine                     0.9       mg/dL     0.6 - 1.2
-------------------------------------------------------------------------
Clinical Note: Please consult doctor for clinical correlation.`
  },
  {
    id: 'sample_lipid_cardiac',
    title: 'Lipid / Cholesterol Panel',
    subtitle: 'Sample cardiovascular risk markers (High Cholesterol, High LDL, High Triglycerides)',
    reportType: 'Lipid Profile',
    date: '2026-10-05',
    text: `HEALPOINT CARDIOVASCULAR DIAGNOSTICS
Patient Name: Demo Patient    Age: 48 / M    Date: 05 Oct 2026

TEST DESCRIPTION                     RESULT    UNIT      REFERENCE RANGE
-------------------------------------------------------------------------
Total Cholesterol                    248       mg/dL     125 - 200
LDL Cholesterol                      162       mg/dL     0 - 100
HDL Cholesterol                      36        mg/dL     40 - 60
Triglycerides                        220       mg/dL     0 - 150
Fasting Blood Glucose                108       mg/dL     70 - 99
-------------------------------------------------------------------------
Note: Elevated LDL and low HDL indicate increased atherogenic lipid profile.`
  },
  {
    id: 'sample_thyroid_panel',
    title: 'Thyroid Profile (TSH, T3, T4)',
    subtitle: 'Sample thyroid dysregulation (Elevated TSH, Low Free T4)',
    reportType: 'Thyroid Function Panel',
    date: '2026-10-02',
    text: `HEALPOINT ENDOCRINE LABS
Patient Name: Demo Patient    Age: 29 / F    Date: 02 Oct 2026

TEST DESCRIPTION                     RESULT    UNIT      REFERENCE RANGE
-------------------------------------------------------------------------
Thyroid Stimulating Hormone (TSH)    8.9       mIU/L     0.4 - 4.5
Total T3                             0.7       ng/mL     0.8 - 2.0
Total T4                             3.8       mcg/dL    4.5 - 12.0
Vitamin B12                          160       pg/mL     200 - 900
-------------------------------------------------------------------------
Impression: Elevated TSH consistent with underactive thyroid function.`
  },
  {
    id: 'sample_liver_kidney',
    title: 'Liver & Kidney Function Panel (LFT / KFT)',
    subtitle: 'Sample hepatic & renal markers (Elevated SGPT/ALT, High Uric Acid)',
    reportType: 'Hepatic & Renal Panel',
    date: '2026-09-28',
    text: `HEALPOINT CLINICAL PATHOLOGY
Patient Name: Demo Patient    Age: 44 / M    Date: 28 Sep 2026

TEST DESCRIPTION                     RESULT    UNIT      REFERENCE RANGE
-------------------------------------------------------------------------
SGPT / ALT                           78        U/L       7 - 45
SGOT / AST                           54        U/L       8 - 40
Total Bilirubin                      1.1       mg/dL     0.2 - 1.2
Serum Creatinine                     1.1       mg/dL     0.6 - 1.2
Blood Urea Nitrogen (BUN)            18        mg/dL     7 - 20
Uric Acid                            8.6       mg/dL     3.5 - 7.2
-------------------------------------------------------------------------`
  },
  {
    id: 'sample_routine_normal',
    title: 'Routine Annual Wellness Screening (Normal)',
    subtitle: 'All parameters within optimal reference intervals',
    reportType: 'Complete Health Wellness Panel',
    date: '2026-09-15',
    text: `HEALPOINT GENERAL HEALTH SCREENING
Patient Name: Demo Patient    Age: 26 / F    Date: 15 Sep 2026

TEST DESCRIPTION                     RESULT    UNIT      REFERENCE RANGE
-------------------------------------------------------------------------
Hemoglobin                           14.2      g/dL      13.0 - 17.5
WBC Count                            6,500     /mcL      4,000 - 11,000
Platelet Count                       280,000   /mcL      150,000 - 450,000
Fasting Blood Glucose                88        mg/dL     70 - 99
HbA1c                                5.1       %         4.0 - 5.6
Total Cholesterol                    175       mg/dL     125 - 200
TSH                                  2.1       mIU/L     0.4 - 4.5
Serum Creatinine                     0.8       mg/dL     0.6 - 1.2
Vitamin D (25-OH)                    45        ng/mL     30.0 - 100.0
-------------------------------------------------------------------------`
  }
];
