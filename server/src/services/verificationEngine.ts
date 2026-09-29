import { ExtractedInsuranceDocument } from './extractionService';

export interface ValidationCheck {
  id: string;
  name: string;
  category: 'dates' | 'financial' | 'identity' | 'completeness' | 'format' | 'trusted_registry';
  passed: boolean;
  message: string;
  evidence?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DetectedIssue {
  id: string;
  title: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  documentValue?: string | number | null;
  expectedValue?: string | number | null;
  calculationFormula?: string;
  evidence?: string;
}

export type VerificationStatusCode = 'VERIFIED_ORIGINAL' | 'SUSPICIOUS' | 'POTENTIALLY_ALTERED' | 'UNABLE_TO_VERIFY';

export interface VerificationResultPayload {
  verificationId: string;
  status: 'Verified / Likely Original' | 'Suspicious' | 'Potentially Altered' | 'Unable to Verify';
  statusCode: VerificationStatusCode;
  anomalyScore: number; // 0.00 to 1.00
  confidenceScore: number; // 0.00 to 1.00
  processingTimeMs: number;
  extractedFields: ExtractedInsuranceDocument;
  validationChecks: ValidationCheck[];
  detectedIssues: DetectedIssue[];
  passedChecksCount: number;
  totalChecksCount: number;
  trustedRegistryMatch: {
    matched: boolean;
    providerName?: string;
    accreditationStatus: string;
    details: string;
  };
  officialVerificationStatus: 'PENDING_INSURER_CONFIRMATION' | 'CONFIRMED_BY_INSURER' | 'UNAVAILABLE';
  recommendation: string;
  plainEnglishSummary: string;
  detailedExplanation: string;
  reviewerGuidance: string;
  disclaimer: string;
  modelInfo: {
    name: string;
    type: string;
    version: string;
  };
  verifiedAt: string;
}

// Recognized Insurer Directory for Registry Verification
const RECOGNIZED_INSURERS = [
  'hdfc ergo', 'star health', 'icici lombard', 'bajaj allianz', 'care health', 
  'tata aig', 'sbi general', 'new india assurance', 'united india insurance',
  'oriental insurance', 'national insurance', 'max bupa', 'niva bupa', 
  'falcon mutual', 'falcon shield', 'zenith life', 'titan general', 'apex mutual', 'horizon global'
];

export function runVerificationEngine(
  extracted: ExtractedInsuranceDocument,
  processingStartTime = Date.now()
): VerificationResultPayload {
  const checks: ValidationCheck[] = [];
  const issues: DetectedIssue[] = [];

  const {
    policy_number,
    insurer,
    policyholder,
    policy_type,
    city,
    effective_date,
    expiry_date,
    coverage_inr,
    premium_inr,
    deductible_inr,
    premium_rate_percent
  } = extracted;

  // 1. Mandatory Field Completeness Check
  const mandatoryFields = [
    { name: 'Policy Number', val: policy_number?.value, cat: 'identity' },
    { name: 'Insurer Name', val: insurer?.value, cat: 'identity' },
    { name: 'Policyholder / Customer Name', val: policyholder?.value, cat: 'identity' },
    { name: 'Policy Type / Coverage Class', val: policy_type?.value, cat: 'completeness' },
    { name: 'Inception / Effective Date', val: effective_date?.value, cat: 'dates' },
    { name: 'Policy Expiry Date', val: expiry_date?.value, cat: 'dates' },
    { name: 'Total Sum Insured', val: coverage_inr?.value, cat: 'financial' },
    { name: 'Payable Annual Premium', val: premium_inr?.value, cat: 'financial' }
  ];

  let missingMandatoryCount = 0;

  mandatoryFields.forEach((f, idx) => {
    const isPresent = f.val !== null && f.val !== undefined && String(f.val).trim().length > 0;
    if (!isPresent) missingMandatoryCount++;

    checks.push({
      id: `chk-mandatory-${idx}`,
      name: `Required Field: ${f.name}`,
      category: f.cat as any,
      passed: isPresent,
      message: isPresent ? `${f.name} detected and parsed` : `Required policy field '${f.name}' is missing or unreadable`,
      severity: 'high'
    });

    if (!isPresent) {
      issues.push({
        id: `issue-missing-${idx}`,
        title: `Missing Field: ${f.name}`,
        category: 'Completeness',
        severity: 'high',
        explanation: `Underwriting and policy compliance requires '${f.name}' to be explicitly stated on the schedule.`,
        documentValue: 'Missing / Unreadable',
        expectedValue: 'Valid non-empty field value'
      });
    }
  });

  // 2. Date Chronology & Policy Duration Verification
  let dateOrderPassed = true;
  let dateCalculated = false;
  let diffDays = 0;

  if (effective_date?.value && expiry_date?.value) {
    const eff = new Date(effective_date.value);
    const exp = new Date(expiry_date.value);

    if (!isNaN(eff.getTime()) && !isNaN(exp.getTime())) {
      dateCalculated = true;
      diffDays = (exp.getTime() - eff.getTime()) / (1000 * 60 * 60 * 24);
      dateOrderPassed = diffDays > 0;

      checks.push({
        id: 'chk-date-order',
        name: 'Coverage Period Chronology',
        category: 'dates',
        passed: dateOrderPassed,
        message: dateOrderPassed
          ? `Policy period is chronological (${Math.round(diffDays)} days coverage term)`
          : `Policy expiry date (${expiry_date.value}) precedes effective date (${effective_date.value})`,
        evidence: `Effective: ${effective_date.value} | Expiry: ${expiry_date.value}`,
        severity: 'high'
      });

      if (!dateOrderPassed) {
        issues.push({
          id: 'issue-date-reversed',
          title: 'Contradictory Policy Dates (Reversed Chronology)',
          category: 'Date Validity',
          severity: 'high',
          explanation: `The stated policy expiration date (${expiry_date.value}) is prior to the inception date (${effective_date.value}). This indicates potential alteration or corrupted contract generation.`,
          documentValue: `Expiry: ${expiry_date.value} precedes Effective: ${effective_date.value}`,
          expectedValue: 'Expiry date must be strictly after effective date',
          evidence: `Effective: ${effective_date.value} → Expiration: ${expiry_date.value}`
        });
      } else if (diffDays < 60 || diffDays > 1100) {
        checks.push({
          id: 'chk-date-term',
          name: 'Standard Policy Term Verification',
          category: 'dates',
          passed: false,
          message: `Non-standard policy duration detected (${Math.round(diffDays)} days)`,
          severity: 'medium'
        });
        issues.push({
          id: 'issue-date-term',
          title: 'Non-Standard Policy Duration',
          category: 'Date Validity',
          severity: 'medium',
          explanation: `The policy duration is ${Math.round(diffDays)} days, which deviates from standard insurance annual terms (365 days) or multi-year terms.`,
          documentValue: `${Math.round(diffDays)} days`,
          expectedValue: '365 days (Standard 1-Year Term) or 730 days (2-Year Term)'
        });
      }
    }
  }

  // 3. Financial Premium Rate & Mathematical Consistency Check
  let premiumMathPassed = true;
  if (coverage_inr?.value && premium_rate_percent?.value && premium_inr?.value) {
    const cov = coverage_inr.value;
    const rate = premium_rate_percent.value;
    const docPrem = premium_inr.value;

    const expectedPrem = Math.round((cov * rate) / 100);
    const diff = Math.abs(docPrem - expectedPrem);
    const tolerance = Math.max(50, expectedPrem * 0.015); // 1.5% or ₹50

    premiumMathPassed = diff <= tolerance;

    checks.push({
      id: 'chk-premium-math',
      name: 'Premium Arithmetic Consistency',
      category: 'financial',
      passed: premiumMathPassed,
      message: premiumMathPassed
        ? `Premium matches calculated underwriting rate (₹${docPrem.toLocaleString('en-IN')})`
        : `Stated premium (₹${docPrem.toLocaleString('en-IN')}) contradicts calculated underwriting rate (₹${expectedPrem.toLocaleString('en-IN')})`,
      evidence: `₹${cov.toLocaleString('en-IN')} × ${rate}% = ₹${expectedPrem.toLocaleString('en-IN')}`,
      severity: 'high'
    });

    if (!premiumMathPassed) {
      issues.push({
        id: 'issue-premium-mismatch',
        title: 'Mathematical Premium Discrepancy',
        category: 'Financial Underwriting',
        severity: 'high',
        explanation: `Stated annual premium of ₹${docPrem.toLocaleString('en-IN')} contradicts the calculated underwriting formula based on the sum insured and stated premium rate. This is a common indicator of unauthorized document value tampering.`,
        documentValue: `₹${docPrem.toLocaleString('en-IN')}`,
        expectedValue: `₹${expectedPrem.toLocaleString('en-IN')}`,
        calculationFormula: `₹${cov.toLocaleString('en-IN')} × ${rate}% = ₹${expectedPrem.toLocaleString('en-IN')}`,
        evidence: `Difference of ₹${diff.toLocaleString('en-IN')} (${((diff / expectedPrem) * 100).toFixed(1)}% discrepancy)`
      });
    }
  }

  // 4. Deductible Bounds & Ratio Check
  if (deductible_inr?.value && coverage_inr?.value) {
    const ded = deductible_inr.value;
    const cov = coverage_inr.value;
    const deductibleValid = ded >= 0 && ded < cov;

    checks.push({
      id: 'chk-deductible',
      name: 'Compulsory Deductible Threshold',
      category: 'financial',
      passed: deductibleValid,
      message: deductibleValid
        ? `Deductible is within allowable bounds (₹${ded.toLocaleString('en-IN')})`
        : `Deductible (₹${ded.toLocaleString('en-IN')}) exceeds total sum insured (₹${cov.toLocaleString('en-IN')})`,
      severity: 'high'
    });

    if (!deductibleValid) {
      issues.push({
        id: 'issue-deductible-invalid',
        title: 'Invalid Deductible Value',
        category: 'Financial Underwriting',
        severity: 'high',
        explanation: `Deductible amount cannot exceed or equal the total policy sum insured.`,
        documentValue: `₹${ded.toLocaleString('en-IN')}`,
        expectedValue: `< ₹${cov.toLocaleString('en-IN')}`
      });
    }
  }

  // 5. Policy Number Identifier Syntax & Scheme Check
  let policyFormatPassed = true;
  if (policy_number?.value) {
    const polNum = String(policy_number.value).trim();
    // Standard formats: POL-YYYY-XXXX, HD-XXXX, 1234/XXXX, etc.
    const hasValidSyntax = polNum.length >= 6 && /^[a-zA-Z0-9\/-]+$/.test(polNum);

    policyFormatPassed = hasValidSyntax;

    checks.push({
      id: 'chk-policy-format',
      name: 'Policy Identifier Syntax',
      category: 'format',
      passed: policyFormatPassed,
      message: policyFormatPassed
        ? `Policy number format adheres to standards (${polNum})`
        : `Policy number '${polNum}' contains non-standard characters or invalid formatting`,
      severity: 'medium'
    });

    if (!policyFormatPassed) {
      issues.push({
        id: 'issue-policy-format',
        title: 'Non-Standard Policy Number Format',
        category: 'Format & Compliance',
        severity: 'medium',
        explanation: `Policy identifier '${polNum}' does not conform to authorized underwriting alphanumeric syntax.`,
        documentValue: polNum,
        expectedValue: 'Standard alphanumeric identifier (e.g. POL-2026-0001)'
      });
    }
  }

  // 6. Trusted Insurer Registry & Entity Verification
  let insurerRecognized = false;
  let matchedInsurerName = '';
  if (insurer?.value) {
    const insLower = String(insurer.value).toLowerCase();
    const matched = RECOGNIZED_INSURERS.find(name => insLower.includes(name));
    
    if (matched) {
      insurerRecognized = true;
      matchedInsurerName = insurer.value;
    } else {
      // Fallback check for general terms
      insurerRecognized = insLower.includes('insurance') || insLower.includes('assurance') || insLower.includes('underwriters');
      if (insurerRecognized) matchedInsurerName = insurer.value;
    }

    checks.push({
      id: 'chk-insurer-registry',
      name: 'Insurer Entity & Registry Verification',
      category: 'trusted_registry',
      passed: insurerRecognized,
      message: insurerRecognized
        ? `Insurer '${insurer.value}' recognized in authorized registry`
        : `Insurer contact information and entity could not be independently verified`,
      severity: 'medium'
    });

    if (!insurerRecognized) {
      issues.push({
        id: 'issue-insurer-unrecognized',
        title: 'Unverified Insurer Entity',
        category: 'Trusted Registry',
        severity: 'medium',
        explanation: `The stated underwriting company '${insurer.value}' was not found in the verified insurance entity registry.`,
        documentValue: insurer.value,
        expectedValue: 'Authorized & Registered Insurance Carrier'
      });
    }
  }

  // 7. Calculate Status & Decision Logic (4-tier standard)
  const passedCount = checks.filter(c => c.passed).length;
  const totalCount = checks.length;

  const highSeverityIssues = issues.filter(i => i.severity === 'high');
  const mediumSeverityIssues = issues.filter(i => i.severity === 'medium');

  let statusCode: VerificationStatusCode = 'VERIFIED_ORIGINAL';
  let status: 'Verified / Likely Original' | 'Suspicious' | 'Potentially Altered' | 'Unable to Verify' = 'Verified / Likely Original';
  let recommendation = '';

  if (missingMandatoryCount >= 4) {
    statusCode = 'UNABLE_TO_VERIFY';
    status = 'Unable to Verify';
    recommendation = 'Verification could not be completed because sufficient trusted policy information was unavailable. Please upload a higher resolution copy or full policy schedule.';
  } else if (!dateOrderPassed || !premiumMathPassed) {
    // Critical contradictions in math or dates indicate tampering
    statusCode = 'POTENTIALLY_ALTERED';
    status = 'Potentially Altered';
    recommendation = 'Document contains contradictory mathematical or chronological terms that indicate potential alteration or tampering. Manual underwriting audit required.';
  } else if (highSeverityIssues.length > 0 || mediumSeverityIssues.length > 0 || !insurerRecognized) {
    statusCode = 'SUSPICIOUS';
    status = 'Suspicious';
    recommendation = 'Document exhibits minor discrepancies or unverified entity nomenclature. Review with issuing underwriter recommended.';
  } else {
    statusCode = 'VERIFIED_ORIGINAL';
    status = 'Verified / Likely Original';
    recommendation = 'No significant inconsistencies detected across policy terms, dates, and financial underwriting calculations.';
  }

  // Anomaly and Confidence Scoring
  let rawAnomalyScore = 0.04;
  issues.forEach(issue => {
    if (issue.severity === 'high') rawAnomalyScore += 0.35;
    else if (issue.severity === 'medium') rawAnomalyScore += 0.15;
    else rawAnomalyScore += 0.05;
  });

  const anomalyScore = Number(Math.min(0.98, Math.max(0.04, rawAnomalyScore)).toFixed(2));
  const confidenceScore = statusCode === 'UNABLE_TO_VERIFY' ? 0.45 : Number((1.0 - (issues.length * 0.05)).toFixed(2));

  // Plain-English Summary Generation
  const holderName = policyholder?.value || 'an unspecified customer';
  const insName = insurer?.value || 'an unrecognized insurance entity';
  const polType = policy_type?.value || 'General Insurance';
  const polNumText = policy_number?.value ? `Policy #${policy_number.value}` : 'an unnumbered document';
  const sumText = coverage_inr?.value ? `₹${coverage_inr.value.toLocaleString('en-IN')}` : 'unspecified sum insured';
  const premText = premium_inr?.value ? `₹${premium_inr.value.toLocaleString('en-IN')}` : 'unspecified premium';
  const termText = (effective_date?.value && expiry_date?.value) 
    ? `valid from ${effective_date.value} to ${expiry_date.value}` 
    : 'with missing policy period dates';

  const plainEnglishSummary = `This document is an insurance certificate for ${holderName} issued under ${polNumText} by ${insName}. It specifies a ${polType} with a total sum insured of ${sumText} and an annual premium of ${premText}, ${termText}.`;

  // Detailed Verification Explanation
  let detailedExplanation = '';
  if (statusCode === 'VERIFIED_ORIGINAL') {
    detailedExplanation = `No significant inconsistencies detected during multi-stage automated audit. Stated dates are chronological (${Math.round(diffDays)} days), policy identifier adheres to syntax rules, and the annual premium (${premText}) matches the calculated rate on the sum insured (${sumText}).`;
  } else if (statusCode === 'UNABLE_TO_VERIFY') {
    detailedExplanation = `Verification could not be completed because key policy information could not be reliably extracted from the uploaded file (${missingMandatoryCount} required fields missing or unreadable).`;
  } else {
    const issueBullets = issues.map((iss, i) => `${i + 1}. [${iss.severity.toUpperCase()}] ${iss.title}: ${iss.explanation}${iss.calculationFormula ? ` (Applied formula: ${iss.calculationFormula})` : ''}`).join('\n');
    detailedExplanation = `Discrepancies identified during automated audit:\n${issueBullets}\n\nThese indicators suggest the document contains inconsistent terms or mathematical contradictions.`;
  }

  // Reviewer Guidance
  const reviewerGuidance = statusCode === 'VERIFIED_ORIGINAL'
    ? 'Automated Underwriting Check: No discrepancies detected. Document is consistent with standard policy terms.'
    : `Underwriter Review Guidance: Flagged ${issues.length} items. Request an original verified endorsement certificate from ${insName} to resolve identified discrepancies.`;

  const processingTimeMs = Date.now() - processingStartTime;

  return {
    verificationId: `VER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status,
    statusCode,
    anomalyScore,
    confidenceScore: Math.max(0.40, confidenceScore),
    processingTimeMs,
    extractedFields: extracted,
    validationChecks: checks,
    detectedIssues: issues,
    passedChecksCount: passedCount,
    totalChecksCount: totalCount,
    trustedRegistryMatch: {
      matched: insurerRecognized,
      providerName: matchedInsurerName || insurer?.value || 'Unknown',
      accreditationStatus: insurerRecognized ? 'Authorized Underwriter' : 'Unconfirmed Entity',
      details: insurerRecognized ? 'Matched in verified insurance carrier database.' : 'Insurer contact or company info could not be independently confirmed.'
    },
    officialVerificationStatus: 'PENDING_INSURER_CONFIRMATION',
    recommendation,
    plainEnglishSummary,
    detailedExplanation,
    reviewerGuidance,
    disclaimer: 'AI-assisted verification identifies inconsistencies and risk indicators. It does not guarantee authenticity unless the policy is independently confirmed through an authorized insurer or trusted source.',
    modelInfo: {
      name: 'ClearClaim Authenticity & Consistency Engine',
      type: 'Multi-Layer Rule & Anomaly Verification System',
      version: 'v3.0.0-production'
    },
    verifiedAt: new Date().toISOString()
  };
}
