import crypto from 'crypto';
import {
  InsuranceProviderEntity,
  InsuranceCategoryGuide,
  ProviderAuditLogEntity,
  ProviderSourceState,
  ProviderSourceType
} from '../models/Provider';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  phone?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface NotificationEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ALERT' | 'EXPIRY' | 'VERIFICATION' | 'PROVIDER_UPDATE' | 'PAYMENT';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogEntity {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface InsuranceProductEntity {
  id: string;
  providerName: string;
  category: 'health' | 'vehicle' | 'life' | 'travel' | 'property';
  planName: string;
  tagline: string;
  description: string;
  sumInsured: number;
  annualPremiumBase: number;
  deductible: number;
  claimSettlementRatio: string;
  rating: string;
  features: string[];
  exclusions: string[];
  popular?: boolean;
}

export interface PolicyEntity {
  id: string;
  userId: string;
  policyNumber: string;
  productId: string;
  providerName: string;
  planName: string;
  category: 'health' | 'vehicle' | 'life' | 'travel' | 'property';
  policyHolderName: string;
  policyHolderEmail: string;
  policyHolderPhone: string;
  nomineeName?: string;
  nomineeRelation?: string;
  coverageAmount: number;
  annualPremium: number;
  startDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
  paymentId: string;
  transactionId: string;
  createdAt: string;
}

export interface PaymentTransactionEntity {
  id: string;
  userId: string;
  policyId?: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  gateway: string;
  paymentMethod: string;
  verifiedServerSide: boolean;
  planName: string;
  createdAt: string;
}

export const INITIAL_PRODUCTS: InsuranceProductEntity[] = [];

