/**
 * Automated End-to-End Verification Pipeline Test
 */

const { extractInsuranceFields } = require('../dist/services/extractionService');
const { runVerificationEngine } = require('../dist/services/verificationEngine');
const { getSavedModelMetrics, computeMlAnomalyScore } = require('../dist/services/mlAnomalyDetector');
const { SAMPLE_TEST_DOCUMENTS } = require('../dist/routes/verify');

console.log('=======================================================');
console.log(' RUNNING END-TO-END VERIFICATION PIPELINE TESTS');
console.log('=======================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, name, details = '') {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${name}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${name} -> ${details}`);
  }
}

// 1. Consistent Document Test
const sample1 = SAMPLE_TEST_DOCUMENTS[0];
const ext1 = extractInsuranceFields(sample1.content);
const res1 = runVerificationEngine(ext1);

assert(ext1.policy_number.value === 'POL-2026-0001', 'Extracts Policy Number (POL-2026-0001)', ext1.policy_number.value);
assert(ext1.coverage_inr.value === 2500000, 'Extracts Sum Insured (₹2,500,000)', ext1.coverage_inr.value);
assert(ext1.premium_inr.value === 60000, 'Extracts Premium (₹60,000)', ext1.premium_inr.value);
assert(res1.status === 'CONSISTENT', 'Consistent document receives CONSISTENT status', res1.status);
assert(res1.detectedIssues.length === 0, 'Consistent document has 0 issues', res1.detectedIssues.length);
assert(res1.anomalyScore < 0.20, `Consistent anomaly score is low (${res1.anomalyScore})`, res1.anomalyScore);

// 2. Date Inversion Test
const sample2 = SAMPLE_TEST_DOCUMENTS[1];
const ext2 = extractInsuranceFields(sample2.content);
const res2 = runVerificationEngine(ext2);

assert(ext2.effective_date.value === '2026-03-01', 'Extracts Effective Date (2026-03-01)', ext2.effective_date.value);
assert(ext2.expiry_date.value === '2025-12-15', 'Extracts Expiry Date (2025-12-15)', ext2.expiry_date.value);
assert(res2.status === 'NEEDS_REVIEW', 'Inverted date policy receives NEEDS_REVIEW status', res2.status);
assert(res2.detectedIssues.some(i => i.id === 'issue-date-reversed'), 'Flags chronological date inconsistency issue');
assert(res2.anomalyScore >= 0.35, `Reversed date has elevated anomaly score (${res2.anomalyScore})`, res2.anomalyScore);

// 3. Premium Math Mismatch Test
const sample3 = SAMPLE_TEST_DOCUMENTS[2];
const ext3 = extractInsuranceFields(sample3.content);
const res3 = runVerificationEngine(ext3);

assert(ext3.coverage_inr.value === 1500000, 'Extracts Coverage (₹1,500,000)', ext3.coverage_inr.value);
assert(ext3.premium_inr.value === 145000, 'Extracts Premium (₹145,000)', ext3.premium_inr.value);
assert(ext3.premium_rate_percent.value === 3.0, 'Extracts Rate (3.0%)', ext3.premium_rate_percent.value);
assert(res3.status === 'NEEDS_REVIEW', 'Premium mismatch receives NEEDS_REVIEW status', res3.status);
const mathIssue = res3.detectedIssues.find(i => i.id === 'issue-premium-mismatch');
assert(Boolean(mathIssue), 'Flags Premium Calculation Mismatch issue');
assert(Boolean(mathIssue && mathIssue.calculationFormula), `Provides exact formula: ${mathIssue?.calculationFormula}`);

// 4. Missing Mandatory Field / Format Error Test
const sample4 = SAMPLE_TEST_DOCUMENTS[3];
const ext4 = extractInsuranceFields(sample4.content);
const res4 = runVerificationEngine(ext4);

assert(res4.status === 'NEEDS_REVIEW', 'Missing holder policy receives NEEDS_REVIEW status', res4.status);
assert(res4.detectedIssues.some(i => i.category === 'Completeness'), 'Flags missing mandatory field completeness issue');

// 5. Genuine Model Metrics Evaluation Test
const metrics = getSavedModelMetrics();
assert(metrics.test_metrics.accuracy > 0.85, `Model test accuracy is high (${(metrics.test_metrics.accuracy * 100).toFixed(1)}%)`, metrics.test_metrics.accuracy);
assert(metrics.test_metrics.precision === 1.0, `Model precision is 100% (Zero false positives on test set)`, metrics.test_metrics.precision);
assert(metrics.dataset_split.test_samples === 110, 'Test split contains 110 evaluated held-out samples', metrics.dataset_split.test_samples);
assert(metrics.dataset_split.train_samples === 520, 'Train split contains 520 samples', metrics.dataset_split.train_samples);

console.log('\n=======================================================');
console.log(` RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('=======================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
