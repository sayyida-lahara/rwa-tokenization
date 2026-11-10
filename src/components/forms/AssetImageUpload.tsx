import React, { useState, useRef, useCallback } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Star,
  Plus,
  Link,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import type { AssetCategory } from '../../types';

interface AssetImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  category?: AssetCategory;
}

export const CATEGORY_PRESET_IMAGES: Record<AssetCategory, string[]> = {
  Commercial: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
  ],
  Residential: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  ],
  Industrial: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
  ],
  Gold: [
    'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
  ],
  Infrastructure: [
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  ],
  'Renewable Energy': [
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
  ],
};

export const AssetImageUpload: React.FC<AssetImageUploadProps> = ({
  images,
  onChange,
  category = 'Commercial',
}) => {
  const { showSuccess, showInfo, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef<number>(0);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  // Drag and drop event handlers
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

  const processImageFiles = useCallback(
    (files: FileList | File[]) => {
      const newUrls: string[] = [];

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) {
          showError('Invalid File', `${file.name} is not an image file (PNG, JPG, WebP supported)`);
          return;
        }
        const blobUrl = URL.createObjectURL(file);
        newUrls.push(blobUrl);
      });

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
        showSuccess(
          'Pictures Added',
          `Added ${newUrls.length} picture${newUrls.length > 1 ? 's' : ''} to asset showcase`
        );
      }
    },
    [images, onChange, showError, showSuccess]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processImageFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [processImageFiles]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('blob:')) {
      showError('Invalid URL', 'Please enter a valid HTTP or HTTPS image URL');
      return;
    }

    onChange([...images, trimmed]);
    setUrlInput('');
    setShowUrlInput(false);
    showSuccess('Picture Added', 'Image URL added to asset gallery');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    showInfo('Picture Removed', 'Image removed from asset gallery');
  };

  const handleSetCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const coverItem = images[indexToCover];
    const rest = images.filter((_, idx) => idx !== indexToCover);
    onChange([coverItem, ...rest]);
    showSuccess('Cover Picture Updated', 'Selected image set as primary asset cover');
  };

  const handleLoadPresets = () => {
    const presets = CATEGORY_PRESET_IMAGES[category] || CATEGORY_PRESET_IMAGES.Commercial;
    // Append non-duplicate presets
    const combined = Array.from(new Set([...images, ...presets]));
    onChange(combined);
    showSuccess(
      'Curated Photos Loaded',
      `Loaded ${presets.length} high-resolution ${category} photos`
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-gray-300 block">
            Asset Pictures & Media Showcase *
          </label>
          <span className="text-[11px] text-gray-400">
            Upload high-resolution photography. The first picture acts as the primary marketplace cover.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadPresets}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition-colors"
            title={`Load high-res demo photos for ${category}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated {category} Photos</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0F1626] hover:bg-[#1E293B] text-gray-300 border border-[#22304E] text-[11px] font-medium transition-colors"
          >
            <Link className="w-3.5 h-3.5" />
            <span>Add via URL</span>
          </button>
        </div>
      </div>

      {/* URL Input Bar */}
      {showUrlInput && (
        <form onSubmit={handleAddUrl} className="flex gap-2 p-2.5 rounded-xl bg-[#0F1626] border border-[#22304E]">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
            className="flex-1 bg-[#151D30] border border-[#22304E] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Add Photo
          </button>
        </form>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 select-none ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(0,229,255,0.25)] scale-[1.01]'
            : 'border-[#22304E] bg-[#0F1626]/70 hover:bg-[#131D31] hover:border-cyan-500/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isDragging
                ? 'bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30 scale-110'
                : 'bg-blue-600/10 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <UploadCloud className="w-5 h-5" />
          </div>

          <div>
            <p className="text-xs font-semibold text-white">
              {isDragging ? (
                <span className="text-cyan-300">Drop pictures here to add...</span>
              ) : (
                <>
                  Drag & Drop asset pictures here, or{' '}
                  <span className="text-cyan-400 underline underline-offset-2">browse files</span>
                </>
              )}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Supports JPG, PNG, WebP (high resolution recommended)
            </p>
          </div>
        </div>
      </div>

      {/* Picture Gallery Thumbnails */}
      {images.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Attached Pictures ({images.length})</span>
            <span>Click ⭐ to set as cover</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {images.map((img, idx) => {
              const isCover = idx === 0;

              return (
                <div
                  key={`${img}-${idx}`}
                  className={`group relative rounded-xl overflow-hidden border bg-[#0F1626] aspect-[4/3] transition-all ${
                    isCover
                      ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                      : 'border-[#1E293B] hover:border-gray-500'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Asset photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlay for controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-90 group-hover:opacity-100 transition-opacity" />

                  {/* Cover Badge or Make Cover Action */}
                  <div className="absolute top-2 left-2">
                    {isCover ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-500 text-[10px] font-bold text-black shadow-md">
                        <Star className="w-3 h-3 fill-black" />
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCover(idx);
                        }}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 hover:bg-cyan-500 hover:text-black text-gray-200 text-[10px] font-semibold border border-white/20 transition-all"
                        title="Set as Primary Cover Picture"
                      >
                        <Star className="w-3 h-3" />
                        Make Cover
                      </button>
                    )}
                  </div>

                  {/* Delete Button */}
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      className="p-1 rounded-md bg-black/70 hover:bg-rose-600 text-gray-300 hover:text-white transition-colors"
                      title="Remove Picture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Photo Index Label */}
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono text-gray-300">
                    Photo {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
