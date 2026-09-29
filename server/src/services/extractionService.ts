/**
 * Insurance Information Extraction Engine
 * Extracts structured fields from raw OCR / document text with per-field confidence & evidence tracking.
 * Never invents values; missing fields are returned as null with 0 confidence.
 */

export interface ExtractedField<T> {
  value: T | null;
  confidence: number; // 0.0 to 1.0
  sourceChunkId?: string;
  evidenceSnippet?: string;
}

export interface ExtractedInsuranceDocument {
  policy_number: ExtractedField<string>;
  insurer: ExtractedField<string>;
  policyholder: ExtractedField<string>;
  policy_type: ExtractedField<string>;
  city: ExtractedField<string>;
  effective_date: ExtractedField<string>;
  expiry_date: ExtractedField<string>;
  coverage_inr: ExtractedField<number>;
  premium_inr: ExtractedField<number>;
  deductible_inr: ExtractedField<number>;
  premium_rate_percent: ExtractedField<number>;
  rawText: string;
}

const KNOWN_INSURERS = [
  'Falcon Mutual Insurance Ltd.',
  'Apex General Insurance Corp.',
  'Heritage National Assurance',
  'BlueShield Commercial Underwriters',
  'Vanguard Life & Asset Assurance',
  'Zenith Premier Insurance Co.',
  'StarGuard Indemnity Group',
  'Pinnacle Mutual Risk Corp.'
];

