import React from 'react';
import type { FinancialInfo } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { DollarSign, Calendar, TrendingUp, Percent, ShieldCheck } from 'lucide-react';

interface FinancialBreakdownProps {
  financialInfo: FinancialInfo;
  totalValuation: number;
}

export const FinancialBreakdown: React.FC<FinancialBreakdownProps> = ({
  financialInfo,
  totalValuation,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white font-display">
          Financial & Cash Flow Breakdown
        </h3>
        <span className="text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 font-medium">
          Sample Financial Modeling
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gross Annual Revenue</span>
          </div>
          <p className="text-lg font-bold font-display text-white">
            {formatCurrency(financialInfo.grossAnnualRentalIncome)}
          </p>
          <p className="text-[11px] text-gray-500">Contracted annual revenue</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Net Operating Income (NOI)</span>
          </div>
          <p className="text-lg font-bold font-display text-emerald-400">
            {formatCurrency(financialInfo.netOperatingIncome)}
          </p>
          <p className="text-[11px] text-gray-500">Distributable cash flows</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>Dividend Payout Frequency</span>
          </div>
          <p className="text-lg font-bold font-display text-white">
            {financialInfo.dividendFrequency}
          </p>
          <p className="text-[11px] text-gray-500">
            Next payout: {financialInfo.nextDistributionDate}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Percent className="w-3.5 h-3.5 text-blue-400" />
            <span>Management & SPV Fee</span>
          </div>
          <p className="text-lg font-bold font-display text-white">
            {formatPercent(financialInfo.propertyManagementFeePercent)}
          </p>
          <p className="text-[11px] text-gray-500">Inclusive of audit & custodial</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>5-Yr Capital Appreciation</span>
          </div>
          <p className="text-lg font-bold font-display text-cyan-400">
            +{formatPercent(financialInfo.capitalAppreciationEstimate)} / yr
          </p>
          <p className="text-[11px] text-gray-500">Independent appraiser projection</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Unleveraged Cap Rate</span>
          </div>
          <p className="text-lg font-bold font-display text-emerald-400">
            {((financialInfo.netOperatingIncome / totalValuation) * 100).toFixed(2)}%
          </p>
          <p className="text-[11px] text-gray-500">Underlying unlevered yield</p>
        </div>
      </div>
    </div>
  );
};
