import React from 'react';
import { TokenizeAssetWizard } from '../../components/forms/TokenizeAssetWizard';
import { Building2, ShieldCheck } from 'lucide-react';

export const TokenizeAssetPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#1E293B]">
        <h1 className="text-2xl font-bold font-display text-white">Tokenize a Real World Asset</h1>
        <p className="text-xs text-gray-400">
          Complete the 5-stage institutional asset submission protocol for verification & marketplace listing
        </p>
      </div>

      <TokenizeAssetWizard />
    </div>
  );
};
