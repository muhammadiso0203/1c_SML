import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API interface definitions for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type SpeechLanguage = 'uz-UZ' | 'ru-RU';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  defaultLang?: SpeechLanguage;
}

export function useSpeechRecognition({
  onResult,
  onError,
  defaultLang = 'uz-UZ',
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lang, setLang] = useState<SpeechLanguage>(defaultLang);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const instance = new SpeechRecognition();
      instance.continuous = false; // Bitta gap/savol tugashi bilan to'xtaydi
      instance.interimResults = true; // Jonli nutqni ko'rsatish
      instance.lang = lang;

      instance.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      instance.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          currentTranscript += item[0].transcript;
          if (item.isFinal) {
            isFinal = true;
          }
        }

        setTranscript(currentTranscript);
        if (onResult) {
          onResult(currentTranscript, isFinal);
        }
      };

      instance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('[SpeechRecognition] xatosi:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          const msg = 'Mikrofon ruxsati berilmadi. Brauzerda mikrofonga ruxsat bering.';
          setErrorMessage(msg);
          onError?.(msg);
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Ovozni aniqlashda xatolik: ${event.error}`);
          onError?.(event.error);
        }
      };

      instance.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = instance;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [lang, onResult, onError]);

  const startListening = useCallback(
    (targetLang?: SpeechLanguage) => {
      if (!recognitionRef.current) return;
      if (targetLang && targetLang !== lang) {
        setLang(targetLang);
        recognitionRef.current.lang = targetLang;
      }
      try {
        setTranscript('');
        setErrorMessage(null);
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Ovoz yozishni boshlash xatosi:', err);
      }
    },
    [lang]
  );

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    isSupported,
    lang,
    setLang,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
  };
}

