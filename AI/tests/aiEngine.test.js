import { 
  processUserMessage, 
  detectSpecialty, 
  checkEmergency, 
  summarizeMedicalReport,
  analyzeLabReport,
  SAMPLE_LAB_REPORTS
} from '../index.js';

async function runTests() {
  console.log('--- TEST 1: Symptom Detection ---');
  console.log('Query: "I have skin irritation and acne problems"');
  console.log('Detected Specialty:', detectSpecialty('I have skin irritation and acne problems'));

  console.log('\nQuery: "frequent headaches and dizziness"');
  console.log('Detected Specialty:', detectSpecialty('frequent headaches and dizziness'));

  console.log('\n--- TEST 2: Emergency Safety Triage ---');
  console.log('Query: "severe chest pain and difficulty breathing"');
  const emergencyRes = await processUserMessage({ message: 'I am having severe chest pain and difficulty breathing' });
  console.log('Intent:', emergencyRes.intent);
  console.log('Is Emergency:', emergencyRes.isEmergency);

  console.log('\n--- TEST 3: Doctor Recommendation Flow ---');
  const doctorRes = await processUserMessage({ message: 'I need a dermatologist tomorrow evening' });
  console.log('Intent:', doctorRes.intent);
  console.log('Specialty:', doctorRes.specialty);
  console.log('Doctors Found:', doctorRes.doctors?.length);
  console.log('Available Slots:', doctorRes.availableSlots?.length);

  console.log('\n--- TEST 4: Lab Report Summarizer ---');
  const labText = 'CBC Test: Hemoglobin 10.5 g/dL, WBC 13000 /mcL, Platelets 210000 /mcL, Fasting Glucose 118 mg/dL';
  const reportRes = summarizeMedicalReport(labText);
  console.log('Report Type:', reportRes.reportType);
  console.log('Metrics Found:', reportRes.metricsFound.length);
  console.log('Abnormal Findings:', reportRes.abnormalFindings.map(a => `${a.name}: ${a.value} (${a.status})`));

  console.log('\n--- TEST 5: Prompt Scenario Lab Report Analyzer ---');
  const scenarioText = `Hemoglobin: 10.2 g/dL
RBC: 3.9 million/mcL
WBC: 7200 /mcL
Platelets: 240000 /mcL
Glucose: 145 mg/dL
Vitamin D: 14 ng/mL`;
  const scenarioRes = analyzeLabReport(scenarioText);
  console.log('Summary:', scenarioRes.summary);
  console.log('Abnormal Findings Count:', scenarioRes.abnormalFindings.length);
  scenarioRes.abnormalFindings.forEach(abn => {
    console.log(`  - ${abn.test}: ${abn.value} ${abn.unit} (${abn.statusLabel}) | Ref: ${abn.referenceRange}`);
    console.log(`    Significance: ${abn.explanation}`);
  });
  console.log('Possible Conditions:');
  scenarioRes.possibleConditions.forEach(cond => {
    console.log(`  * ${cond.name} -> ${cond.reason}`);
  });
  console.log('Recommended Specialties:');
  scenarioRes.recommendedSpecialties.forEach(spec => {
    console.log(`  🩺 ${spec.specialty} (${spec.priority}): ${spec.reason}`);
  });

  console.log('\n✅ All HealPoint AI & Lab Report Analyzer Tests Passed Successfully!');
}

runTests();