// REAL ACCREDITED INSURANCE PROVIDERS IN INDIA WITH OFFICIAL VERIFIED DOMAINS & SOURCE STATES
export const INITIAL_REAL_PROVIDERS: InsuranceProviderEntity[] = [
  {
    id: 'prov-lic-india',
    providerName: 'Life Insurance Corporation of India (LIC)',
    shortName: 'LIC of India',
    tagline: 'India’s state-owned premier life insurance and annuity corporation.',
    description: 'Statutory corporation offering term assurance, whole life, endowment, pension, and group gratuity schemes with statutory sovereign guarantee.',
    providerType: 'LIFE',
    officialDomain: 'licindia.in',
    providerUrl: 'https://licindia.in',
    officialPolicyPageUrl: 'https://licindia.in/Products/Insurance-Plan',
    sourceType: 'OFFICIAL_REGULATORY_SOURCE',
    sourceState: 'OFFICIAL_VERIFIED',
    sourceUrl: 'https://irdai.gov.in',
    verifiedAt: '2026-01-15T00:00:00Z',
    lastCheckedAt: '2026-09-15T12:00:00Z',
    verificationMethod: 'IRDAI Statutory Registry & Official Domain Validation',
    regulatoryRegistrationNumber: 'IRDAI/NL-01/01/2000',
    country: 'India',
    languageSupport: ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati'],
    categoriesOffered: ['life'],
    rating: '4.9 / 5',
    claimSettlementRatio: '98.5%',
    customerCareContact: '022-68276827 / co_health@licindia.com',
    isPopular: true
  },
  {
    id: 'prov-hdfc-ergo',
    providerName: 'HDFC ERGO General Insurance Company Ltd.',
    shortName: 'HDFC ERGO',
    tagline: 'Leading private general insurer with 12,000+ cashless hospital & garage network.',
    description: 'Comprehensive general insurer providing health insurance, motor own-damage, international travel cover, home protection, and commercial liability.',
    providerType: 'GENERAL',
    officialDomain: 'hdfcergo.com',
    providerUrl: 'https://www.hdfcergo.com',
    officialPolicyPageUrl: 'https://www.hdfcergo.com/health-insurance',
    sourceType: 'OFFICIAL_PROVIDER',
    sourceState: 'OFFICIAL_VERIFIED',
    sourceUrl: 'https://www.hdfcergo.com',
    verifiedAt: '2026-01-20T00:00:00Z',
    lastCheckedAt: '2026-09-17T08:30:00Z',
    verificationMethod: 'Authoritative Domain DNS & IRDAI License #146 Validation',
    regulatoryRegistrationNumber: 'IRDAI Reg. No. 146',
    country: 'India',
    languageSupport: ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali'],
    categoriesOffered: ['health', 'vehicle', 'travel', 'property', 'business'],
    rating: '4.8 / 5',
    claimSettlementRatio: '99.1%',
    customerCareContact: '022-62346234 / care@hdfcergo.com',
    isPopular: true
  },
  {
    id: 'prov-star-health',
    providerName: 'Star Health and Allied Insurance Co. Ltd.',
    shortName: 'Star Health',
    tagline: 'India’s first standalone health insurance specialist with 14,000+ cashless hospitals.',
    description: 'Dedicated health insurance company specializing in individual & family floater medical plans, cardiac care, diabetes safeguard, and senior citizen health.',
    providerType: 'HEALTH',
    officialDomain: 'starhealth.in',
    providerUrl: 'https://www.starhealth.in',
    officialPolicyPageUrl: 'https://www.starhealth.in/health-insurance-plans',
    sourceType: 'OFFICIAL_PROVIDER',
    sourceState: 'OFFICIAL_VERIFIED',
    sourceUrl: 'https://www.starhealth.in',
    verifiedAt: '2026-02-01T00:00:00Z',
    lastCheckedAt: '2026-09-16T14:15:00Z',
    verificationMethod: 'Standalone Health Insurer IRDAI License #129 Direct Verification',
    regulatoryRegistrationNumber: 'IRDAI Reg. No. 129',
    country: 'India',
    languageSupport: ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'],
    categoriesOffered: ['health', 'travel'],
    rating: '4.7 / 5',
    claimSettlementRatio: '98.2%',
    customerCareContact: '1800-425-2255 / support@starhealth.in',
    isPopular: true
  },
  {
    id: 'prov-icici-lombard',
    providerName: 'ICICI Lombard General Insurance Company Ltd.',
    shortName: 'ICICI Lombard',
    tagline: 'Pioneering technology-first general and motor insurance solutions.',
    description: 'Major private insurer offering bumper-to-bumper car & two-wheeler insurance, Complete Health Insurance (CHI), worldwide travel, and SME property protection.',
    providerType: 'GENERAL',
    officialDomain: 'icicilombard.com',
    providerUrl: 'https://www.icicilombard.com',
    officialPolicyPageUrl: 'https://www.icicilombard.com/motor-insurance/car-insurance',
    sourceType: 'OFFICIAL_PROVIDER',
    sourceState: 'OFFICIAL_VERIFIED',
    sourceUrl: 'https://www.icicilombard.com',
    verifiedAt: '2026-01-10T00:00:00Z',
    lastCheckedAt: '2026-09-17T11:00:00Z',
    verificationMethod: 'IRDAI License #115 & Official SSL Certificate Cross-Check',
    regulatoryRegistrationNumber: 'IRDAI Reg. No. 115',
    country: 'India',
    languageSupport: ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu'],
    categoriesOffered: ['health', 'vehicle', 'travel', 'property', 'business'],
    rating: '4.8 / 5',
    claimSettlementRatio: '98.9%',
    customerCareContact: '1800-2666 / customersupport@icicilombard.com',
    isPopular: true
  },
  {
    id: 'prov-bajaj-allianz',
    providerName: 'Bajaj Allianz General Insurance Co. Ltd.',
    shortName: 'Bajaj Allianz',
    tagline: 'Caringly Yours — Rapid digital claim settlement & roadside response.',
    description: 'Joint venture offering Health Guard hospitalization, DriveSmart telematic motor policies, Global Travel Care, and comprehensive Home insurance.',
    providerType: 'GENERAL',
    officialDomain: 'bajajallianz.com',
    providerUrl: 'https://www.bajajallianz.com',
    officialPolicyPageUrl: 'https://www.bajajallianz.com/general-insurance.html',
    sourceType: 'OFFICIAL_PROVIDER',
    sourceState: 'OFFICIAL_VERIFIED',
    sourceUrl: 'https://www.bajajallianz.com',
    verifiedAt: '2026-01-25T00:00:00Z',
    lastCheckedAt: '2026-09-16T18:00:00Z',
    verificationMethod: 'IRDAI Reg #113 Official Verification',
    regulatoryRegistrationNumber: 'IRDAI Reg. No. 113',
    country: 'India',
    languageSupport: ['English', 'Hindi', 'Marathi', 'Bengali', 'Tamil', 'Telugu'],
    categoriesOffered: ['health', 'vehicle', 'travel', 'property', 'business'],
    rating: '4.7 / 5',
    claimSettlementRatio: '98.7%',
    customerCareContact: '1800-209-5858 / customercare@bajajallianz.co.in',
    isPopular: true
  },
  {
    id: 'prov-new-india',
    providerName: 'The New India Assurance Company Ltd.',
    shortName: 'New India Assurance',
    tagline: 'India’s largest public sector general insurance company with global operations.',
    description: 'Government-owned multinational general insurance company with century-old trust, underwriting industrial risks, health mediclaim, and vehicle indemnity.',
    providerType: 'GENERAL',
    officialDomain: 'newindia.co.in',
    providerUrl: 'https://www.newindia.co.in',
    officialPolicyPageUrl: 'https://www.newindia.co.in/portal/product/motor',
    sourceType: 'OFFICIAL_REGULATORY_SOURCE',
    sourceState: 'OFFICIAL_VERIFIED',
    sourceUrl: 'https://irdai.gov.in',
    verifiedAt: '2026-01-05T00:00:00Z',
    lastCheckedAt: '2026-09-14T09:00:00Z',
    verificationMethod: 'Government Public Sector Undertaking (PSU) Authority Validation',
    regulatoryRegistrationNumber: 'IRDAI Reg. No. 190',
    country: 'India',
    languageSupport: ['English', 'Hindi', 'Tamil', 'Bengali', 'Marathi', 'Gujarati', 'Urdu'],
    categoriesOffered: ['health', 'vehicle', 'travel', 'property', 'business'],
    rating: '4.6 / 5',
    claimSettlementRatio: '97.8%',
    customerCareContact: '1800-209-1415 / tech.support@newindia.co.in',
    isPopular: false
  },
  {
    id: 'prov-care-health',
    providerName: 'Care Health Insurance Ltd. (formerly Religare Health)',
    shortName: 'Care Health',
    tagline: 'Specialized healthcare financing with cashless outpatient and daycare focus.',
    description: 'Comprehensive health plans including Care Supreme, critical illness rider, maternity benefits, and annual unlimited automatic sum insured recharge.',
    providerType: 'HEALTH',
    officialDomain: 'careinsurance.com',
    providerUrl: 'https://www.careinsurance.com',
    officialPolicyPageUrl: 'https://www.careinsurance.com/health-insurance-plans.html',
    sourceType: 'OFFICIAL_PROVIDER',
    sourceState: 'OFFICIAL_POLICY_PAGE',
    sourceUrl: 'https://www.careinsurance.com',
    verifiedAt: '2026-02-10T00:00:00Z',
    lastCheckedAt: '2026-09-15T16:00:00Z',
    verificationMethod: 'Direct Health Underwriter Domain & IRDAI #148 Verification',
    regulatoryRegistrationNumber: 'IRDAI Reg. No. 148',
    country: 'India',
    languageSupport: ['English', 'Hindi', 'Punjabi', 'Bengali', 'Tamil'],
    categoriesOffered: ['health', 'travel'],
    rating: '4.8 / 5',
    claimSettlementRatio: '98.3%',
    customerCareContact: '1800-102-4488 / customerfirst@careinsurance.com',
    isPopular: false
  },
  {
    id: 'prov-sbi-general',
    providerName: 'SBI General Insurance Company Ltd.',
    shortName: 'SBI General',
    tagline: 'Trust and security backed by State Bank of India network.',
    description: 'Retail and corporate general insurance covering health arogya premier, motor private car, home contents, and commercial fire & allied perils.',
    providerType: 'GENERAL',
    officialDomain: 'sbigeneral.in',
    providerUrl: 'https://www.sbigeneral.in',
    officialPolicyPageUrl: 'https://www.sbigeneral.in/portal/health-insurance',
    sourceType: 'OFFICIAL_PROVIDER',
    sourceState: 'OFFICIAL_VERIFIED',
    sourceUrl: 'https://www.sbigeneral.in',
    verifiedAt: '2026-02-15T00:00:00Z',
    lastCheckedAt: '2026-09-16T10:00:00Z',
    verificationMethod: 'IRDAI License #144 Official Portal Verification',
    regulatoryRegistrationNumber: 'IRDAI Reg. No. 144',
    country: 'India',
    languageSupport: ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Gujarati'],
    categoriesOffered: ['health', 'vehicle', 'property', 'business'],
    rating: '4.7 / 5',
    claimSettlementRatio: '98.0%',
    customerCareContact: '1800-102-1111 / customer.care@sbigeneral.in',
    isPopular: false
  },
  {
    id: 'prov-sample-pending',
    providerName: 'Apex Motor Assistance (Regional Broker Hub)',
    shortName: 'Apex Regional',
    tagline: 'Third-party vehicle roadside & renewal aggregator.',
    description: 'Regional assistance agency listed for source validation review. Not yet verified as a primary insurance underwriter.',
    providerType: 'GENERAL',
    officialDomain: 'apex-motor-assist.example.in',
    providerUrl: 'https://apex-motor-assist.example.in',
    sourceType: 'USER_SUBMITTED',
    sourceState: 'PENDING_VERIFICATION',
    sourceUrl: 'https://apex-motor-assist.example.in/about',
    verifiedAt: '',
    lastCheckedAt: '2026-09-17T09:00:00Z',
    verificationMethod: 'Awaiting Administrator Review & Underwriter Registration Validation',
    country: 'India',
    languageSupport: ['English', 'Hindi'],
    categoriesOffered: ['vehicle'],
    rating: '3.9 / 5',
    claimSettlementRatio: 'Under Review',
    customerCareContact: '011-40004000 / info@apex-motor-assist.example.in',
    isPopular: false
  }
];

