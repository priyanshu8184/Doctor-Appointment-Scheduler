/**
 * HealPoint AI - Intelligent Lab Report Analysis Engine
 * Extracts structured biomarker parameters from medical reports, evaluates reference ranges,
 * identifies abnormal findings, explains clinical significance in patient-friendly terms,
 * suggests potential health conditions for discussion, and recommends medical specialties.
 */

import { MEDICAL_TAXONOMY } from '../knowledge/medicalTaxonomy.js';
import { COMPREHENSIVE_BIOMARKERS, EXTRACTION_RULES } from '../knowledge/biomarkersKnowledgeBase.js';
import { SAMPLE_LAB_REPORTS } from '../knowledge/sampleLabReports.js';

// Re-export for backward compatibility
export { COMPREHENSIVE_BIOMARKERS, EXTRACTION_RULES, SAMPLE_LAB_REPORTS };

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
