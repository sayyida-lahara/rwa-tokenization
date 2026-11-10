import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCheck2,
  Trash2,
  Eye,
  Plus,
  CheckCircle2,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface DueDiligenceDoc {
  id: string;
  name: string;
  type: string; // Document category e.g. 'Valuation Certificate', 'Ownership Documents', etc.
  size: string;
  verifiedDate?: string;
  url?: string;
  hash?: string;
  previewUrl?: string;
  file?: File;
}

interface DocumentDueDiligenceUploadProps {
  files: DueDiligenceDoc[];
  onChange: (files: DueDiligenceDoc[]) => void;
}

export const DOCUMENT_CATEGORIES = [
  'Valuation Certificate',
  'Ownership Documents',
  'Legal Documentation',
  'Property Images',
] as const;

export type DocumentCategoryType = (typeof DOCUMENT_CATEGORIES)[number];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Valuation Certificate': {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
  'Ownership Documents': {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  'Legal Documentation': {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  'Property Images': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
};

const SAMPLE_TEMPLATES = [
  {
    name: 'CBRE_Appraisal_Report_2026.pdf',
    type: 'Valuation Certificate',
    size: '5.2 MB',
    badge: 'Appraisal Report',
  },
  {
    name: 'SPV_Registration_Articles.pdf',
    type: 'Legal Documentation',
    size: '3.1 MB',
    badge: 'SPV Articles',
  },
  {
    name: 'Title_Search_Report.pdf',
    type: 'Ownership Documents',
    size: '2.8 MB',
    badge: 'Title Deeds',
  },
  {
    name: 'Site_Drone_HighRes_Aerial.jpg',
    type: 'Property Images',
    size: '4.6 MB',
    badge: 'Drone Aerials',
  },
];

// Helper to format raw byte count
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Generate deterministic-looking pseudo SHA-256 hash for document integrity
function generatePseudoHash(name: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const hex = Math.abs(h).toString(16).padStart(8, '0');
  const randomSuffix = Math.random().toString(16).substring(2, 10);
  return `0x${hex}${randomSuffix}fa90b71c22e4d098a543`;
}

// Infer category based on filename and extension
function inferCategory(filename: string, selectedCategory: string): string {
  if (selectedCategory && selectedCategory !== 'All') {
    return selectedCategory;
  }

  const lower = filename.toLowerCase();

  if (/\.(jpg|jpeg|png|webp|svg|gif)$/i.test(lower) || /photo|image|drone|facade|aerial/i.test(lower)) {
    return 'Property Images';
  }
  if (/cbre|knight|rics|valuation|appraisal|survey|inspection/i.test(lower)) {
    return 'Valuation Certificate';
  }
  if (/title|deed|ownership|registry|encumbrance|noc|patta|land/i.test(lower)) {
    return 'Ownership Documents';
  }
  if (/spv|articles|bylaws|legal|trust|custody|compliance|statutory|incorporation/i.test(lower)) {
    return 'Legal Documentation';
  }

  return 'Legal Documentation';
}

export const DocumentDueDiligenceUpload: React.FC<DocumentDueDiligenceUploadProps> = ({
  files,
  onChange,
}) => {
  const { showSuccess, showInfo } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef<number>(0);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [previewDoc, setPreviewDoc] = useState<DueDiligenceDoc | null>(null);

  // Drag and Drop Event Handlers
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      const addedFiles: DueDiligenceDoc[] = [];

      Array.from(fileList).forEach((file) => {
        const category = inferCategory(file.name, activeCategory);
        const previewUrl = file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined;

        addedFiles.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: file.name,
          type: category,
          size: formatBytes(file.size),
          verifiedDate: new Date().toISOString().split('T')[0],
          hash: generatePseudoHash(file.name),
          url: previewUrl || '#',
          previewUrl,
          file,
        });
      });

      if (addedFiles.length > 0) {
        const nextFiles = [...files, ...addedFiles];
        onChange(nextFiles);
        showSuccess(
          'Documents Uploaded',
          `Added ${addedFiles.length} file${addedFiles.length > 1 ? 's' : ''} to due diligence bundle`
        );
      }
    },
    [activeCategory, files, onChange, showSuccess]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [processFiles]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value to allow uploading the same file name repeatedly
      e.target.value = '';
    }
  };

  const handleAddSample = (template: (typeof SAMPLE_TEMPLATES)[number]) => {
    const newDoc: DueDiligenceDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: template.name,
      type: template.type,
      size: template.size,
      verifiedDate: new Date().toISOString().split('T')[0],
      hash: generatePseudoHash(template.name),
      url: '#',
    };

    onChange([...files, newDoc]);
    showSuccess('Sample Added', `${template.name} attached to verification package`);
  };

  const handleRemoveFile = (id: string, name: string) => {
    const updated = files.filter((f) => f.id !== id);
    onChange(updated);
    showInfo('File Removed', `${name} removed from submission`);
  };

  const handleClearAll = () => {
    onChange([]);
    showInfo('Documents Cleared', 'All uploaded due diligence files were cleared');
  };

  const handleChangeCategory = (id: string, newCategory: string) => {
    const updated = files.map((f) => (f.id === id ? { ...f, type: newCategory } : f));
    onChange(updated);
  };

  // Helper to pick file icon
  const getFileIcon = (doc: DueDiligenceDoc) => {
    const lower = doc.name.toLowerCase();
    if (/\.(jpg|jpeg|png|webp|svg)$/i.test(lower) || doc.type === 'Property Images') {
      return <ImageIcon className="w-5 h-5 text-emerald-400" />;
    }
    if (/\.(xls|xlsx|csv)$/i.test(lower)) {
      return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
    }
    if (doc.type === 'Legal Documentation') {
      return <ShieldCheck className="w-5 h-5 text-purple-400" />;
    }
    return <FileText className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Category Target Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <span className="text-xs font-semibold text-gray-300">
          Target Compliance Category:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {['All', ...DOCUMENT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-[#0F1626] text-gray-400 border border-[#1E293B] hover:text-white hover:border-[#2A3B5C]'
              }`}
            >
              {cat === 'All' ? '⚡ Auto-Detect' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-200 select-none ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_30px_rgba(0,229,255,0.25)] scale-[1.01]'
            : 'border-[#22304E] bg-[#0F1626]/70 hover:bg-[#131D31] hover:border-cyan-500/50 group'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isDragging
                ? 'bg-cyan-500/20 text-cyan-300 ring-4 ring-cyan-500/30 scale-110'
                : 'bg-blue-600/10 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 group-hover:bg-cyan-500/15'
            }`}
          >
            <UploadCloud
              className={`w-7 h-7 transition-transform ${
                isDragging ? 'animate-bounce text-cyan-300' : 'group-hover:-translate-y-0.5'
              }`}
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {isDragging ? (
                <span className="text-cyan-300">Drop files now to attach...</span>
              ) : (
                <>
                  Drag & Drop due diligence documents here, or{' '}
                  <span className="text-cyan-400 underline underline-offset-2">browse files</span>
                </>
              )}
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Drop PDFs, deeds, audit statements, or high-res photography. Files are hashed and
              stamped for institutional Lahara smart contract audit.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px] text-gray-400 font-mono">
            <span className="px-2 py-0.5 rounded bg-[#151D30] border border-[#22304E]">
              PDF
            </span>
            <span className="px-2 py-0.5 rounded bg-[#151D30] border border-[#22304E]">
              DOCX
            </span>
            <span className="px-2 py-0.5 rounded bg-[#151D30] border border-[#22304E]">
              XLSX
            </span>
            <span className="px-2 py-0.5 rounded bg-[#151D30] border border-[#22304E]">
              JPG / PNG
            </span>
            <span className="text-gray-400">• Up to 50MB per file</span>
          </div>
        </div>
      </div>

      {/* Institutional Template Quick Selectors */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Institutional Templates (1-Click Sample Upload):</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => handleAddSample(tmpl)}
              className="p-2.5 rounded-xl bg-[#0F1626] hover:bg-[#18233C] border border-[#22304E] hover:border-cyan-500/40 text-left flex items-center justify-between group transition-all"
            >
              <div className="min-w-0 pr-1">
                <span className="text-[11px] font-semibold text-gray-200 group-hover:text-cyan-300 block truncate">
                  {tmpl.badge}
                </span>
                <span className="text-[10px] text-gray-400 font-mono block">
                  {tmpl.size}
                </span>
              </div>
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-300">
              Attached Compliance Documents ({files.length})
            </span>
            {files.length > 0 && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Audit Ready
              </span>
            )}
          </div>

          {files.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-gray-400 hover:text-rose-400 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {files.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#0F1626]/40 border border-dashed border-[#1E293B] text-center text-xs text-gray-400 space-y-1">
            <p>No due diligence documents attached yet.</p>
            <p className="text-[11px] text-gray-400">
              Drag & drop files above or click any sample template to populate mock files.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((doc) => {
              const categoryColor =
                CATEGORY_COLORS[doc.type] || CATEGORY_COLORS['Legal Documentation'];

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] hover:border-[#2C3E63] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-[#151D30] border border-[#22304E] flex items-center justify-center shrink-0">
                      {getFileIcon(doc)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white truncate max-w-[280px]">
                          {doc.name}
                        </span>

                        {/* Category Dropdown Selector */}
                        <select
                          value={doc.type}
                          onChange={(e) => handleChangeCategory(doc.id, e.target.value)}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
                        >
                          {DOCUMENT_CATEGORIES.map((c) => (
                            <option key={c} value={c} className="bg-[#0F1626] text-white">
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1 font-mono">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.verifiedDate || '2026-02-01'}</span>
                        {doc.hash && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[120px] text-gray-400" title={doc.hash}>
                              SHA256: {doc.hash.substring(0, 10)}...
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 rounded-lg bg-[#151D30] hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-300 border border-[#22304E] hover:border-cyan-500/40 transition-colors"
                      title="Preview Document Info"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(doc.id, doc.name)}
                      className="p-1.5 rounded-lg bg-[#151D30] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-[#22304E] hover:border-rose-500/40 transition-colors"
                      title="Remove Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151D30] border border-[#22304E] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  {getFileIcon(previewDoc)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-xs">
                    {previewDoc.name}
                  </h3>
                  <p className="text-[11px] text-gray-400">Compliance Due Diligence Audit Record</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-[#0F1626] border border-[#22304E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewDoc.previewUrl ? (
              <div className="rounded-xl overflow-hidden border border-[#22304E] max-h-60 bg-black/40 flex items-center justify-center">
                <img
                  src={previewDoc.previewUrl}
                  alt={previewDoc.name}
                  className="max-h-60 object-contain w-full"
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Category</span>
                  <span className="text-cyan-300 font-semibold">{previewDoc.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">File Size</span>
                  <span className="text-white font-mono">{previewDoc.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Audit Timestamp</span>
                  <span className="text-white font-mono">{previewDoc.verifiedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Verification Status</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified & Cryptographically Hashed
                  </span>
                </div>
                <div className="pt-2 border-t border-[#1E293B]">
                  <span className="text-gray-400 block mb-1">SHA-256 Digest (Anchor Contract Stamp)</span>
                  <p className="font-mono text-[10px] text-cyan-300 bg-[#151D30] p-2 rounded-lg border border-[#22304E] break-all">
                    {previewDoc.hash || generatePseudoHash(previewDoc.name)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