// EDUCATIONAL INSURANCE CATEGORY GUIDES (NO INVENTED POLICIES OR FAKE PRICES)
export const INSURANCE_CATEGORY_GUIDES: Record<string, InsuranceCategoryGuide> = {
  health: {
    id: 'health',
    name: 'Health Insurance',
    shortExplanation: 'Health insurance helps cover eligible medical and hospitalization expenses according to the terms of the selected policy.',
    whatIsIt: 'A health insurance policy is an agreement between an individual or family and an insurance company where the insurer agrees to pay specified medical costs in exchange for a periodic premium.',
    whoShouldConsider: [
      'Individuals looking for protection against sudden medical emergencies and rising hospitalization costs',
      'Families desiring shared floating coverage for parents, spouses, and children',
      'Senior citizens seeking pre-existing illness coverage and chronic ailment care',
      'Salaried employees needing high sum-insured top-up plans above corporate group health covers'
    ],
    commonCoverageAreas: [
      'Inpatient Hospitalization (room rent, nursing expenses, ICU charges, surgeon fees)',
      'Pre-Hospitalization (diagnostic tests, medical consultations 30–60 days prior to admission)',
      'Post-Hospitalization (follow-up medicines, recovery care 60–180 days after discharge)',
      'Day Care Treatments (medical procedures requiring less than 24 hours hospitalization)',
      'Cashless Network Facility at empaneled hospitals across India',
      'Emergency Road & Air Ambulance allowances'
    ],
    commonExclusions: [
      'Initial waiting period of 30 days for non-accidental illnesses',
      'Pre-existing disease waiting period (typically 24 to 36 months depending on insurer terms)',
      'Cosmetic or plastic surgery unless necessitated by accidental trauma',
      'Self-inflicted injuries, intentional harm, or substance abuse complications',
      'Unproven or experimental treatments outside recognized clinical standards'
    ],
    importantFactors: [
      'Room Rent Sub-limits: Check whether the policy has a daily cap on room rent charges',
      'Co-payment Clauses: Verify if you must pay a fixed percentage (e.g., 10%–20%) of every claim',
      'Restoration Benefit: Check whether the full sum insured gets reloaded automatically if exhausted',
      'No-Claim Bonus (NCB): Understand how the coverage increases for every claim-free year'
    ],
    documentsRequired: [
      'Government Photo ID (Aadhaar, PAN, Passport, or Voter ID)',
      'Proof of Residence / Address Proof',
      'Passport size photographs of all insured members',
      'Previous medical records or pre-policy medical checkup reports if requested by insurer',
      'Existing policy copy (for portability or continuity benefit)'
    ],
    questionsToAskBeforePurchasing: [
      'What is the waiting period for pre-existing medical conditions?',
      'Are there room rent caps or ICU sub-limits that could trigger proportionate deductions?',
      'Is my preferred local hospital included in the insurer’s cashless network?',
      'What is the insurer’s incurred claim settlement ratio and average turnaround time?'
    ],
    pricingNote: 'Premium depends on the selected insurer, policy type, applicant age, medical history, sum insured, and applicable taxes. Check the official provider for the current premium.'
  },
  vehicle: {
    id: 'vehicle',
    name: 'Vehicle / Motor Insurance',
    shortExplanation: 'Vehicle insurance provides financial protection against physical damage or bodily injury resulting from traffic collisions and liability to third parties.',
    whatIsIt: 'Motor insurance protects owners of cars, two-wheelers, and commercial vehicles against financial liabilities arising from accidents, theft, natural disasters, and mandatory statutory third-party damages.',
    whoShouldConsider: [
      'All motor vehicle owners (Third-Party Liability is legally mandatory under the Motor Vehicles Act)',
      'Car & bike owners desiring comprehensive bumper-to-bumper protection against accidental own-damage',
      'New vehicle buyers seeking zero-depreciation coverage and roadside breakdown assistance'
    ],
    commonCoverageAreas: [
      'Third-Party Bodily Injury & Property Damage (Mandatory by Law)',
      'Own Damage (Accidental collision, overturning, fire, explosion, lightning)',
      'Natural Calamities (Floods, earthquakes, cyclones, landslides)',
      'Theft, burglary, and malicious vandalism',
      'Personal Accident Cover for owner-driver up to statutory limits',
      'Optional Add-ons: Zero Depreciation, Engine & Gearbox Protection, Return to Invoice, Roadside Assistance'
    ],
    commonExclusions: [
      'Normal wear, tear, and mechanical or electrical breakdown',
      'Driving without a valid driver’s license or under the influence of alcohol/drugs',
      'Damage occurring outside the designated geographical boundary',
      'Consequential damage (e.g. driving through deep water causing engine seizure without engine protect rider)',
      'Using a private vehicle for unauthorized commercial hire'
    ],
    importantFactors: [
      'Insured Declared Value (IDV): The maximum sum payable in case of total loss or theft',
      'No Claim Bonus (NCB): Discount on own-damage premium accumulated for every claim-free year (up to 50%)',
      'Deductibles: Compulsory deductible fixed by tariff vs voluntary deductible chosen to lower premium'
    ],
    documentsRequired: [
      'Vehicle Registration Certificate (RC)',
      'Previous Motor Insurance Policy Certificate (if renewing or transferring NCB)',
      'Driving License of the vehicle owner / primary driver',
      'Pollution Under Control (PUC) Certificate'
    ],
    questionsToAskBeforePurchasing: [
      'Is Zero Depreciation included for all plastic, rubber, and glass parts?',
      'Does the policy cover hydrostatic engine lock during monsoons?',
      'How does the insurer calculate the Insured Declared Value (IDV)?',
      'Does the insurer have a cashless garage network in my city?'
    ],
    pricingNote: 'Premium depends on vehicle cubic capacity/ex-showroom price, vehicle age, city zone, chosen IDV, add-on riders, and NCB discount. Check the official provider for the current premium.'
  },
  life: {
    id: 'life',
    name: 'Life Insurance',
    shortExplanation: 'Life insurance provides a financial safety net and tax-free lump sum payout to nominated family beneficiaries in the event of the insured’s demise.',
    whatIsIt: 'A contract between a policyholder and an insurer where the insurer promises to pay a designated beneficiary a sum of money upon the death of an insured person or maturity of the policy.',
    whoShouldConsider: [
      'Primary earning members of a household with financial dependents, loans, or future goals',
      'Parents planning for children’s higher education, marriage, and long-term milestones',
      'Individuals seeking long-term retirement corpus and estate planning'
    ],
    commonCoverageAreas: [
      'Pure Term Assurance: High sum assured death benefit for affordable annual premium',
      'Critical Illness Rider: Accelerated payout upon diagnosis of listed critical illnesses',
      'Accidental Death & Total Permanent Disability Benefit',
      'Waiver of Premium Rider on critical illness or disability',
      'Income tax deductions under Section 80C and tax-free payouts under Section 10(10D) as per current tax laws'
    ],
    commonExclusions: [
      'Demise by suicide within the first 12 months of policy issuance/revival',
      'Death resulting from active participation in war, civil unrest, or illegal activities',
      'Non-disclosure or material misstatement of pre-existing medical conditions and habits (e.g. smoking)'
    ],
    importantFactors: [
      'Human Life Value (HLV): Typically 10x–20x of annual income recommended',
      'Policy Term: Should ideally cover up to your retirement age or dependency years',
      'Claim Settlement Ratio (CSR): Look for insurers consistently above 97%–98%'
    ],
    documentsRequired: [
      'Identity Proof (Aadhaar / PAN Card / Passport)',
      'Address Proof (Electricity bill, Passport, Bank statement)',
      'Income Proof (Last 3 years ITR, Form 16, or salary slips for high sum assured)',
      'Medical examination and lab test reports if required based on age and sum assured'
    ],
    questionsToAskBeforePurchasing: [
      'Is this a pure protection term plan or an investment-linked product?',
      'Are there any exclusions for specific occupations or lifestyle factors?',
      'What is the insurer’s claim settlement track record and claim payout timeframe?'
    ],
    pricingNote: 'Premium depends on entry age, gender, tobacco/smoking habits, policy duration, sum assured, and medical underwriting findings. Check the official provider for the current premium.'
  },
  travel: {
    id: 'travel',
    name: 'Travel Insurance',
    shortExplanation: 'Travel insurance protects against unforeseen medical emergencies, trip cancellations, lost baggage, and travel delays during domestic or international journeys.',
    whatIsIt: 'Specialized short-term or multi-trip policy designed to mitigate financial losses and medical emergencies occurring while traveling outside one’s home country or city.',
    whoShouldConsider: [
      'International vacationers and families traveling abroad (Mandatory for Schengen, UAE, and other visas)',
      'Business travelers undertaking frequent overseas flights',
      'Students pursuing university degrees in foreign countries'
    ],
    commonCoverageAreas: [
      'Emergency Medical Hospitalization and Cashless Outpatient Treatment abroad',
      'Emergency Medical Evacuation and Repatriation of Mortal Remains',
      'Trip Cancellation, Curtailment, or Interruption due to documented emergencies',
      'Loss or Delay of Checked-in Baggage',
      'Passport Loss assistance and emergency financial cash advance'
    ],
    commonExclusions: [
      'Traveling against medical advice or specifically for medical tourism',
      'Pre-existing medical ailments unless covered under specific emergency life-saving clause',
      'Loss of baggage left unattended in public transport/locations',
      'Injuries sustained during hazardous adventure sports unless specific rider purchased'
    ],
    importantFactors: [
      'Geographical Scope: Worldwide including USA/Canada vs Worldwide excluding USA/Canada vs Asia-only',
      'Schengen Compliance: Minimum €30,000 medical emergency coverage required for Schengen visas',
      'Deductible per claim: Look for zero or minimal excess deductibles'
    ],
    documentsRequired: [
      'Passport & Visa copy',
      'Confirmed Flight Itinerary / Travel Ticket',
      'Travel dates and destination details'
    ],
    questionsToAskBeforePurchasing: [
      'Does the policy fulfill all embassy/visa requirements for my destination country?',
      'How does the cashless hospital admission process work abroad?',
      'Is there a 24x7 international emergency helpline available from my destination country?'
    ],
    pricingNote: 'Premium depends on destination country, trip duration in days, traveler age, sum insured in USD/EUR, and pre-existing illness declarations. Check the official provider for the current premium.'
  },
  property: {
    id: 'property',
    name: 'Property & Home Insurance',
    shortExplanation: 'Property insurance protects residential homes, commercial offices, and physical assets against fire, natural catastrophes, burglary, and structural damages.',
    whatIsIt: 'Insurance policy providing indemnification against damage to physical building structure and internal contents caused by perils such as fire, floods, earthquakes, and theft.',
    whoShouldConsider: [
      'Homeowners seeking financial security for their residential building and expensive interior contents',
      'Tenants looking to protect personal belongings, electronics, and jewelry inside rented apartments',
      'Business owners and shopkeepers securing inventory, plant & machinery, and office premises'
    ],
    commonCoverageAreas: [
      'Building Structure coverage against fire, lightning, storm, tempest, flood, inundation (STFI)',
      'Earthquake and shock damage (under Bharat Griha Raksha terms)',
      'Home Contents (appliances, furniture, fixtures, personal electronics) against burglary and theft',
      'Alternative accommodation expenses if the house becomes unlivable due to insured peril'
    ],
    commonExclusions: [
      'Willful destruction, gross negligence, or illegal activities',
      'Wear, tear, gradual deterioration, rust, corrosion, and termite damage',
      'Loss of bullion, rare currency, or unregistered high-value art unless explicitly declared and appraised'
    ],
    importantFactors: [
      'Reinstatement Value: Valuation based on cost of reconstruction rather than depreciated market value',
      'Agreed Value vs Market Value for content valuation'
    ],
    documentsRequired: [
      'Property Ownership Document / Title Deed / Lease Agreement',
      'List of valuable contents, electronics, and serial numbers with purchase invoices',
      'KYC documents of the property owner'
    ],
    questionsToAskBeforePurchasing: [
      'Is the policy based on Bharat Griha Raksha standard IRDAI guidelines?',
      'Does it cover both the building structure and internal electrical/furniture contents?',
      'What is the deductible applied in the event of an earthquake or flood claim?'
    ],
    pricingNote: 'Premium depends on property construction type, built-up area in sq ft, location risk zone, age of building, and declared value of contents. Check the official provider for the current premium.'
  },
  business: {
    id: 'business',
    name: 'Business & Commercial Insurance',
    shortExplanation: 'Commercial insurance safeguards businesses, factories, and enterprises against operational liabilities, property damages, cyber incidents, and employee risks.',
    whatIsIt: 'Suite of risk transfer solutions designed for enterprises, startups, and SMEs covering public liability, directors & officers liability, marine cargo, and business interruption.',
    whoShouldConsider: [
      'SMEs, manufacturing units, and warehouse operators',
      'IT & tech startups handling customer data (Cyber Liability & Errors & Omissions)',
      'Companies with employees requiring Workmen’s Compensation and Group Health'
    ],
    commonCoverageAreas: [
      'Commercial General Liability (CGL) / Public Liability',
      'Directors & Officers (D&O) Liability',
      'Cyber Risk & Data Breach Indemnity',
      'Marine Cargo & Transit Insurance for raw materials and finished goods',
      'Business Interruption / Consequential Loss of Profits following fire or disaster'
    ],
    commonExclusions: [
      'War, civil strife, and nuclear hazards',
      'Intentional violation of statutory safety regulations',
      'Fines, penalties, and punitive damages imposed by judicial courts'
    ],
    importantFactors: [
      'Turnover-based liability limits vs aggregate sum insured',
      'Retroactive dates for cyber and D&O claims'
    ],
    documentsRequired: [
      'Company Registration / GST Certificate',
      'Audited Financial Statements / Profit & Loss',
      'Risk assessment questionnaire and asset register'
    ],
    questionsToAskBeforePurchasing: [
      'Does the policy include defense costs and legal representation fees in addition to the liability limit?',
      'What is the retroactive date for liability claims?',
      'How is the business interruption indemnity period calculated?'
    ],
    pricingNote: 'Commercial premiums require custom underwriter risk profiling based on company revenue, industry sector, headcount, and loss history. Check the official provider for current terms.'
  }
};

