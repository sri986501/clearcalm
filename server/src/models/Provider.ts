export type ProviderSourceState =
  | 'OFFICIAL_VERIFIED'
  | 'OFFICIAL_POLICY_PAGE'
  | 'SOURCE_CONFIRMED'
  | 'PENDING_VERIFICATION'
  | 'UNVERIFIED'
  | 'UNAVAILABLE'
  | 'BLOCKED'
  | 'UNKNOWN';

export type ProviderSourceType =
  | 'OFFICIAL_PROVIDER'
  | 'OFFICIAL_REGULATORY_SOURCE'
  | 'VERIFIED_DATABASE'
  | 'ADMIN_VERIFIED'
  | 'USER_SUBMITTED'
  | 'THIRD_PARTY'
  | 'UNKNOWN';

export interface InsuranceProviderEntity {
  id: string;
  providerName: string;
  shortName: string;
  tagline: string;
  description: string;
  providerType: 'LIFE' | 'GENERAL' | 'HEALTH' | 'COMPOSITE';
  officialDomain: string;
  providerUrl: string;
  officialPolicyPageUrl?: string;
  sourceType: ProviderSourceType;
  sourceState: ProviderSourceState;
  sourceUrl: string;
  verifiedAt: string;
  lastCheckedAt: string;
  verificationMethod: string;
  regulatoryRegistrationNumber?: string;
  country: string;
  languageSupport: string[];
  categoriesOffered: ('health' | 'vehicle' | 'life' | 'travel' | 'property' | 'business')[];
  rating: string;
  claimSettlementRatio: string;
  customerCareContact: string;
  isPopular?: boolean;
}

export interface InsuranceCategoryGuide {
  id: 'health' | 'vehicle' | 'life' | 'travel' | 'property' | 'business';
  name: string;
  shortExplanation: string;
  whatIsIt: string;
  whoShouldConsider: string[];
  commonCoverageAreas: string[];
  commonExclusions: string[];
  importantFactors: string[];
  documentsRequired: string[];
  questionsToAskBeforePurchasing: string[];
  pricingNote: string;
}

export interface ProviderAuditLogEntity {
  id: string;
  providerId: string;
  providerName: string;
  oldState: ProviderSourceState;
  newState: ProviderSourceState;
  actor: string;
  reason: string;
  evidence: string;
  timestamp: string;
}
