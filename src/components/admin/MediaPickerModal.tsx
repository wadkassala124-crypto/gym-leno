'use client';

import React, { useState } from 'react';
import { X, Search, Check, Video, Image as ImageIcon, Play } from 'lucide-react';
import { MediaItem } from '@/lib/types';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  filterType?: 'video' | 'image' | 'all';
  title?: string;
  onSelect: (url: string) => void;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  media,
  filterType = 'all',
  title = 'اختيار من مكتبة الوسائط المخزنة',
  onSelect,
}: MediaPickerModalProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'video' | 'image'>(
    filterType === 'all' ? 'all' : filterType
  );

  if (!isOpen) return null;

  const filtered = media.filter((item) => {
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    if (search.trim() && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-gym-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 bg-gym-900 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-black text-white font-display">{title}</h3>
            <p className="text-xs text-gray-400">اضغط على أي ملف لاستخدامه وتطبيقه مباشرة</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-gym-900/60 border-b border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث في الملفات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-gym-lime"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            {filterType === 'all' && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    selectedType === 'all'
                      ? 'bg-gym-lime text-black'
                      : 'bg-gym-850 text-gray-400 hover:text-white'
                  }`}
                >
                  الكل ({media.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('video')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    selectedType === 'video'
                      ? 'bg-gym-lime text-black'
                      : 'bg-gym-850 text-gray-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>الفيديوهات</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('image')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    selectedType === 'image'
                      ? 'bg-gym-lime text-black'
                      : 'bg-gym-850 text-gray-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>الصور</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Media Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item.url);
                  onClose();
                }}
                className="group relative bg-gym-900 border border-white/10 hover:border-gym-lime rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover pointer-events-none"
                      muted
                      playsInline
                    />
                  ) : (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-gym-lime text-[10px] font-bold uppercase">
                    {item.type}
                  </span>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl bg-gym-lime text-black font-extrabold text-xs shadow-lg">
                      اختيار هذا الملف
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="text-xs font-bold text-white truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    {item.sizeFormatted}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 text-xs">
              لا توجد ملفات وسائط تطابق هذا البحث في الذاكرة.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gym-900 border-t border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gym-850 hover:bg-gym-800 text-xs font-bold text-gray-300"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
