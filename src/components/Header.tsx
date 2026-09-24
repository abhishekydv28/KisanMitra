import React from 'react';
import { HOTLINKED_IMAGES } from '../data/mockData';
import { Language } from '../types';
import { triggerHaptic } from '../utils/speech';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  onOpenProfile: () => void;
  currentTabName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  onOpenProfile,
  currentTabName = 'Crop Scan',
}) => {
  const handleLangClick = () => {
    triggerHaptic(20);
    onToggleLanguage();
  };

  const handleProfileClick = () => {
    triggerHaptic(20);
    onOpenProfile();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-safe bg-[#fafaf4]/95 backdrop-blur-xl border-b border-[#e3e3dd] shadow-[0_2px_12px_rgba(22,66,25,0.06)]">
      <div className="max-w-md mx-auto h-16 px-5 flex items-center justify-between">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#bbf0b7]/40 flex items-center justify-center p-0.5">
            <img
              alt="KisanMitra Brand Logo"
              className="h-7 w-7 object-contain rounded-full"
              src={HOTLINKED_IMAGES.logo}
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback leaf icon
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[17px] font-bold text-[#164219] leading-tight tracking-tight">
              KisanMitra • किसान मित्र
            </span>
            <span className="text-[11px] font-semibold text-[#42493f] tracking-wide">
              {language === 'hi' ? 'स्मार्ट फसल सुरक्षा • ' + currentTabName : 'Smart Crop Care • ' + currentTabName}
            </span>
          </div>
        </div>

        {/* Right Actions: Language & Profile Avatar */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={handleLangClick}
            aria-label="Change Language"
            className="h-10 px-3 rounded-full bg-[#f4f4ee] hover:bg-[#e8e8e3] active:scale-95 transition-all flex items-center justify-center gap-1.5 text-[#164219] border border-[#e3e3dd] shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">translate</span>
            <span className="text-[13px] font-bold tracking-tight">
              {language === 'hi' ? 'हिंदी' : 'EN'}
            </span>
            <span className="text-[10px] text-[#72796f] font-bold">
              {language === 'hi' ? '/EN' : '/हि'}
            </span>
          </button>

          {/* Farmer Profile Avatar */}
          <button
            type="button"
            onClick={handleProfileClick}
            aria-label="Farmer Profile"
            className="w-10 h-10 rounded-full p-0.5 bg-[#eeeee8] hover:ring-2 hover:ring-[#3a693c] transition-all flex items-center justify-center cursor-pointer active:scale-95"
          >
            <img
              alt="रामेश जी प्रोफाइल"
              className="w-8 h-8 rounded-full object-cover border border-[#c2c9bc]"
              src={HOTLINKED_IMAGES.avatar}
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
