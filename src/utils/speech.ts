// Speech and Audio utilities tailored for rural farmers with Hindi and English TTS

let currentUtterance: SpeechSynthesisUtterance | null = null;

export const playSpeech = (
  text: string,
  lang: 'hi' | 'en',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): boolean => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this browser');
    onError?.();
    return false;
  }

  // If already speaking, cancel
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  utterance.rate = 0.92; // Slightly slower for outdoor clarity
  utterance.pitch = 1.0;

  // Try to pick a natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find((v) =>
    lang === 'hi'
      ? v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
      : v.lang.startsWith('en')
  );
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  utterance.onstart = () => {
    currentUtterance = utterance;
    onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    onError?.();
  };

  window.speechSynthesis.speak(utterance);
  return true;
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
};

export const isSpeaking = (): boolean => {
  if (!('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
};

// Haptic feedback
export const triggerHaptic = (pattern: number | number[] = [30, 40]) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration permissions error
    }
  }
};
