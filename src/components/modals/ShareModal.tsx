import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Copy, Check, Share2 } from 'lucide-react';
import type { Asset } from '../../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, asset }) => {
  const [copied, setCopied] = useState(false);

  if (!asset) return null;

  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/asset/${asset.id}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white font-display">Share Asset Opportunity</h3>
        </div>
      }
      maxWidth="sm"
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-300">
          Share tokenized fractional opportunity for <strong>{asset.name}</strong> with colleagues and investors.
        </p>

        <div className="flex items-center gap-2 bg-[#0F1626] border border-[#1E293B] p-2 rounded-xl">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="bg-transparent text-xs text-gray-300 w-full focus:outline-none select-all px-1 font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="flex gap-2">
          <a
            href={`https://twitter.com/intent/tweet?text=Explore%20tokenized%20RWA%20${encodeURIComponent(asset.name)}%20at%20${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2 text-center text-xs rounded-xl bg-[#0F1626] hover:bg-[#1A243D] border border-[#1E293B] text-gray-200 transition-colors"
          >
            Share on X
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(asset.name)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2 text-center text-xs rounded-xl bg-[#0F1626] hover:bg-[#1A243D] border border-[#1E293B] text-gray-200 transition-colors"
          >
            Telegram
          </a>
        </div>
      </div>
    </Modal>
  );
};
