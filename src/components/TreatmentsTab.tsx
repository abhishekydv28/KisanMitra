import React, { useState } from 'react';
import { CropScanRecord, Language } from '../types';
import { playSpeech, stopSpeech, isSpeaking, triggerHaptic } from '../utils/speech';

interface TreatmentsTabProps {
  language: Language;
  scans: CropScanRecord[];
  selectedScanId?: string;
}

export const TreatmentsTab: React.FC<TreatmentsTabProps> = ({
  language,
  scans,
  selectedScanId,
}) => {
  const [activeCropFilter, setActiveCropFilter] = useState<string>('all');
  const [remedyTypeMap, setRemedyTypeMap] = useState<Record<string, 'organic' | 'chemical'>>({});
  const [playingRemedyId, setPlayingRemedyId] = useState<string | null>(null);

  const cropFilters = [
    { id: 'all', nameHi: 'सभी फसलें', nameEn: 'All Crops' },
    { id: 'tomato', nameHi: 'टमाटर', nameEn: 'Tomato' },
    { id: 'wheat', nameHi: 'गेहूं', nameEn: 'Wheat' },
    { id: 'paddy', nameHi: 'धान', nameEn: 'Paddy' },
  ];

  const filteredScans = scans.filter((s) => {
    if (activeCropFilter === 'all') return true;
    if (activeCropFilter === 'tomato') return s.cropNameHindi.includes('टमाटर') || s.cropNameEnglish.toLowerCase().includes('tomato');
    if (activeCropFilter === 'wheat') return s.cropNameHindi.includes('गेहूं') || s.cropNameEnglish.toLowerCase().includes('wheat');
    if (activeCropFilter === 'paddy') return s.cropNameHindi.includes('धान') || s.cropNameEnglish.toLowerCase().includes('paddy');
    return true;
  });

  const getRemedyType = (scanId: string): 'organic' | 'chemical' => {
    return remedyTypeMap[scanId] || 'chemical';
  };

  const setRemedyType = (scanId: string, type: 'organic' | 'chemical') => {
    triggerHaptic(15);
    setRemedyTypeMap((prev) => ({ ...prev, [scanId]: type }));
  };

  const handlePlayRemedyAudio = (scan: CropScanRecord) => {
    triggerHaptic(25);
    if (playingRemedyId === scan.id || isSpeaking()) {
      stopSpeech();
      setPlayingRemedyId(null);
    } else {
      const isChem = getRemedyType(scan.id) === 'chemical';
      const activeRemedy = isChem ? scan.chemicalRemedy : scan.organicRemedy;
      const audioText =
        language === 'hi'
          ? `${scan.cropNameHindi} के ${scan.diseaseNameHindi} के लिए ${activeRemedy.title}। दवा का नाम ${activeRemedy.name}। मात्रा: ${activeRemedy.dosageText}। विधि: ${activeRemedy.method}`
          : `Treatment for ${scan.diseaseNameEnglish} on ${scan.cropNameEnglish}. Medicine: ${activeRemedy.name}. Dosage: ${activeRemedy.dosageText}. Method: ${activeRemedy.method}`;

      playSpeech(
        audioText,
        language,
        () => setPlayingRemedyId(scan.id),
        () => setPlayingRemedyId(null),
        () => setPlayingRemedyId(null)
      );
    }
  };

  return (
    <div className="flex flex-col w-full pb-8 space-y-5">
      {/* Header Banner */}
      <div className="bg-[#f4f4ee] rounded-2xl p-4 border border-[#e3e3dd]">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[24px] text-[#164219]">
            medication_liquid
          </span>
          <h2 className="text-[20px] font-bold text-[#164219] leading-tight">
            {language === 'hi' ? 'उपचार व दवा केंद्र' : 'Crop Treatment & Care'}
          </h2>
        </div>
        <p className="text-[13px] text-[#42493f]">
          {language === 'hi'
            ? 'सटीक दवा की मात्रा (चम्मच, बाल्टी, ढोलकी) और सुरक्षित छिड़काव के नियम।'
            : 'Exact physical dosages (spoons, buckets, tanks) & safe spray guidelines.'}
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {cropFilters.map((cf) => (
          <button
            key={cf.id}
            type="button"
            onClick={() => {
              triggerHaptic(15);
              setActiveCropFilter(cf.id);
            }}
            className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCropFilter === cf.id
                ? 'bg-[#164219] text-[#ffffff] shadow-xs'
                : 'bg-[#eeeee8] text-[#1a1c19] hover:bg-[#e3e3dd]'
            }`}
          >
            {language === 'hi' ? cf.nameHi : cf.nameEn}
          </button>
        ))}
      </div>

      {/* Treatment Cards */}
      <div className="space-y-5">
        {filteredScans.map((scan) => {
          const currentType = getRemedyType(scan.id);
          const remedy = currentType === 'chemical' ? scan.chemicalRemedy : scan.organicRemedy;
          const isHighlighted = selectedScanId === scan.id;

          return (
            <div
              key={scan.id}
              className={`bg-[#ffffff] rounded-2xl border p-4 shadow-sm space-y-4 transition-all ${
                isHighlighted ? 'border-[#164219] ring-2 ring-[#bbf0b7]' : 'border-[#e3e3dd]'
              }`}
            >
              {/* Card Top: Disease info & Audio button */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#eeeee8] border border-[#c2c9bc]/60 flex-shrink-0">
                    <img
                      src={scan.imageUrl}
                      alt={scan.diseaseNameHindi}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#3a693c] uppercase tracking-wider">
                      {language === 'hi' ? scan.cropNameHindi : scan.cropNameEnglish} • {scan.field}
                    </span>
                    <h3 className="text-[17px] font-bold text-[#1a1c19] leading-tight">
                      {language === 'hi' ? scan.diseaseNameHindi : scan.diseaseNameEnglish}
                    </h3>
                  </div>
                </div>

                {/* Speaker voice button */}
                <button
                  type="button"
                  onClick={() => handlePlayRemedyAudio(scan)}
                  aria-label="दवा की विधि सुनें"
                  className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-xs ${
                    playingRemedyId === scan.id
                      ? 'bg-[#843b00] text-[#ffffff] ring-4 ring-[#ffdbc9]'
                      : 'bg-[#bbf0b7] text-[#164219] hover:bg-[#a0d39d]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {playingRemedyId === scan.id ? 'pause' : 'volume_up'}
                  </span>
                </button>
              </div>

              {/* Segmented Pills: Home / Organic vs Chemical */}
              <div className="grid grid-cols-2 p-1 bg-[#eeeee8] rounded-full">
                <button
                  type="button"
                  onClick={() => setRemedyType(scan.id, 'organic')}
                  className={`py-2 px-3 rounded-full text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    currentType === 'organic'
                      ? 'bg-[#ffffff] text-[#164219] shadow-xs'
                      : 'text-[#72796f] hover:text-[#1a1c19]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">eco</span>
                  <span>{language === 'hi' ? 'घरेलू / जैविक' : 'Organic / Home'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRemedyType(scan.id, 'chemical')}
                  className={`py-2 px-3 rounded-full text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    currentType === 'chemical'
                      ? 'bg-[#ffffff] text-[#843b00] shadow-xs'
                      : 'text-[#72796f] hover:text-[#1a1c19]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">science</span>
                  <span>{language === 'hi' ? 'रासायनिक' : 'Chemical'}</span>
                </button>
              </div>

              {/* Medicine Name & Dosage Banner */}
              <div className="bg-[#f4f4ee] rounded-xl p-3 border border-[#e3e3dd]">
                <div className="text-[12px] font-bold text-[#72796f] uppercase mb-0.5">
                  {language === 'hi' ? 'दवा / उपचार का नाम:' : 'Medicine / Remedy Name:'}
                </div>
                <div className="text-[16px] font-bold text-[#1a1c19]">{remedy.name}</div>
                <div className="text-[13px] font-semibold text-[#843b00] mt-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">scale</span>
                  <span>{remedy.dosageText}</span>
                </div>
              </div>

              {/* Physical Dosage Visualizer (Agrarian Metric Metaphor) */}
              <div className="bg-[#fafaf4] rounded-xl p-3 border border-[#c2c9bc] space-y-2">
                <div className="text-[12px] font-bold text-[#164219] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_box</span>
                  <span>
                    {language === 'hi'
                      ? 'भौतिक माप निर्देश (Physical Dosage Guide)'
                      : 'Physical Measure Guide'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {/* Spoons */}
                  <div className="bg-[#ffffff] rounded-lg p-2 flex flex-col items-center text-center border border-[#e3e3dd]">
                    <span className="text-[20px] mb-0.5">🥄</span>
                    <span className="text-[13px] font-bold text-[#1a1c19]">
                      {remedy.dosageVisuals.spoons}{' '}
                      {language === 'hi' ? 'चम्मच' : 'Spoons'}
                    </span>
                    <span className="text-[10px] text-[#72796f]">
                      {language === 'hi' ? 'पाउडर माप' : 'Powder measure'}
                    </span>
                  </div>

                  {/* Water Bucket */}
                  <div className="bg-[#ffffff] rounded-lg p-2 flex flex-col items-center text-center border border-[#e3e3dd]">
                    <span className="text-[20px] mb-0.5">🪣</span>
                    <span className="text-[13px] font-bold text-[#1a1c19]">
                      {remedy.dosageVisuals.waterBuckets}{' '}
                      {language === 'hi' ? 'बाल्टी (15L)' : 'Bucket (15L)'}
                    </span>
                    <span className="text-[10px] text-[#72796f]">
                      {language === 'hi' ? 'साफ पानी' : 'Clean water'}
                    </span>
                  </div>

                  {/* Sprayer Tank */}
                  <div className="bg-[#ffffff] rounded-lg p-2 flex flex-col items-center text-center border border-[#e3e3dd]">
                    <span className="text-[20px] mb-0.5">🎒</span>
                    <span className="text-[13px] font-bold text-[#1a1c19]">
                      {remedy.dosageVisuals.sprayTanks}{' '}
                      {language === 'hi' ? 'ढोलकी' : 'Knapsack'}
                    </span>
                    <span className="text-[10px] text-[#72796f]">
                      {language === 'hi' ? 'टैंक घोल' : 'Sprayer tank'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Method and Schedule */}
              <div className="space-y-2 text-[13px]">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#164219] mt-0.5">
                    water_drop
                  </span>
                  <div>
                    <span className="font-bold text-[#1a1c19]">
                      {language === 'hi' ? 'छिड़काव विधि: ' : 'Application Method: '}
                    </span>
                    <span className="text-[#42493f]">{remedy.method}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#843b00] mt-0.5">
                    schedule
                  </span>
                  <div>
                    <span className="font-bold text-[#1a1c19]">
                      {language === 'hi' ? 'समय सारणी: ' : 'Schedule: '}
                    </span>
                    <span className="text-[#42493f]">{remedy.schedule}</span>
                  </div>
                </div>
              </div>

              {/* Safety Precaution Strip */}
              <div className="p-2.5 rounded-xl bg-[#ffdad6]/40 border border-[#ffdad6] text-[12px] text-[#93000a] flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ba1a1a] flex-shrink-0 mt-0.5">
                  health_and_safety
                </span>
                <div className="space-y-0.5">
                  <span className="font-bold">
                    {language === 'hi' ? 'सुरक्षा सावधानियां:' : 'Safety Precautions:'}
                  </span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {remedy.safetyTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