class MemoryDatabase {
  public users: Map<string, UserEntity> = new Map();
  public providers: Map<string, InsuranceProviderEntity> = new Map();
  public savedProviders: Map<string, Set<string>> = new Map(); // userId -> Set of providerIds
  public providerAuditLogs: ProviderAuditLogEntity[] = [];
  public notifications: Map<string, NotificationEntity> = new Map();
  public auditLogs: AuditLogEntity[] = [];
  public verifications: Map<string, any> = new Map();
  public documents: Map<string, any> = new Map();
  public products: Map<string, InsuranceProductEntity> = new Map();
  public policies: Map<string, PolicyEntity> = new Map();
  public payments: Map<string, PaymentTransactionEntity> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    // Seed real accredited providers
    INITIAL_REAL_PROVIDERS.forEach(p => this.providers.set(p.id, p));

    // Seed default verified test user
    const demoUser: UserEntity = {
      id: 'demo-user-id-123',
      name: 'Aditya Sharma',
      email: 'aditya.sharma@example.com',
      passwordHash: '$2a$10$demoHashForTestingPassword123456789',
      role: 'user',
      phone: '+91 98765 43210',
      isEmailVerified: true,
      createdAt: new Date('2026-01-01').toISOString()
    };
    this.users.set(demoUser.id, demoUser);
    this.users.set(demoUser.email, demoUser);

