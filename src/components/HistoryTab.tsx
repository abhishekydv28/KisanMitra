import React, { useState } from 'react';
import { CropScanRecord, Language } from '../types';
import { triggerHaptic } from '../utils/speech';

interface HistoryTabProps {
  language: Language;
  scans: CropScanRecord[];
  onSelectScan: (scan: CropScanRecord) => void;
  onUpdateStatus: (scanId: string, status: 'treated' | 'resolved') => void;
  onStartNewScan: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  language,
  scans,
  onSelectScan,
  onUpdateStatus,
  onStartNewScan,
}) => {
  const [filter, setFilter] = useState<'all' | 'treated' | 'resolved'>('all');
  const [selectedField, setSelectedField] = useState<string>('all');

  const fields = [
    { id: 'all', nameHi: 'सभी खेत', nameEn: 'All Fields' },
    { id: 'field-1', nameHi: 'खेत #1 (बगीचा)', nameEn: 'Field #1' },
    { id: 'field-2', nameHi: 'खेत #2 (समस्तीपुर)', nameEn: 'Field #2' },
    { id: 'field-3', nameHi: 'खेत #3 (निचला खेत)', nameEn: 'Field #3' },
  ];

  const filteredScans = scans.filter((s) => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (selectedField === 'field-1' && !s.field.includes('#1')) return false;
    if (selectedField === 'field-2' && !s.field.includes('#2')) return false;
    if (selectedField === 'field-3' && !s.field.includes('#3')) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-8 space-y-5">
      {/* Header and Add Scan CTA */}
      <div className="bg-[#f4f4ee] rounded-2xl p-4 border border-[#e3e3dd] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="material-symbols-outlined text-[22px] text-[#164219]">
              history_edu
            </span>
            <h2 className="text-[19px] font-bold text-[#164219]">
              {language === 'hi' ? 'खेत का इतिहास व लॉग' : 'Field History & Crop Log'}
            </h2>
          </div>
          <p className="text-[12px] text-[#42493f]">
            {language === 'hi'
              ? 'फसल स्वास्थ्य की निगरानी और सुधार की रिपोर्ट'
              : 'Track crop health progress & treatment outcomes'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(20);
            onStartNewScan();
          }}
          className="h-10 px-3.5 rounded-full bg-[#164219] hover:bg-[#2e5a2e] text-[#ffffff] text-[13px] font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
          <span>{language === 'hi' ? 'नया स्कैन' : 'New Scan'}</span>
        </button>
      </div>

      {/* Status Segmented Control */}
      <div className="flex gap-1.5 p-1 bg-[#eeeee8] rounded-full">
        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setFilter('all');
          }}
          className={`flex-1 py-1.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#ffffff] text-[#164219] shadow-xs'
              : 'text-[#72796f] hover:text-[#1a1c19]'
          }`}
        >
          {language === 'hi' ? 'सभी (All)' : 'All Scans'}
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setFilter('treated');
          }}
          className={`flex-1 py-1.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
            filter === 'treated'
              ? 'bg-[#ffffff] text-[#843b00] shadow-xs'
              : 'text-[#72796f] hover:text-[#1a1c19]'
          }`}
        >
          {language === 'hi' ? 'इलाज जारी' : 'In Progress'}
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setFilter('resolved');
          }}
          className={`flex-1 py-1.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
            filter === 'resolved'
              ? 'bg-[#ffffff] text-[#164219] shadow-xs'
              : 'text-[#72796f] hover:text-[#1a1c19]'
          }`}
        >
          {language === 'hi' ? 'ठीक हुआ' : 'Resolved'}
        </button>
      </div>

      {/* Field selector pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {fields.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              triggerHaptic(15);
              setSelectedField(f.id);
            }}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedField === f.id
                ? 'bg-[#164219] text-[#ffffff]'
                : 'bg-[#ffffff] text-[#42493f] border border-[#e3e3dd] hover:bg-[#f4f4ee]'
            }`}
          >
            {language === 'hi' ? f.nameHi : f.nameEn}
          </button>
        ))}
      </div>

      {/* Scans List */}
      <div className="space-y-3">
        {filteredScans.length === 0 ? (
          <div className="bg-[#ffffff] rounded-2xl p-8 text-center border border-[#e3e3dd] space-y-2">
            <span className="material-symbols-outlined text-[42px] text-[#c2c9bc]">
              inventory_2
            </span>
            <p className="text-[15px] font-bold text-[#1a1c19]">
              {language === 'hi' ? 'कोई स्कैन नहीं मिला' : 'No records found in this category'}
            </p>
            <p className="text-[13px] text-[#72796f]">
              {language === 'hi' ? 'खेत का नया फोटो लें और जांच करें।' : 'Capture a crop leaf photo to begin.'}
            </p>
          </div>
        ) : (
          filteredScans.map((scan) => {
            const isResolved = scan.status === 'resolved';

            return (
              <div
                key={scan.id}
                className="bg-[#ffffff] rounded-2xl p-4 border border-[#e3e3dd] shadow-xs space-y-3"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#eeeee8] border border-[#c2c9bc]/50 flex-shrink-0 relative">
                    <img
                      src={scan.imageUrl}
                      alt={scan.cropNameHindi}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-[#1a1c19]/80 text-[#ffffff] px-1 rounded">
                      {scan.confidence}%
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isResolved
                            ? 'bg-[#bbf0b7] text-[#164219]'
                            : 'bg-[#ffdbc9] text-[#843b00]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {isResolved ? 'check_circle' : 'warning'}
                        </span>
                        {language === 'hi' ? scan.statusHindi : scan.statusEnglish}
                      </span>
                      <span className="text-[12px] text-[#72796f]">{scan.date}</span>
                    </div>

                    <h3 className="text-[16px] font-bold text-[#1a1c19] truncate">
                      {language === 'hi'
                        ? `${scan.cropNameHindi}: ${scan.diseaseNameHindi}`
                        : `${scan.cropNameEnglish}: ${scan.diseaseNameEnglish}`}
                    </h3>

                    <div className="text-[12px] text-[#42493f] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[15px] text-[#164219]">
                        location_on
                      </span>
                      <span className="truncate">{scan.field}</span>
                    </div>
                  </div>
                </div>

                {/* Treatment summary */}
                <div className="text-[12px] bg-[#f4f4ee] p-2.5 rounded-xl border border-[#e3e3dd] text-[#42493f] flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="font-bold text-[#1a1c19]">
                      {language === 'hi' ? 'दवा: ' : 'Remedy: '}
                    </span>
                    <span>{scan.chemicalRemedy.name}</span>
                  </div>
                  <span className="font-bold text-[#843b00] whitespace-nowrap">
                    {scan.chemicalRemedy.dosageVisuals.spoons}{' '}
                    {language === 'hi' ? 'चम्मच' : 'spoons'}
                  </span>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(20);
                      onSelectScan(scan);
                    }}
                    className="flex-1 min-h-[42px] rounded-full bg-[#eeeee8] hover:bg-[#e3e3dd] text-[#164219] font-bold text-[13px] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      medication_liquid
                    </span>
                    <span>{language === 'hi' ? 'उपचार देखें' : 'View Remedy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(25);
                      onUpdateStatus(
                        scan.id,
                        scan.status === 'resolved' ? 'treated' : 'resolved'
                      );
                    }}
                    className={`min-h-[42px] px-4 rounded-full font-bold text-[13px] flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      isResolved
                        ? 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffc8c1]'
                        : 'bg-[#bbf0b7] text-[#164219] hover:bg-[#a0d39d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isResolved ? 'replay' : 'task_alt'}
                    </span>
                    <span>
                      {isResolved
                        ? language === 'hi'
                          ? 'इलाज में बदलें'
                          : 'Re-open'
                        : language === 'hi'
                        ? 'ठीक हुआ मार्क करें'
                        : 'Mark Resolved'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
