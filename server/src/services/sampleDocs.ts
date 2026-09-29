export const SAMPLE_DOCUMENTS = [
  {
    _id: 'sample_insurance_policy_01',
    filename: 'Commercial_Property_Insurance_Policy_2026.pdf',
    originalUrl: '/samples/Commercial_Property_Insurance_Policy_2026.pdf',
    pageCount: 3,
    uploadedAt: new Date(Date.now() - 3600000 * 24),
    status: 'ready',
    chunks: [
      {
        chunkId: 'p1-para1',
        page: 1,
        paragraphIndex: 1,
        text: 'CLEARCLAIM INSURANCE CORP - COMMERCIAL PROPERTY POLICY #CP-8849201. Effective Date: January 1, 2026. Policyholder: Apex Enterprise Tech LLC. Total Sum Insured: ₹50,00,000 against fire, theft, natural disasters, and water damage.'
      },
      {
        chunkId: 'p1-para2',
        page: 1,
        paragraphIndex: 2,
        text: 'SECTION A - COVERAGE LIMITS & DEDUCTIBLES. The maximum reimbursement for building structure loss is capped at ₹40,00,000 per occurrence. Equipment and electronic inventory reimbursement is capped at ₹10,00,000. Standard deductible per claim is ₹25,000.'
      },
      {
        chunkId: 'p2-para1',
        page: 2,
        paragraphIndex: 1,
        text: 'SECTION B - EXCLUSIONS & HIGH-RISK CLAUSES. Penalty Clause 4.2: In the event of failure to report property alteration within 14 calendar days, policyholder shall forfeit 50% of the claim payout amount.'
      },
      {
        chunkId: 'p2-para2',
        page: 2,
        paragraphIndex: 2,
        text: 'Automatic Renewal Trap Clause 8.1: This policy automatically renews on December 31 for an additional 12-month term at a 15% rate escalation unless written notice of cancellation is delivered 60 days prior via registered mail.'
      },
      {
        chunkId: 'p3-para1',
        page: 3,
        paragraphIndex: 1,
        text: 'SECTION C - CLAIM ELIGIBILITY & PROOF OF LOSS. Claim must be filed within 30 days of damage occurrence along with certified surveyor evaluation and original receipts. Settlement payout will be processed within 15 business days following final verification.'
      }
    ]
  },
  {
    _id: 'sample_vendor_contract_02',
    filename: 'Master_Services_Agreement_SaaS.pdf',
    originalUrl: '/samples/Master_Services_Agreement_SaaS.pdf',
    pageCount: 2,
    uploadedAt: new Date(Date.now() - 3600000 * 48),
    status: 'ready',
    chunks: [
      {
        chunkId: 'p1-para1',
        page: 1,
        paragraphIndex: 1,
        text: 'MASTER SERVICES AGREEMENT (MSA) between CloudPulse Systems and ClearClaim Solutions. Initial Term: 24 Months commencing March 1, 2026.'
      },
      {
        chunkId: 'p1-para2',
        page: 1,
        paragraphIndex: 2,
        text: 'SLA GUARANTEE & PENALTIES: Vendor guarantees 99.9% uptime uptime monthly. If uptime drops below 99.0%, Customer receives a 25% credit penalty deduction on monthly invoice.'
      },
      {
        chunkId: 'p2-para1',
        page: 2,
        paragraphIndex: 1,
        text: 'LIABILITY & INDEMNIFICATION CLAUSE 12: Aggregate liability of Vendor shall not exceed total fees paid by Customer in the preceding 6 months. Customer indemnifies Vendor against third-party claims arising from unauthorized data input.'
      }
    ]
  }
];
