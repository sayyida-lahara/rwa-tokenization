import React from 'react';
import type { DocumentItem } from '../../types';
import { FileText, Download, ShieldCheck, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface LegalDocsListProps {
  documents: DocumentItem[];
}

export const LegalDocsList: React.FC<LegalDocsListProps> = ({ documents }) => {
  const { showSuccess } = useToast();

  const handleDownload = (doc: DocumentItem) => {
    showSuccess('Downloading Document', `Sample verification copy: ${doc.name} (${doc.size})`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white font-display">Legal Due Diligence</h3>
        <span className="text-xs text-gray-400">Audited & Verified</span>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] hover:border-[#2C3E63] transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {doc.name}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                  <span className="uppercase font-mono text-cyan-400 font-bold">{doc.type}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>Verified: {doc.verifiedDate}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload(doc)}
              className="p-2 rounded-lg bg-[#151D30] hover:bg-blue-600 border border-[#22304E] hover:border-blue-500 text-gray-300 hover:text-white transition-all shrink-0 ml-2"
              title="Download Sample PDF"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
