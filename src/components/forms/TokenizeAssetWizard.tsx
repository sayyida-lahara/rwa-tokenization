import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import type { AssetCategory } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  DocumentDueDiligenceUpload,
  type DueDiligenceDoc,
} from './DocumentDueDiligenceUpload';
import {
  AssetImageUpload,
  CATEGORY_PRESET_IMAGES,
} from './AssetImageUpload';

export const TokenizeAssetWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitAsset } = useData();
  const { showSuccess, showError } = useToast();

  const [step, setStep] = useState<number>(1);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [submissionId, setSubmissionId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('World Trade Center Tower C');
  const [category, setCategory] = useState<AssetCategory>('Commercial');
  const [images, setImages] = useState<string[]>(CATEGORY_PRESET_IMAGES.Commercial);
  const [address, setAddress] = useState('Brigade Gateway, Rajajinagar');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('Karnataka');
  const [country, setCountry] = useState('India');
  const [description, setDescription] = useState(
    'Prime Grade-A commercial tower featuring 350,000 sq ft leasable area, 97% occupied by multinational software and finance corporations.'
  );

  const handleCategoryChange = (newCat: AssetCategory) => {
    setCategory(newCat);
    const isMatchingPreset = Object.values(CATEGORY_PRESET_IMAGES).some(
      (preset) => JSON.stringify(preset) === JSON.stringify(images)
    );
    if (images.length === 0 || isMatchingPreset) {
      setImages(CATEGORY_PRESET_IMAGES[newCat] || CATEGORY_PRESET_IMAGES.Commercial);
    }
  };

  // Valuation
  const [totalValuation, setTotalValuation] = useState<number>(28000000);
  const [tokenPrice, setTokenPrice] = useState<number>(50);
  const [totalTokenSupply, setTotalTokenSupply] = useState<number>(560000);
  const [minimumInvestment, setMinimumInvestment] = useState<number>(100);

  // Documents
  const [uploadedFiles, setUploadedFiles] = useState<DueDiligenceDoc[]>([
    {
      id: 'doc-init-1',
      name: 'CBRE_Appraisal_Report_2026.pdf',
      type: 'Valuation Certificate',
      size: '5.2 MB',
      verifiedDate: '2026-02-01',
      hash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      url: '#',
    },
    {
      id: 'doc-init-2',
      name: 'SPV_Registration_Articles.pdf',
      type: 'Legal Documentation',
      size: '3.1 MB',
      verifiedDate: '2026-02-01',
      hash: '0x185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969',
      url: '#',
    },
    {
      id: 'doc-init-3',
      name: 'Title_Search_Report.pdf',
      type: 'Ownership Documents',
      size: '2.8 MB',
      verifiedDate: '2026-02-01',
      hash: '0x3f79bb7b435b05321651daefd374cd681b61935c13e0e20b1180df7aef809c99',
      url: '#',
    },
  ]);

  // Ownership
  const [issuerName, setIssuerName] = useState(user.companyName || 'NexGen Capital Properties Ltd');
  const [legalEntity, setLegalEntity] = useState('WTC Bangalore SPV Private Ltd');
  const [structure, setStructure] = useState('Special Purpose Vehicle (SPV) with Trust Deed');
  const [supportingInfo, setSupportingInfo] = useState(
    'Title deeds deposited with Apex Institutional Custodial Trust. Zero outstanding mortgage encumbrance.'
  );

  // Auto-calculate token supply when valuation or price changes
  const handleValuationChange = (val: number) => {
    setTotalValuation(val);
    if (tokenPrice > 0) {
      setTotalTokenSupply(Math.round(val / tokenPrice));
    }
  };

  const handlePriceChange = (price: number) => {
    setTokenPrice(price);
    if (price > 0 && totalValuation > 0) {
      setTotalTokenSupply(Math.round(totalValuation / price));
    }
  };

  const handleSubmit = async () => {
    if (!name || !city || totalValuation <= 0 || tokenPrice <= 0) {
      showError('Validation Error', 'Please ensure all required fields are filled.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine primary gallery photos with any image files uploaded in Step 3
      const propertyImageDocs = uploadedFiles
        .filter((f) => f.type === 'Property Images' && f.previewUrl)
        .map((f) => f.previewUrl as string);
      const finalImages = Array.from(new Set([...images, ...propertyImageDocs]));

      await submitAsset({
        name,
        category,
        totalValuation,
        tokenPrice,
        totalTokenSupply,
        minimumInvestment,
        description,
        images: finalImages.length > 0 ? finalImages : undefined,
        location: {
          address,
          city,
          state,
          country,
          flag: country === 'India' ? '🇮🇳' : country === 'Switzerland' ? '🇨🇭' : '🌐',
        },
        ownership: {
          issuerName,
          entityName: legalEntity,
          structure,
          registrationNumber: `CIN-U${Math.floor(100000 + Math.random() * 900000)}`,
          country,
          supportingInfo,
        },
        documents: uploadedFiles.map((f, idx) => ({
          id: f.id || `doc-${Date.now()}-${idx}`,
          name: f.name,
          type: f.name.toLowerCase().endsWith('.pdf')
            ? 'PDF'
            : f.name.toLowerCase().match(/\.(jpg|jpeg|png)$/)
            ? 'JPG'
            : 'PDF',
          size: f.size,
          verifiedDate: f.verifiedDate || new Date().toISOString().split('T')[0],
          url: f.url || '#',
        })),
        submittedBy: user.email,
      });

      const subId = `RWA-SUB-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmissionId(subId);
      setSubmissionSuccess(true);
      showSuccess('Asset Submitted', `Asset placed in "Pending Verification" with ID: ${subId}`);
    } catch (err: any) {
      showError('Submission Failed', err.message || 'Failed to submit asset offering');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-[#151D30] border border-[#1E293B] text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <h2 className="text-2xl font-bold font-display text-white">
            Asset Submitted for Verification!
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Your real-world asset has been registered and scheduled for compliance audit.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Submission Reference ID</span>
            <span className="font-mono text-cyan-300 font-bold">{submissionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Asset Title</span>
            <span className="text-white font-medium">{name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Proposed Valuation</span>
            <span className="text-white font-medium">{formatCurrency(totalValuation)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Audit Status</span>
            <span className="text-amber-400 font-bold">Pending Compliance Verification</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate('/issuer/assets')}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
          >
            View My Listed Assets
          </button>
          <button
            onClick={() => navigate('/admin/verification')}
            className="flex-1 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition-colors"
          >
            Switch to Admin to Approve
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-[#151D30] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
      {/* Step Indicator Header */}
      <div className="p-6 bg-[#0F1626] border-b border-[#1E293B]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-cyan-400 font-semibold tracking-wider uppercase">
              Step {step} of 5
            </span>
            <h2 className="text-xl font-bold font-display text-white mt-0.5">
              {step === 1 && 'Basic Asset Information'}
              {step === 2 && 'Valuation & Token Structure'}
              {step === 3 && 'Document Due Diligence Upload'}
              {step === 4 && 'Legal Entity & Ownership'}
              {step === 5 && 'Review & Final Submission'}
            </h2>
          </div>
        </div>

        {/* Progress bar across steps */}
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                  : 'bg-[#1E293B]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form Content per Step */}
      <div className="p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                Asset Name / Project Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium Commercial Building – Bangalore"
                className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as AssetCategory)}
                  className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Commercial">Commercial Real Estate</option>
                  <option value="Residential">Residential Real Estate</option>
                  <option value="Industrial">Industrial & Logistics</option>
                  <option value="Gold">Gold & Precious Metals</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Renewable Energy">Renewable Clean Energy</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Street / Zone Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Outer Ring Road, Tech Corridor"
                  className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">State *</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Country *</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                Executive Property Summary & Highlights *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
              />
            </div>

            {/* Asset Pictures Drag & Drop Showcase */}
            <div className="pt-2 border-t border-[#1E293B]">
              <AssetImageUpload
                images={images}
                onChange={setImages}
                category={category}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Total Asset Valuation ($ USD) *
                </label>
                <input
                  type="number"
                  min={100000}
                  step={50000}
                  value={totalValuation}
                  onChange={(e) => handleValuationChange(Number(e.target.value))}
                  className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Target Token Price ($ USD) *
                </label>
                <input
                  type="number"
                  min={1}
                  step={5}
                  value={tokenPrice}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Total Token Supply (Auto)
                </label>
                <input
                  type="text"
                  readOnly
                  value={formatNumber(totalTokenSupply)}
                  className="w-full bg-[#0F1626]/60 border border-[#22304E] rounded-xl px-4 py-2.5 text-sm text-cyan-300 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Minimum Investment ($ USD)
                </label>
                <input
                  type="number"
                  min={10}
                  value={minimumInvestment}
                  onChange={(e) => setMinimumInvestment(Number(e.target.value))}
                  className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1.5 text-xs">
              <span className="font-semibold text-white block">Economic Summary</span>
              <p className="text-gray-400">
                Offering consists of <strong>{formatNumber(totalTokenSupply)}</strong> ERC-3643
                permissioned tokens priced at <strong>${tokenPrice} USDC</strong> each, totaling{' '}
                <strong>{formatCurrency(totalValuation)}</strong>.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-gray-300">
              Drag and drop compliance documents, verified independent appraisal reports, title deeds, and high-resolution photography for institutional verification audit.
            </p>

            <DocumentDueDiligenceUpload
              files={uploadedFiles}
              onChange={setUploadedFiles}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Issuer / Sponsor Legal Entity *
                </label>
                <input
                  type="text"
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Dedicated SPV Entity Name *
                </label>
                <input
                  type="text"
                  value={legalEntity}
                  onChange={(e) => setLegalEntity(e.target.value)}
                  className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                Ownership & Legal Structure *
              </label>
              <input
                type="text"
                value={structure}
                onChange={(e) => setStructure(e.target.value)}
                className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                Custody & Encumbrance Verification Notes
              </label>
              <textarea
                rows={3}
                value={supportingInfo}
                onChange={(e) => setSupportingInfo(e.target.value)}
                className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-3 text-xs">
              <h4 className="text-sm font-semibold text-white font-display">
                Review Tokenization Specification
              </h4>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-gray-400 block">Asset Name</span>
                  <span className="text-white font-semibold text-sm">{name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Category</span>
                  <span className="text-cyan-400 font-semibold">{category}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Proposed Valuation</span>
                  <span className="text-white font-bold font-display text-sm">
                    {formatCurrency(totalValuation)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Token Pricing</span>
                  <span className="text-white font-mono font-bold">
                    ${tokenPrice} ({formatNumber(totalTokenSupply)} supply)
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Audited Documents Attached</span>
                  <span className="text-white font-semibold">{uploadedFiles.length} files</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Blockchain Deployment</span>
                  <span className="text-purple-300 font-mono text-xs font-semibold">
                    Lahara Testnet (Token-2022)
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Anchor Smart Contract</span>
                  <span className="text-cyan-300 font-mono text-xs">
                    assetx_rwa::create_asset_offering
                  </span>
                </div>
              </div>

              {/* Asset Media & Cover Preview */}
              {images.length > 0 && (
                <div className="pt-3 border-t border-[#1E293B]">
                  <span className="text-gray-400 block mb-2 font-semibold">
                    Asset Showcase Photography ({images.length} pictures attached)
                  </span>
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="relative w-20 h-14 rounded-xl overflow-hidden border border-[#22304E] shrink-0 bg-[#0F1626]"
                      >
                        <img
                          src={img}
                          alt={`Asset picture ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {i === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-cyan-500 text-[8px] text-black font-extrabold text-center py-0.5">
                            COVER
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-blue-900/15 border border-blue-500/30 flex items-start gap-2.5 text-xs text-gray-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                By submitting this asset, you confirm that legal SPV title documents and independent valuation reports are ready for compliance review.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-[#1E293B] mt-6">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#22304E] text-xs font-semibold text-gray-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting to Backend...' : 'Submit Asset for Verification'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
