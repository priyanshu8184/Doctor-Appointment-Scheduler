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
