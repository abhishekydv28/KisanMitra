import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types';
import { playSpeech, stopSpeech, isSpeaking, triggerHaptic } from '../utils/speech';

interface KisanSahayakTabProps {
  language: Language;
}

export const KisanSahayakTab: React.FC<KisanSahayakTabProps> = ({ language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text:
        language === 'hi'
          ? 'राम-राम रामेश जी! मैं आपका किसान सहायक हूँ। आप अपनी फसल, खाद, कीटनाशक या मौसम के बारे में बोलकर या लिखकर कोई भी सवाल पूछ सकते हैं।'
          : 'Welcome Ramesh ji! I am your Kisan Sahayak. Ask any question about crop health, fertilizer doses, pest remedies or weather by speaking or typing.',
      timestamp: '10:00 AM',
      audioText:
        language === 'hi'
          ? 'राम-राम रामेश जी! मैं आपका किसान सहायक हूँ। आप अपनी फसल, खाद या कीटनाशक के बारे में कोई भी सवाल पूछ सकते हैं।'
          : 'Welcome Ramesh ji. I am your Kisan Sahayak. You can ask me any crop or pesticide questions.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickQuestionsHi = [
    'यूरिया और डीएपी की सही मात्रा क्या है?',
    'टमाटर के पत्ता मुड़ने पर क्या करें?',
    'कीटनाशक छिड़कने का सबसे अच्छा समय?',
    'फसल बीमा योजना में दावा कैसे करें?',
  ];

  const quickQuestionsEn = [
    'What is the ideal dose of Urea & DAP?',
    'How to prevent tomato leaf curling?',
    'Best time of day to spray fungicide?',
    'How to file claim in Crop Insurance?',
  ];

  const quickQuestions = language === 'hi' ? quickQuestionsHi : quickQuestionsEn;

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToggleVoiceMic = () => {
    triggerHaptic([30, 40]);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है, कृपया लिखकर पूछें।'
          : 'Voice recognition not supported on this browser, please type your query.'
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendQuestion(transcript);
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

  const handleSendQuestion = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isSubmitting) return;

    triggerHaptic(20);
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSubmitting(true);

    // Call server API /api/ask with offline agronomy fallback
    let answerText = '';
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend, language }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.answer) {
          answerText = data.answer;
        }
      }
    } catch {
      // Fallback
    }

    if (!answerText) {
      const qLower = textToSend.toLowerCase();
      if (qLower.includes('यूरिया') || qLower.includes('urea') || qLower.includes('dap') || qLower.includes('खाद')) {
        answerText =
          language === 'hi'
            ? 'गेहूं और सब्जियों में यूरिया की पहली खुराक पहली सिंचाई (21 दिन) पर 45 किग्रा प्रति एकड़ दें। डीएपी की मात्रा बुवाई के समय 50 किग्रा प्रति एकड़ मिट्टी में मिलाना सबसे उपयुक्त होता है।'
            : 'For wheat and vegetables, apply the first split of Urea (45 kg/acre) at the first irrigation (21 days). DAP is best applied at sowing time (50 kg/acre).';
      } else if (qLower.includes('पत्ता') || qLower.includes('मुड़') || qLower.includes('curl') || qLower.includes('टमाटर')) {
        answerText =
          language === 'hi'
            ? 'पत्ता मुड़ना सफेद मक्खी (Whitefly) द्वारा फैलाए जाने वाले वायरस के कारण होता है। इसके नियंत्रण के लिए इमिडाक्लोप्रिड दवा 1ml प्रति 3 लीटर पानी में घोलकर 10 दिन पर छिड़कें और पीला चिपचिपा ट्रैप (Yellow Sticky Trap) खेत में लगाएं।'
            : 'Leaf curl is transmitted by whiteflies. Spray Imidacloprid (1ml per 3L water) and install yellow sticky traps across your tomato field.';
      } else if (qLower.includes('समय') || qLower.includes('time') || qLower.includes('छिड़क')) {
        answerText =
          language === 'hi'
            ? 'कीटनाशक व फफूंदनाशी छिड़कने का सबसे सही समय सुबह 7 से 9 बजे (ओस सूखने के बाद) या शाम 4 से 6 बजे है। दोपहर की तेज धूप और तेज हवा में कभी छिड़काव न करें।'
            : 'The ideal spraying window is morning 7-9 AM after dew dries or evening 4-6 PM. Avoid high noon heat or windy periods.';
      } else {
        answerText =
          language === 'hi'
            ? 'रामेश जी, इस समस्या के निवारण के लिए अपनी फसल पर नीम तेल (50ml प्रति 15 लीटर ढोलकी) का छिड़काव करें और खेत में जलभराव न होने दें। आवश्यकता पड़ने पर स्थानीय कृषि विज्ञान केंद्र से संपर्क करें।'
            : 'Ramesh ji, apply neem oil (50ml per 15L sprayer tank) and ensure proper field drainage. Consult your local Krishi Vigyan Kendra for specialized laboratory testing.';
      }
    }

    const assistantMsg: ChatMessage = {
      id: `m-${Date.now() + 1}`,
      sender: 'assistant',
      text: answerText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      audioText: answerText,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsSubmitting(false);

    // Speak answer automatically or user can click
    playSpeech(
      answerText,
      language,
      () => setActiveSpeechMsgId(assistantMsg.id),
      () => setActiveSpeechMsgId(null),
      () => setActiveSpeechMsgId(null)
    );
  };

  const handlePlayMessageAudio = (msg: ChatMessage) => {
    triggerHaptic(20);
    if (activeSpeechMsgId === msg.id || isSpeaking()) {
      stopSpeech();
      setActiveSpeechMsgId(null);
    } else {
      playSpeech(
        msg.audioText || msg.text,
        language,
        () => setActiveSpeechMsgId(msg.id),
        () => setActiveSpeechMsgId(null),
        () => setActiveSpeechMsgId(null)
      );
    }
  };

  return (
    <div className="flex flex-col w-full pb-8 space-y-4">
      {/* Top Banner */}
      <div className="bg-[#f4f4ee] rounded-2xl p-4 border border-[#e3e3dd] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="material-symbols-outlined text-[24px] text-[#164219]">
              support_agent
            </span>
            <h2 className="text-[19px] font-bold text-[#164219]">
              {language === 'hi' ? 'किसान सहायक AI' : 'Kisan Sahayak Assistant'}
            </h2>
          </div>
          <p className="text-[12px] text-[#42493f]">
            {language === 'hi'
              ? 'आवाज़ में बोलकर या लिखकर खेती का सटीक समाधान पाएं'
              : 'Voice-first agricultural guidance & crop troubleshooting'}
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-[#bbf0b7] flex items-center justify-center text-[#164219]">
          <span className="material-symbols-outlined text-[22px]">psychiatry</span>
        </div>
      </div>

      {/* Emergency Helpline Strip */}
      <div className="bg-[#ffdbc9]/40 border border-[#ffdbc9] rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#843b00] text-[#ffffff] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">call</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#602900] uppercase">
              {language === 'hi' ? 'किसान कॉल सेंटर (टोल-फ्री)' : 'Kisan Call Centre (Toll Free)'}
            </div>
            <div className="text-[14px] font-bold text-[#1a1c19]">1800-180-1551</div>
          </div>
        </div>
        <a
          href="tel:18001801551"
          className="px-3.5 py-1.5 rounded-full bg-[#843b00] text-[#ffffff] text-[12px] font-bold active:scale-95 transition-transform"
        >
          {language === 'hi' ? 'कॉल करें' : 'Call'}
        </a>
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto p-1 scrollbar-none">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isPlayingThis = activeSpeechMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs space-y-1 ${
                  isUser
                    ? 'bg-[#164219] text-[#ffffff] rounded-tr-xs'
                    : 'bg-[#ffffff] text-[#1a1c19] border border-[#e3e3dd] rounded-tl-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14px] leading-relaxed font-medium">{msg.text}</p>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handlePlayMessageAudio(msg)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                        isPlayingThis
                          ? 'bg-[#843b00] text-[#ffffff]'
                          : 'bg-[#eeeee8] text-[#164219] hover:bg-[#bbf0b7]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isPlayingThis ? 'pause' : 'volume_up'}
                      </span>
                    </button>
                  )}
                </div>
                <div
                  className={`text-[10px] font-bold ${
                    isUser ? 'text-[#bdf0b6]/80 text-right' : 'text-[#72796f]'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}
        {isSubmitting && (
          <div className="flex justify-start">
            <div className="bg-[#ffffff] rounded-2xl p-3 border border-[#e3e3dd] flex items-center gap-2 text-[13px] text-[#72796f]">
              <span className="material-symbols-outlined text-[18px] animate-spin text-[#164219]">
                progress_activity
              </span>
              <span>
                {language === 'hi'
                  ? 'किसान सहायक सोच रहा है...'
                  : 'Assistant is preparing advice...'}
              </span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-[#72796f] uppercase">
          {language === 'hi' ? 'अक्सर पूछे जाने वाले सवाल:' : 'Frequently Asked Questions:'}
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendQuestion(q)}
              className="px-3 py-1.5 rounded-full bg-[#ffffff] border border-[#e3e3dd] hover:border-[#164219] text-[#1a1c19] text-[12px] font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar with Voice Microphone and Send */}
      <div className="flex items-center gap-2 bg-[#ffffff] p-2 rounded-2xl border border-[#e3e3dd] shadow-xs">
        <button
          type="button"
          onClick={handleToggleVoiceMic}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isListening
              ? 'bg-[#ba1a1a] text-[#ffffff] ring-4 ring-[#ffdad6] animate-pulse'
              : 'bg-[#eeeee8] hover:bg-[#bbf0b7] text-[#164219]'
          }`}
          title={language === 'hi' ? 'बोलकर पूछें' : 'Voice search'}
        >
          <span className="material-symbols-outlined text-[24px]">
            {isListening ? 'graphic_eq' : 'mic'}
          </span>
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion()}
          placeholder={
            isListening
              ? language === 'hi'
                ? 'सुन रहा हूँ, बोलिए...'
                : 'Listening, please speak...'
              : language === 'hi'
              ? 'फसल से जुड़ा कोई सवाल पूछें...'
              : 'Ask any crop question...'
          }
          className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#1a1c19] placeholder:text-[#72796f] px-1"
        />

        <button
          type="button"
          onClick={() => handleSendQuestion()}
          disabled={!inputText.trim() || isSubmitting}
          className="w-11 h-11 rounded-full bg-[#164219] hover:bg-[#2e5a2e] disabled:opacity-40 text-[#ffffff] flex items-center justify-center cursor-pointer transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
    </div>
  );
};
