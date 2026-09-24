import React from 'react';
import { HOTLINKED_IMAGES } from '../data/mockData';
import { Language } from '../types';
import { triggerHaptic } from '../utils/speech';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  language,
  onToggleLanguage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1c19]/80 backdrop-blur-md flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#ffffff] rounded-t-3xl sm:rounded-3xl border border-[#e3e3dd] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e3e3dd]">
          <h3 className="text-[18px] font-bold text-[#164219]">
            {language === 'hi' ? 'किसान प्रोफाइल व खाता' : 'Farmer Profile & Account'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#eeeee8] flex items-center justify-center text-[#1a1c19] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-3.5 bg-[#f4f4ee] p-4 rounded-2xl border border-[#e3e3dd]">
          <img
            src={HOTLINKED_IMAGES.avatar}
            alt="रामेश यादव"
            className="w-16 h-16 rounded-full object-cover border-2 border-[#164219]"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-[18px] font-bold text-[#1a1c19]">
                {language === 'hi' ? 'रामेश यादव' : 'Ramesh Yadav'}
              </h4>
              <span className="material-symbols-outlined text-[18px] text-[#164219]">
                verified
              </span>
            </div>
            <p className="text-[13px] text-[#42493f]">
              {language === 'hi' ? 'गाँव: समस्तीपुर, बिहार' : 'Village: Samastipur, Bihar'}
            </p>
            <div className="text-[11px] font-bold text-[#164219] bg-[#bbf0b7] px-2 py-0.5 rounded-full inline-block mt-1">
              KCC ID: 8941-KCC-BR
            </div>
          </div>
        </div>

        {/* Farm & Crop Details */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-[#72796f] uppercase tracking-wider">
            {language === 'hi' ? 'खेत और फसल विवरण' : 'Farm & Crop Holdings'}
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-[#fafaf4] border border-[#e3e3dd]">
              <span className="text-[11px] text-[#72796f] block">
                {language === 'hi' ? 'कुल कृषि भूमि' : 'Total Land'}
              </span>
              <span className="text-[16px] font-bold text-[#1a1c19]">3.5 एकड़ (Acres)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#fafaf4] border border-[#e3e3dd]">
              <span className="text-[11px] text-[#72796f] block">
                {language === 'hi' ? 'सक्रिय फसलें' : 'Active Crops'}
              </span>
              <span className="text-[16px] font-bold text-[#1a1c19]">
                {language === 'hi' ? 'टमाटर, गेहूं' : 'Tomato, Wheat'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#fafaf4] border border-[#e3e3dd] space-y-1">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-[#72796f]">
                {language === 'hi' ? 'मृदा स्वास्थ्य कार्ड (Soil Health Card):' : 'Soil Health Card:'}
              </span>
              <span className="font-bold text-[#164219]">SHC-2024-BR-0941</span>
            </div>
            <div className="text-[12px] text-[#42493f]">
              {language === 'hi'
                ? 'जैविक कार्बन: 0.65% (मध्यम) • नाइट्रोजन: पर्याप्त'
                : 'Organic Carbon: 0.65% (Medium) • Nitrogen: Optimal'}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-2.5 pt-1">
          <span className="text-[11px] font-bold text-[#72796f] uppercase tracking-wider">
            {language === 'hi' ? 'सुविधाएं व भाषा' : 'Preferences'}
          </span>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#fafaf4] border border-[#e3e3dd]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#164219]">
                translate
              </span>
              <span className="text-[14px] font-bold text-[#1a1c19]">
                {language === 'hi' ? 'भाषा (Language)' : 'Current Language'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                onToggleLanguage();
              }}
              className="px-3 py-1 rounded-full bg-[#eeeee8] hover:bg-[#bbf0b7] text-[13px] font-bold text-[#164219] cursor-pointer"
            >
              {language === 'hi' ? 'हिंदी (बदलें)' : 'English (Change)'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#fafaf4] border border-[#e3e3dd]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#843b00]">
                notifications_active
              </span>
              <span className="text-[14px] font-bold text-[#1a1c19]">
                {language === 'hi' ? 'मौसम व रोग अलर्ट' : 'Weather & Pest SMS Alert'}
              </span>
            </div>
            <span className="text-[12px] font-bold text-[#164219] bg-[#bbf0b7] px-2.5 py-0.5 rounded-full">
              {language === 'hi' ? 'सक्रिय' : 'Active'}
            </span>
          </div>
        </div>

        {/* Close CTA */}
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] rounded-full bg-[#164219] hover:bg-[#2e5a2e] text-[#ffffff] font-bold text-[15px] flex items-center justify-center cursor-pointer active:scale-95"
        >
          {language === 'hi' ? 'वापस मुख्य स्क्रीन पर जाएं' : 'Done / Back to Screen'}
        </button>
      </div>
    </div>
  );
};
