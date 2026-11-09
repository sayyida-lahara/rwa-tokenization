import React, { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, name }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-3">
      {/* Main Large Image */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 border border-[#1E293B] shadow-2xl">
        <img
          src={images[selectedIndex] || images[0]}
          alt={`${name} preview ${selectedIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020]/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {images.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                  isSelected
                    ? 'border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.4)] scale-105'
                    : 'border-[#1E293B] opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
