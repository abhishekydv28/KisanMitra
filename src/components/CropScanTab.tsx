import React, { useState } from 'react';
import { CropScanRecord, Language } from '../types';
import { playSpeech, stopSpeech, isSpeaking, triggerHaptic } from '../utils/speech';

interface CropScanTabProps {
  language: Language;
  scans: CropScanRecord[];
  onStartCamera: () => void;
  onUploadFile: (file: File) => void;
  onOpenVoice: () => void;
  onSelectScan: (scan: CropScanRecord) => void;
  onViewAllHistory: () => void;
}

export const CropScanTab: React.FC<CropScanTabProps> = ({
  language,
  scans,
  onStartCamera,
  onUploadFile,
  onOpenVoice,
  onSelectScan,
  onViewAllHistory,
}) => {
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);

  const greetingSpeechHi =
    'नमस्ते रामेश जी। आज समस्तीपुर में धूप और 31 डिग्री तापमान है। हवा में नमी अधिक होने के कारण टमाटर और मिर्च में फफूंदी का खतरा बढ़ रहा है। कृपया अपनी फसल के पत्तों की जांच अवश्य करें।';
  const greetingSpeechEn =
    'Namaste Ramesh ji. Sunny weather with 31 degrees Celsius in Samastipur. Due to high humidity, fungal blight risk is elevated. Please inspect your crop leaves today.';

  const handleToggleAudioGreeting = () => {
    triggerHaptic(30);
    if (isPlayingGreeting || isSpeaking()) {
      stopSpeech();
      setIsPlayingGreeting(false);
    } else {
      const textToPlay = language === 'hi' ? greetingSpeechHi : greetingSpeechEn;
      playSpeech(
        textToPlay,
        language,
        () => setIsPlayingGreeting(true),
        () => setIsPlayingGreeting(false),
        () => setIsPlayingGreeting(false)
      );
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic(20);
      onUploadFile(file);
    }
  };

  const photoTips = [
    {
      id: 1,
      icon: 'light_mode',
      titleHi: 'धूप में लें',
      titleEn: 'Good Light',
      descHi: 'सीधी पर्याप्त रोशनी में फोटो लें ताकि पत्तों का रंग व दाग साफ दिखें।',
      descEn: 'Capture under natural daylight for true leaf color and lesion clarity.',
    },
    {
      id: 2,
      icon: 'center_focus_strong',
      titleHi: 'पत्ता साफ रखें',
      titleEn: 'Clear Leaf',
      descHi: 'पत्ते पर जमी धूल या मिट्टी हल्के से साफ कर लें, छाया न पड़ने दें।',
      descEn: 'Keep the leaf surface clean and avoid casting your phone shadow.',
    },
    {
      id: 3,
      icon: 'zoom_in',
      titleHi: 'नजदीक से लें',
      titleEn: 'Close-up',
      descHi: 'कैमरा 10 से 15 सेमी की दूरी पर रखकर रोगग्रस्त हिस्से पर फोकस करें।',
      descEn: 'Hold camera 10-15 cm close, focusing on the diseased spots or veins.',
    },
  ];

  return (
    <div className="flex flex-col w-full pb-6 space-y-6">
      {/* 1. Greeting & Agri-Weather Briefing Card */}
      <section className="bg-[#f4f4ee] rounded-2xl p-4 border border-[#e3e3dd] shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3a693c] animate-pulse"></span>
              <span className="text-[12px] text-[#3a693c] font-bold uppercase tracking-wider">
                {language === 'hi' ? 'गाँव: समस्तीपुर • खेत #2' : 'Village: Samastipur • Field #2'}
              </span>
            </div>
            <h1 className="text-[22px] text-[#164219] font-bold leading-tight">
              {language === 'hi' ? 'नमस्ते रामेश जी' : 'Namaste Ramesh Ji'}
            </h1>
            <p className="text-[14px] text-[#42493f] mt-0.5">
              {language === 'hi' ? 'आज आपके खेत का क्या हाल है?' : 'How are your crops looking today?'}
            </p>
          </div>

          {/* Audio Greeting / Speaker Button */}
          <button
            type="button"
            onClick={handleToggleAudioGreeting}
            aria-label="आवाज़ में सुनें (Listen in Audio)"
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-all shadow-xs cursor-pointer ${
              isPlayingGreeting
                ? 'bg-[#843b00] text-[#ffffff] ring-4 ring-[#ffdbc9]'
                : 'bg-[#bbf0b7] text-[#164219] hover:bg-[#a0d39d]'
            }`}
          >
            <span className="material-symbols-outlined text-[26px]">
              {isPlayingGreeting ? 'pause' : 'volume_up'}
            </span>
          </button>
        </div>

        {/* Weather & Field Condition Alert Strip */}
        <div className="mt-4 bg-[#ffffff] rounded-xl p-3 flex items-center gap-3 border border-[#e3e3dd] shadow-xs">
          <div className="w-10 h-10 rounded-full bg-[#ffdbc9] flex items-center justify-center flex-shrink-0 text-[#602900]">
            <span className="material-symbols-outlined text-[24px]">sunny</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-bold text-[#1a1c19]">
                {language === 'hi' ? 'धूप • 31°C' : 'Sunny • 31°C'}
              </span>
              <span className="text-[12px] bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded-full font-bold">
                {language === 'hi' ? 'हवा में नमी (High Humidity)' : 'High Humidity Alert'}
              </span>
            </div>
            <p className="text-[13px] text-[#42493f] truncate mt-0.5">
              {language === 'hi'
                ? 'फफूंदी (Fungal blight) का खतरा बढ़ रहा है - पत्तों की जांच करें'
                : 'Fungal blight risk elevated - please inspect crop leaves'}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Centerpiece Hero: Massive Elevated Camera Scan Button */}
      <section className="flex flex-col items-center justify-center py-2 text-center">
        <div className="relative flex items-center justify-center my-3">
          {/* Animated gentle pulse waves */}
          <span className="absolute w-64 h-64 rounded-full bg-[#164219]/15 animate-ping opacity-60 pointer-events-none"></span>
          <span className="absolute w-56 h-56 rounded-full bg-[#bbf0b7]/50 pointer-events-none"></span>

          {/* Massive Hero Tap Trigger Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic([40, 30, 40]);
              onStartCamera();
            }}
            aria-label="पौधे का फोटो लें - कैमरा खोलें"
            className="relative z-10 w-48 h-48 rounded-full bg-[#2e5a2e] text-[#ffffff] flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all transform hover:brightness-105 cursor-pointer border-4 border-[#ffffff]"
          >
            <div className="relative mb-2 flex items-center justify-center">
              <span className="material-symbols-outlined text-[54px] text-[#bdf0b6]">
                photo_camera
              </span>
              <span className="material-symbols-outlined text-[24px] text-[#164219] absolute -top-1 -right-2 bg-[#bbf0b7] rounded-full p-0.5 shadow-xs">
                psychiatry
              </span>
            </div>
            <span className="text-[20px] font-bold text-[#ffffff] tracking-tight px-3 leading-snug">
              {language === 'hi' ? 'पौधे का फोटो लें' : 'Scan Crop Leaf'}
            </span>
            <span className="text-[13px] font-semibold text-[#bdf0b6] opacity-90 mt-0.5">
              {language === 'hi' ? 'Scan Crop Now' : 'पौधे का फोटो लें'}
            </span>
          </button>
        </div>

        {/* Viewfinder 3 Photo Tips */}
        <div className="w-full mt-4">
          <p className="text-[12px] text-[#42493f] uppercase tracking-wider mb-2 font-bold text-left">
            {language === 'hi'
              ? 'सटीक जांच के लिए 3 जरूरी नियम (3 PHOTO TIPS)'
              : '3 ESSENTIAL PHOTO TIPS FOR ACCURATE DETECTION'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {photoTips.map((tip) => (
              <button
                key={tip.id}
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  setSelectedTip(selectedTip === tip.id ? null : tip.id);
                }}
                className={`bg-[#ffffff] rounded-xl p-2.5 flex flex-col items-center text-center border transition-all cursor-pointer ${
                  selectedTip === tip.id
                    ? 'border-[#2e5a2e] bg-[#f4f4ee] shadow-sm'
                    : 'border-[#e3e3dd] shadow-xs hover:border-[#bbf0b7]'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#eeeee8] flex items-center justify-center text-[#164219] mb-1">
                  <span className="material-symbols-outlined text-[20px]">{tip.icon}</span>
                </div>
                <span className="text-[12px] font-bold text-[#1a1c19] leading-tight">
                  {language === 'hi' ? tip.titleHi : tip.titleEn}
                </span>
                <span className="text-[11px] text-[#72796f] leading-tight mt-0.5">
                  {language === 'hi' ? tip.titleEn : tip.titleHi}
                </span>
              </button>
            ))}
          </div>

          {/* Tip explanation banner if expanded */}
          {selectedTip !== null && (
            <div className="mt-2.5 p-3 rounded-xl bg-[#eeeee8] border border-[#c2c9bc] text-left text-[13px] text-[#1a1c19] animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-[#164219] mb-0.5">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>
                  {language === 'hi'
                    ? photoTips.find((t) => t.id === selectedTip)?.titleHi
                    : photoTips.find((t) => t.id === selectedTip)?.titleEn}
                </span>
              </div>
              <p>
                {language === 'hi'
                  ? photoTips.find((t) => t.id === selectedTip)?.descHi
                  : photoTips.find((t) => t.id === selectedTip)?.descEn}
              </p>
            </div>
          )}
        </div>

        {/* Secondary Action: Upload from Gallery */}
        <label
          aria-label="गैलरी से फोटो चुनें (Upload from Gallery)"
          className="w-full mt-4 min-h-[54px] rounded-full bg-[#eeeee8] hover:bg-[#e3e3dd] text-[#1a1c19] flex items-center justify-center gap-2.5 px-6 border border-[#c2c9bc] shadow-xs active:scale-98 transition-all cursor-pointer select-none"
        >
          <span className="material-symbols-outlined text-[24px] text-[#164219]">
            photo_library
          </span>
          <span className="text-[15px] font-bold">
            {language === 'hi'
              ? 'गैलरी से फोटो चुनें • Upload from Gallery'
              : 'Upload from Gallery • गैलरी से फोटो'}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </label>
      </section>

      {/* 3. Big Voice Assistance Bar */}
      <section>
        <button
          type="button"
          onClick={() => {
            triggerHaptic([30, 50]);
            onOpenVoice();
          }}
          aria-label="बोलकर पूछें (Voice Help Assistant)"
          className="w-full min-h-[58px] rounded-full bg-[#843b00] text-[#ffffff] flex items-center justify-between px-5 shadow-md active:scale-98 transition-all cursor-pointer hover:brightness-110"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-[#ffdbc9] animate-pulse">
              mic
            </span>
            <div className="text-left">
              <div className="text-[15px] font-bold text-[#ffffff] leading-tight">
                {language === 'hi' ? 'बोलकर समस्या बताएं' : 'Speak Your Crop Problem'}
              </div>
              <div className="text-[12px] text-[#ffb183] leading-none mt-0.5">
                {language === 'hi' ? 'Speak your crop problem' : 'बोलकर समस्या बताएं (Voice Assistant)'}
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#602900] flex items-center justify-center text-[#ffdbc9]">
            <span className="material-symbols-outlined text-[22px]">graphic_eq</span>
          </div>
        </button>
      </section>

      {/* 4. Recent Scans / History Preview Section */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[22px] text-[#164219]">
              history_toggle_off
            </span>
            <h2 className="text-[18px] font-bold text-[#1a1c19]">
              {language === 'hi' ? 'हाल के स्कैन (Recent Scans)' : 'Recent Scans (हाल के स्कैन)'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              onViewAllHistory();
            }}
            className="text-[14px] font-bold text-[#3a693c] flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>{language === 'hi' ? 'सभी देखें' : 'View All'}</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>

        {/* History Cards Grid */}
        <div className="space-y-3">
          {scans.slice(0, 2).map((scan) => {
            const isResolved = scan.status === 'resolved';
            return (
              <div
                key={scan.id}
                onClick={() => {
                  triggerHaptic(20);
                  onSelectScan(scan);
                }}
                className="bg-[#ffffff] rounded-2xl p-3.5 border border-[#e3e3dd] shadow-xs flex items-center gap-3.5 active:bg-[#f4f4ee] transition-all cursor-pointer hover:border-[#bbf0b7]"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#eeeee8] border border-[#c2c9bc]/50 relative">
                  <img
                    alt={scan.diseaseNameHindi}
                    className="w-full h-full object-cover"
                    src={scan.imageUrl}
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
                      <span className="material-symbols-outlined text-[14px]">
                        {isResolved ? 'check_circle' : 'warning'}
                      </span>
                      {language === 'hi' ? scan.statusHindi : scan.statusEnglish}
                    </span>
                    <span className="text-[12px] text-[#72796f]">{scan.date}</span>
                  </div>

                  <h3 className="text-[16px] text-[#1a1c19] font-bold truncate">
                    {language === 'hi'
                      ? `${scan.cropNameHindi}: ${scan.diseaseNameHindi}`
                      : `${scan.cropNameEnglish}: ${scan.diseaseNameEnglish}`}
                  </h3>
                  <p className="text-[13px] text-[#42493f] truncate mt-0.5">
                    {language === 'hi'
                      ? scan.chemicalRemedy.dosageText
                      : `${scan.diseaseNameEnglish} • ${scan.chemicalRemedy.dosageText}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
