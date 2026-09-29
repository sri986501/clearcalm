import React, { useState } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, AlertTriangle, CreditCard, 
  ArrowRight, Shield, User, FileText, Lock, Sparkles, Download, Check
} from 'lucide-react';
import { InsuranceProduct } from '../../store/useProductStore';
import { usePolicyStore, PolicyItem } from '../../store/usePolicyStore';
import { useAuthStore } from '../../store/useAuthStore';

interface PurchaseModalProps {
  product: InsuranceProduct;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (policy: PolicyItem) => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuthStore();
  const { createPaymentOrder, verifyPaymentAndIssuePolicy, isPurchasing } = usePolicyStore();

  const [step, setStep] = useState<'config' | 'details' | 'review' | 'payment' | 'success'>('config');
  const [selectedCoverage, setSelectedCoverage] = useState(product.sumInsured);
  const [tenureYears, setTenureYears] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('UPI / Instant NetBanking');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [generatedPolicy, setGeneratedPolicy] = useState<PolicyItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(user?.name || 'Aditya Sharma');
  const [email, setEmail] = useState(user?.email || 'aditya.sharma@example.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [nomineeName, setNomineeName] = useState('Pooja Sharma');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');

  if (!isOpen) return null;

  // Premium calculations
  const basePremium = product.annualPremiumBase;
  const coverageRatio = selectedCoverage / product.sumInsured;
  const rawAnnualPremium = Math.round(basePremium * coverageRatio);
  const totalPremium = rawAnnualPremium * tenureYears;
  const gstTax = Math.round(totalPremium * 0.18);
  const finalPayable = totalPremium + gstTax;

  const handleCreateOrder = async () => {
    setErrorMsg(null);
    try {
      const order = await createPaymentOrder({
        productId: product.id || product._id || '',
        coverageAmount: selectedCoverage,
        tenureYears,
        customerDetails: { name, email, phone, nomineeName, nomineeRelation }
      });
      setCreatedOrder(order);
      setStep('payment');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate secure order');
    }
  };

  const handleSimulatePayment = async () => {
    setErrorMsg(null);
    try {
      const mockPaymentId = `pay_mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const policy = await verifyPaymentAndIssuePolicy({
        orderId: createdOrder?.orderId || `order_${Date.now()}`,
        paymentId: mockPaymentId,
        amount: finalPayable,
        currency: 'INR',
        productId: product.id || product._id || '',
        coverageAmount: selectedCoverage,
        tenureYears,
        customerDetails: { name, email, phone, nomineeName, nomineeRelation },
        paymentMethod
      });
      setGeneratedPolicy(policy);
      setStep('success');
      onSuccess(policy);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment verification failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#131924] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {step === 'success' ? 'Policy Generated Successfully' : 'Secure Online Policy Issuance'}
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">
                {product.planName} · {product.providerName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        {step !== 'success' && (
          <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold">
            <span className={step === 'config' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400'}>
              1. Coverage &amp; Tenure
            </span>
            <span>→</span>
            <span className={step === 'details' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400'}>
              2. Insured Details
            </span>
            <span>→</span>
            <span className={step === 'review' || step === 'payment' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400'}>
              3. Payment &amp; Policy
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Configuration */}
          {step === 'config' && (
            <div className="space-y-4 text-xs">
              
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-1">
                <span className="font-bold text-blue-900 dark:text-blue-200">{product.planName}</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">{product.tagline}</p>
              </div>

              {/* Sum Insured Tier Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Select Desired Sum Insured / Coverage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[product.sumInsured * 0.5, product.sumInsured, product.sumInsured * 2].map((cov) => (
                    <button
                      key={cov}
                      type="button"
                      onClick={() => setSelectedCoverage(cov)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedCoverage === cov
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <span className="block text-xs">₹{(cov / 100000).toFixed(1)} Lakhs</span>
                      <span className="text-[10px] text-slate-500 block">Coverage</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Policy Tenure */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Select Policy Term Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((yrs) => (
                    <button
                      key={yrs}
                      type="button"
                      onClick={() => setTenureYears(yrs)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        tenureYears === yrs
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <span className="block text-xs">{yrs} {yrs === 1 ? 'Year' : 'Years'}</span>
                      <span className="text-[10px] text-slate-500 block">{yrs === 1 ? 'Standard Term' : `${yrs * 5}% Multi-year Discount`}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Quote Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500">Estimated Annual Premium</span>
                  <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                    ₹{finalPayable.toLocaleString('en-IN')}
                    <span className="text-[10px] font-normal text-slate-500 ml-1">(incl. 18% GST)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: Insured & Nominee Information */}
          {step === 'details' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">
                Enter Primary Policyholder &amp; Nominee Details
              </h4>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Nominee Full Name</label>
                  <input
                    type="text"
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Relationship to Nominee</label>
                  <select
                    value={nomineeRelation}
                    onChange={(e) => setNomineeRelation(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('config')}
                  className="btn-secondary !py-2 !px-3 text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="btn-primary !py-2 !px-4 text-xs font-bold"
                >
                  Review Policy Terms
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Review & Summary */}
          {step === 'review' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">
                Review Policy Schedule &amp; Premium Breakdown
              </h4>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{product.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{product.providerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Policyholder</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{name} ({phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Sum Insured</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">₹{selectedCoverage.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{tenureYears} Year(s)</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold">
                  <span>Total Payable Amount</span>
                  <span className="text-base text-green-600 dark:text-green-400">₹{finalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="btn-secondary !py-2 !px-3 text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isPurchasing}
                  onClick={handleCreateOrder}
                  className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <Lock size={14} />
                  <span>Proceed to Payment</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: Mock Secure Payment Gateway */}
          {step === 'payment' && (
            <div className="space-y-4 text-xs">
              
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} />
                  <span className="font-bold">Razorpay / Stripe Mock Payment Gateway</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-200/60 dark:bg-purple-900/60 font-bold">
                  SANDBOX
                </span>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">Choose Payment Method</label>
                {['UPI / Instant NetBanking', 'Credit / Debit Card (Mock)', 'Corporate Direct Transfer'].map((m) => (
                  <label 
                    key={m}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      paymentMethod === m ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === m}
                        onChange={() => setPaymentMethod(m)}
                        className="text-blue-600"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{m}</span>
                    </div>
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-bold">Verified Instant</span>
                  </label>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
                Order ID: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{createdOrder?.orderId}</span>. The server will cryptographically verify payment signatures prior to provisioning policy issuance.
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="btn-secondary !py-2 !px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPurchasing}
                  onClick={handleSimulatePayment}
                  className="btn-primary !py-2.5 !px-5 text-xs font-bold flex items-center gap-2"
                >
                  {isPurchasing ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <Lock size={14} />
                  )}
                  <span>Pay ₹{finalPayable.toLocaleString('en-IN')} &amp; Generate Policy</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 5: Success & Policy Certificate */}
          {step === 'success' && generatedPolicy && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Insurance Policy Successfully Bound
                </h3>
                <p className="text-xs text-slate-500">
                  Server-side payment verification confirmed. Your digital policy certificate is active.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Policy Number:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{generatedPolicy.policyNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Policyholder:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{generatedPolicy.policyHolderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coverage Amount:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{Number(generatedPolicy.coverageAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Term:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{generatedPolicy.startDate} to {generatedPolicy.expiryDate}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={`/api/policies/${generatedPolicy.policyNumber}/certificate`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Download Digital Certificate</span>
                </a>
                <button
                  onClick={onClose}
                  className="btn-secondary !py-2 !px-4 text-xs font-semibold"
                >
                  Close &amp; View in Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