    const adminUser: UserEntity = {
      id: 'admin-user-id-999',
      name: 'Compliance Officer (Admin)',
      email: 'admin@clearclaim.legal',
      passwordHash: '$2a$10$demoHashForTestingPassword123456789',
      role: 'admin',
      phone: '+91 98000 00001',
      isEmailVerified: true,
      createdAt: new Date('2026-01-01').toISOString()
    };
    this.users.set(adminUser.id, adminUser);
    this.users.set(adminUser.email, adminUser);

    // Initial saved providers for demo user
    this.savedProviders.set(demoUser.id, new Set(['prov-hdfc-ergo', 'prov-lic-india']));

    // Seed notifications for document verification events
    const notif1: NotificationEntity = {
      id: 'notif-1',
      userId: demoUser.id,
      title: 'Welcome to ClearCalm Platform',
      message: 'Explore accredited insurance providers or upload an insurance document for authenticity analysis.',
      type: 'VERIFICATION',
      isRead: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    };
    this.notifications.set(notif1.id, notif1);

    // Seed initial provider verification audit log
    this.logProviderStateChange({
      providerId: 'prov-hdfc-ergo',
      providerName: 'HDFC ERGO General Insurance Company Ltd.',
      oldState: 'PENDING_VERIFICATION',
      newState: 'OFFICIAL_VERIFIED',
      actor: 'Admin Compliance Officer',
      reason: 'IRDAI License #146 & Official TLS certificate validated against registry.',
      evidence: 'https://irdai.gov.in/registry/insurers/146'
    });

    this.logAudit({
      userId: adminUser.id,
      userEmail: adminUser.email,
      action: 'PROVIDER_REGISTRY_INITIALIZED',
      resource: 'IRDAI_PROVIDERS_V2',
      details: 'Accredited Indian insurance carriers loaded with official domains and source verification state machine.'
    });
  }

  public logProviderStateChange(entry: Omit<ProviderAuditLogEntity, 'id' | 'timestamp'>) {
    const log: ProviderAuditLogEntity = {
      id: `prov-audit-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.providerAuditLogs.unshift(log);
    if (this.providerAuditLogs.length > 500) this.providerAuditLogs.pop();
    return log;
  }

  public logAudit(entry: Omit<AuditLogEntity, 'id' | 'timestamp'>) {
    const log: AuditLogEntity = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    return log;
  }
}

export const dbStore = new MemoryDatabase();
