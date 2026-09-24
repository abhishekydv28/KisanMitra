import React from 'react';
import { Language } from '../types';
import { triggerHaptic } from '../utils/speech';

export type NavTab = 'crop-scan' | 'treatments' | 'crop-history' | 'kisan-sahayak';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
}) => {
  const tabs = [
    {
      id: 'crop-scan' as NavTab,
      icon: 'photo_camera',
      labelHi: 'स्कैन',
      labelEn: 'Scan',
      subHi: 'Scan',
      subEn: 'स्कैन',
    },
    {
      id: 'treatments' as NavTab,
      icon: 'medication_liquid',
      labelHi: 'उपचार',
      labelEn: 'Care',
      subHi: 'Care',
      subEn: 'उपचार',
    },
    {
      id: 'crop-history' as NavTab,
      icon: 'history_edu',
      labelHi: 'इतिहास',
      labelEn: 'Log',
      subHi: 'Log',
      subEn: 'इतिहास',
    },
    {
      id: 'kisan-sahayak' as NavTab,
      icon: 'support_agent',
      labelHi: 'सहायक',
      labelEn: 'Help',
      subHi: 'Help',
      subEn: 'सहायक',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe bg-[#ffffff]/95 backdrop-blur-xl border-t border-[#e3e3dd] shadow-[0_-4px_20px_rgba(22,66,25,0.08)]">
      <div className="max-w-md mx-auto grid grid-cols-4 h-18 px-1 items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHaptic(25);
                onTabChange(tab.id);
              }}
              className={`min-h-[52px] flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 cursor-pointer select-none ${
                isActive ? 'text-[#164219]' : 'text-[#72796f] hover:text-[#3a693c]'
              }`}
            >
              <div
                className={`relative flex items-center justify-center transition-all ${
                  isActive
                    ? 'w-11 h-8 rounded-full bg-[#bbf0b7]/50 text-[#164219]'
                    : 'w-10 h-8 text-[#72796f]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    isActive ? 'font-bold scale-105' : ''
                  }`}
                >
                  {tab.icon}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#164219]"></span>
                )}
              </div>
              <span
                className={`text-[12px] text-center leading-none mt-0.5 font-bold ${
                  isActive ? 'text-[#164219]' : 'text-[#72796f]'
                }`}
              >
                {language === 'hi'
                  ? `${tab.labelHi} / ${tab.subHi}`
                  : `${tab.labelEn} / ${tab.subEn}`}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
