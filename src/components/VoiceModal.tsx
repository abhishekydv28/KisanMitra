import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { triggerHaptic } from '../utils/speech';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onQuestionSubmit: (question: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  language,
  onQuestionSubmit,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      setIsListening(false);
      setSpokenText('');
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpokenText(
        language === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है।'
          : 'Voice input not supported in this browser.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setSpokenText(transcript);
        if (event.results[current].isFinal) {
          triggerHaptic(30);
          setTimeout(() => {
            onQuestionSubmit(transcript);
            onClose();
          }, 800);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  const sampleVoicesHi = [
    'टमाटर के पत्तों पर गोल काले छल्लेदार धब्बे बन रहे हैं',
    'गेहूं की पत्तियों पर हल्दी जैसा पीला पाउडर दिख रहा है',
    'धान में फफूंदी से बचाव के लिए कौन सी दवा डालें?',
  ];

  const sampleVoicesEn = [
    'Black concentric rings appearing on tomato leaves',
    'Yellow powder falling from wheat crop leaf blades',
    'Which fungicide to spray for paddy disease?',
  ];

  const sampleVoices = language === 'hi' ? sampleVoicesHi : sampleVoicesEn;

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1c19]/80 backdrop-blur-md flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#ffffff] rounded-t-3xl sm:rounded-3xl border border-[#e3e3dd] shadow-2xl p-6 flex flex-col items-center text-center space-y-5">
        {/* Close Button */}
        <div className="w-full flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#eeeee8] flex items-center justify-center text-[#1a1c19] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Pulsing Mic Hero */}
        <div className="relative flex items-center justify-center">
          {isListening && (
            <>
              <span className="absolute w-36 h-36 rounded-full bg-[#ffb183]/30 animate-ping"></span>
              <span className="absolute w-28 h-28 rounded-full bg-[#ffdbc9]"></span>
            </>
          )}

          <button
            type="button"
            onClick={startListening}
            className="relative z-10 w-24 h-24 rounded-full bg-[#843b00] text-[#ffffff] flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[42px] text-[#ffdbc9]">
              {isListening ? 'graphic_eq' : 'mic'}
            </span>
          </button>
        </div>

        {/* Instruction */}
        <div>
          <h3 className="text-[20px] font-bold text-[#164219]">
            {isListening
              ? language === 'hi'
                ? 'सुन रहे हैं, अपनी समस्या बोलिए...'
                : 'Listening, speak your crop issue...'
              : language === 'hi'
              ? 'बोलने के लिए माइक दबाएं'
              : 'Tap mic to speak'}
          </h3>
          <p className="text-[13px] text-[#72796f] mt-1">
            {language === 'hi'
              ? 'फसल का नाम और पत्तों के लक्षण बताएं'
              : 'Mention the crop name and what you see on the leaf'}
          </p>
        </div>

        {/* Live Transcript / Spoken Preview */}
        <div className="w-full min-h-[64px] p-3 rounded-2xl bg-[#fafaf4] border border-[#e3e3dd] flex items-center justify-center">
          <span className="text-[15px] font-medium text-[#1a1c19] italic">
            {spokenText ||
              (language === 'hi'
                ? 'जैसे: "टमाटर के पत्ते पर अगेती झुलसा का क्या इलाज है?"'
                : 'e.g. "What is the remedy for early blight in tomato?"')}
          </span>
        </div>

        {/* Quick tap suggestions */}
        <div className="w-full text-left space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-[#72796f] uppercase">
            {language === 'hi' ? 'या इनमे से कोई समस्या चुनें:' : 'Or tap an example problem:'}
          </span>
          <div className="space-y-1.5">
            {sampleVoices.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  onQuestionSubmit(sample);
                  onClose();
                }}
                className="w-full text-left p-2.5 rounded-xl bg-[#f4f4ee] hover:bg-[#e8e8e3] border border-[#e3e3dd] text-[13px] text-[#1a1c19] font-medium cursor-pointer transition-all active:scale-98 truncate"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
