/**
 * Medical Report Summarizer Service
 * Extracts laboratory report parameters, highlights out-of-range values in simple English,
 * explains medical terms, and strictly enforces clinical disclaimers without diagnosing.
 */

export const MEDICAL_REFERENCE_RANGES = {
  hemoglobin: { min: 12.0, max: 17.5, unit: 'g/dL', desc: 'Protein in red blood cells that carries oxygen' },
  wbc: { min: 4000, max: 11000, unit: '/mcL', desc: 'White blood cells that fight infections' },
  platelets: { min: 150000, max: 450000, unit: '/mcL', desc: 'Blood cells that assist in blood clotting' },
  fasting_glucose: { min: 70, max: 100, unit: 'mg/dL', desc: 'Blood sugar level after fasting' },
  hba1c: { min: 4.0, max: 5.6, unit: '%', desc: 'Average blood sugar over the last 3 months' },
  total_cholesterol: { min: 125, max: 200, unit: 'mg/dL', desc: 'Total blood lipid / fat level' },
  hdl: { min: 40, max: 60, unit: 'mg/dL', desc: 'Good cholesterol (protects heart vessels)' },
  ldl: { min: 0, max: 100, unit: 'mg/dL', desc: 'Bad cholesterol (can build up in arteries)' },
  triglycerides: { min: 0, max: 150, unit: 'mg/dL', desc: 'Type of fat found in your blood' },
  tsh: { min: 0.4, max: 4.0, unit: 'mIU/L', desc: 'Thyroid stimulating hormone' },
  creatinine: { min: 0.6, max: 1.2, unit: 'mg/dL', desc: 'Kidney function filtration marker' },
  uric_acid: { min: 3.5, max: 7.2, unit: 'mg/dL', desc: 'Waste product from food metabolism' }
};

export const summarizeMedicalReport = (rawText) => {
  if (!rawText || rawText.trim().length === 0) {
    return {
      error: 'Please provide the text or lab values of the medical report.'
    };
  }

  const textLower = rawText.toLowerCase();
  let detectedType = 'General Diagnostic Report';
  if (textLower.includes('cbc') || textLower.includes('hemoglobin') || textLower.includes('platelet')) {
    detectedType = 'Complete Blood Count (CBC) Panel';
  } else if (textLower.includes('lipid') || textLower.includes('cholesterol') || textLower.includes('triglyceride')) {
    detectedType = 'Lipid / Cholesterol Profile';
  } else if (textLower.includes('glucose') || textLower.includes('hba1c') || textLower.includes('diabetes')) {
    detectedType = 'Blood Glucose & Diabetic Panel';
  } else if (textLower.includes('thyroid') || textLower.includes('tsh') || textLower.includes('t3') || textLower.includes('t4')) {
    detectedType = 'Thyroid Function Test';
  } else if (textLower.includes('creatinine') || textLower.includes('urea') || textLower.includes('kidney')) {
    detectedType = 'Renal / Kidney Function Test';
  }

  const extractedMetrics = [];
  const abnormalFindings = [];

  // Parse common biomarkers
  const patterns = [
    { key: 'hemoglobin', regex: /(?:hemoglobin|hb)\s*[:=]?\s*([0-9.]+)/i },
    { key: 'wbc', regex: /(?:wbc|white blood cells?|leukocytes)\s*[:=]?\s*([0-9,]+)/i },
    { key: 'platelets', regex: /(?:platelets?|plt)\s*[:=]?\s*([0-9,]+)/i },
    { key: 'fasting_glucose', regex: /(?:fasting glucose|fasting sugar|fbs)\s*[:=]?\s*([0-9.]+)/i },
    { key: 'hba1c', regex: /(?:hba1c|glycated hemoglobin)\s*[:=]?\s*([0-9.]+)/i },
    { key: 'total_cholesterol', regex: /(?:total cholesterol|cholesterol total)\s*[:=]?\s*([0-9.]+)/i },
    { key: 'ldl', regex: /(?:ldl|bad cholesterol)\s*[:=]?\s*([0-9.]+)/i },
    { key: 'hdl', regex: /(?:hdl|good cholesterol)\s*[:=]?\s*([0-9.]+)/i },
    { key: 'triglycerides', regex: /(?:triglycerides?)\s*[:=]?\s*([0-9.]+)/i },
    { key: 'tsh', regex: /(?:tsh|thyroid stimulating hormone)\s*[:=]?\s*([0-9.]+)/i },
    { key: 'creatinine', regex: /(?:creatinine|serum creatinine)\s*[:=]?\s*([0-9.]+)/i }
  ];

  for (const p of patterns) {
    const match = rawText.match(p.regex);
    if (match && match[1]) {
      const numVal = parseFloat(match[1].replace(/,/g, ''));
      const ref = MEDICAL_REFERENCE_RANGES[p.key];
      if (ref && !isNaN(numVal)) {
        let status = 'Normal';
        if (numVal < ref.min) status = 'Below Normal Range';
        if (numVal > ref.max) status = 'Above Normal Range';

        const item = {
          name: p.key.toUpperCase().replace(/_/g, ' '),
          value: `${numVal} ${ref.unit}`,
          referenceRange: `${ref.min} - ${ref.max} ${ref.unit}`,
          status,
          explanation: ref.desc
        };
        extractedMetrics.push(item);

        if (status !== 'Normal') {
          abnormalFindings.push(item);
        }
      }
    }
  }

  // Generate plain English explanation
  let plainSummary = `This report appears to be a **${detectedType}**. `;
  if (extractedMetrics.length > 0) {
    plainSummary += `We identified ${extractedMetrics.length} laboratory test parameter(s). `;
    if (abnormalFindings.length > 0) {
      plainSummary += `${abnormalFindings.length} parameter(s) are outside the typical reference range. `;
    } else {
      plainSummary += `All detected parameters fall within standard laboratory ranges. `;
    }
  } else {
    plainSummary += `We extracted general diagnostic notes. Please share this report with your consulting physician for a comprehensive clinical review.`;
  }

  return {
    reportType: detectedType,
    summary: plainSummary,
    metricsFound: extractedMetrics,
    abnormalFindings,
    safetyDisclaimer: 'Important Notice: This AI-generated summary is for informational purposes only and does not constitute a medical diagnosis or treatment recommendation. Please consult a qualified healthcare professional for medical interpretation.'
  };
};