export function extractInsuranceFields(rawText: string, chunks?: { chunkId: string; page: number; text: string }[]): ExtractedInsuranceDocument {
  const text = rawText || '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const findChunk = (term: string): { chunkId?: string; snippet?: string } => {
    if (!chunks || chunks.length === 0) return {};
    const lowerTerm = term.toLowerCase();
    const match = chunks.find(c => c.text.toLowerCase().includes(lowerTerm));
    if (match) {
      return {
        chunkId: match.chunkId,
        snippet: match.text.slice(0, 150)
      };
    }
    return {};
  };

  // 1. Policy Number
  let policyNumber: ExtractedField<string> = { value: null, confidence: 0 };
  const polMatch = text.match(/Policy\s*(?:Number|No\.?|ID|Certificate\s*Ref)[:\s]+([A-Z0-9#-]+)/i) ||
                    text.match(/\b(POL-\d{4}-\d{4})\b/i) ||
                    text.match(/\b(INVALID#[A-Z0-9-]+)\b/i);
  if (polMatch) {
    const val = polMatch[1].trim();
    if (!val.includes('[NOT SPECIFIED]') && !val.includes('[OMITTED]')) {
      const src = findChunk(val);
      policyNumber = {
        value: val,
        confidence: val.startsWith('POL-') ? 0.98 : 0.75,
        sourceChunkId: src.chunkId,
        evidenceSnippet: src.snippet || polMatch[0]
      };
    }
  }

  // 2. Insurer
  let insurer: ExtractedField<string> = { value: null, confidence: 0 };
  for (const known of KNOWN_INSURERS) {
    if (text.toLowerCase().includes(known.toLowerCase())) {
      const src = findChunk(known);
      insurer = {
        value: known,
        confidence: 0.99,
        sourceChunkId: src.chunkId,
        evidenceSnippet: src.snippet || known
      };
      break;
    }
  }
  if (!insurer.value) {
    const insMatch = text.match(/(?:Insurer\s*Name|Insurance\s*Company)[:\s]+([^\n\r]+)/i);
    if (insMatch && insMatch[1].trim().length > 3) {
      const val = insMatch[1].trim();
      const src = findChunk(val);
      insurer = {
        value: val,
        confidence: 0.85,
        sourceChunkId: src.chunkId,
        evidenceSnippet: src.snippet || insMatch[0]
      };
    }
  }

  // 3. Policyholder Name
  let policyholder: ExtractedField<string> = { value: null, confidence: 0 };
  const holderMatch = text.match(/(?:Policyholder\s*(?:Name)?|Insured\s*Name|Named\s*Insured)[:\s]+([^\n\r]+)/i);
  if (holderMatch) {
    const val = holderMatch[1].trim();
    if (!val.includes('[MANDATORY') && !val.includes('[NOT SPECIFIED]') && !val.includes('[OMITTED]')) {
      const src = findChunk(val);
      policyholder = {
        value: val,
        confidence: 0.95,
        sourceChunkId: src.chunkId,
        evidenceSnippet: src.snippet || holderMatch[0]
      };
    }
  }

  // 4. Policy Type
  let policyType: ExtractedField<string> = { value: null, confidence: 0 };
  const typeMatch = text.match(/(?:Policy\s*(?:Category|Type)|Coverage\s*Type)[:\s]+([^\n\r]+)/i);
  if (typeMatch) {
    const val = typeMatch[1].trim();
    const src = findChunk(val);
    policyType = {
      value: val,
      confidence: 0.92,
      sourceChunkId: src.chunkId,
      evidenceSnippet: src.snippet || typeMatch[0]
    };
  }

  // 5. City / Location
  let city: ExtractedField<string> = { value: null, confidence: 0 };
  const cityMatch = text.match(/(?:Operating\s*Location|Location|City|Place)[:\s]+([A-Za-z\s]+)(?:,\s*India)?/i);
  if (cityMatch) {
    const val = cityMatch[1].trim();
    const src = findChunk(val);
    city = {
      value: val,
      confidence: 0.90,
      sourceChunkId: src.chunkId,
      evidenceSnippet: src.snippet || cityMatch[0]
    };
  }

  // Helper date parser (YYYY-MM-DD or DD/MM/YYYY)
  const parseDateStr = (raw: string): string | null => {
    const ymd = raw.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymd) {
      const year = ymd[1];
      const month = ymd[2].padStart(2, '0');
      const day = ymd[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    const dmy = raw.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmy) {
      const day = dmy[1].padStart(2, '0');
      const month = dmy[2].padStart(2, '0');
      const year = dmy[3];
      return `${year}-${month}-${day}`;
    }
    return null;
  };

  // 6. Effective Date
  let effectiveDate: ExtractedField<string> = { value: null, confidence: 0 };
  const effMatch = text.match(/(?:Inception\s*(?:\/|\&|and)?\s*Effective\s*Date|Inception\s*Date|Inception|Effective\s*Date|Commencement\s*Date|Start\s*Date)[:\s]+([\d\-/]+)/i);
  if (effMatch) {
    const parsed = parseDateStr(effMatch[1]);
    if (parsed) {
      const src = findChunk(effMatch[1]);
      effectiveDate = {
        value: parsed,
        confidence: 0.96,
        sourceChunkId: src.chunkId,
        evidenceSnippet: src.snippet || effMatch[0]
      };
    }
  }

  // 7. Expiry Date
  let expiryDate: ExtractedField<string> = { value: null, confidence: 0 };
  const expMatch = text.match(/(?:Policy\s*Expiry\s*Date|Expiration\s*Date|Expiry\s*Date|End\s*Date)[:\s]+([\d\-/]+)/i);
  if (expMatch) {
    const parsed = parseDateStr(expMatch[1]);
    if (parsed) {
      const src = findChunk(expMatch[1]);
      expiryDate = {
        value: parsed,
        confidence: 0.96,
        sourceChunkId: src.chunkId,
        evidenceSnippet: src.snippet || expMatch[0]
      };
    }
  }

  // Clean INR currency strings
  const parseCurrency = (raw: string): number | null => {
    const clean = raw.replace(/[^\d.]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  };

  // 8. Coverage / Sum Insured
  let coverage: ExtractedField<number> = { value: null, confidence: 0 };
  const covMatch = text.match(/(?:Total\s*Sum\s*Insured|Coverage|Sum\s*Insured)[:\s]+(?:INR|₹|Rs\.?)?\s*([\d,]+)/i);
  if (covMatch) {
    const val = parseCurrency(covMatch[1]);
    if (val !== null) {
      const src = findChunk(covMatch[1]);
      coverage = {
        value: val,
        confidence: 0.95,
        sourceChunkId: src.chunkId,
        evidenceSnippet: src.snippet || covMatch[0]
      };
    }
  }

  // 9. Premium Rate
  let rate: ExtractedField<number> = { value: null, confidence: 0 };
  const rateMatch = text.match(/(?:Applicable\s*Premium\s*Rate|Premium\s*Rate|Applicable\s*Rate)[:\s]+([\d.]+)\s*%/i);
  if (rateMatch) {
    const val = parseFloat(rateMatch[1]);
    if (!isNaN(val)) {
      const src = findChunk(rateMatch[1]);
      rate = {
        value: val,
        confidence: 0.95,
        sourceChunkId: src.chunkId,
        evidenceSnippet: src.snippet || rateMatch[0]
      };
    }
  }

  // 10. Deductible
  let deductible: ExtractedField<number> = { value: null, confidence: 0 };
  const dedMatch = text.match(/(?:Compulsory\s*Deductible|Standard\s*Deductible|Deductible|Excess)[:\s]+(?:INR|₹|Rs\.?)?\s*([\d,]+)/i);
  if (dedMatch) {
    const val = parseCurrency(dedMatch[1]);
    if (val !== null) {
      const src = findChunk(dedMatch[1]);
      deductible = {
        value: val,
        confidence: 0.94,
        sourceChunkId: src.chunkId,
        evidenceSnippet: src.snippet || dedMatch[0]
      };
    }
  }

  // 11. Annual Premium
  let premium: ExtractedField<number> = { value: null, confidence: 0 };
  const premMatch = text.match(/(?:Total\s*Annual\s*Premium\s*Payable|Annual\s*Premium|Total\s*Premium)[:\s]+(?:INR|₹|Rs\.?)?\s*([\d,]+)/i);
  if (premMatch) {
    const val = parseCurrency(premMatch[1]);
    if (val !== null) {
      const src = findChunk(premMatch[1]);
      premium = {
        value: val,
        confidence: 0.95,
        sourceChunkId: src.chunkId,
        evidenceSnippet: src.snippet || premMatch[0]
      };
    }
  }

  return {
    policy_number: policyNumber,
    insurer,
    policyholder,
    policy_type: policyType,
    city,
    effective_date: effectiveDate,
    expiry_date: expiryDate,
    coverage_inr: coverage,
    premium_inr: premium,
    deductible_inr: deductible,
    premium_rate_percent: rate,
    rawText: text
  };
}
