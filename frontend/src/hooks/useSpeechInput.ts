import { useCallback, useEffect, useRef, useState } from "react";

/* Minimal typings for the Web Speech API, which TypeScript's DOM lib omits. */
interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const getRecognitionCtor = (): SpeechRecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

interface SpeechInputOptions {
  /** Called with the live transcript while the user speaks. */
  onTranscript: (text: string) => void;
  /** Called once with the final transcript when the user stops speaking. */
  onFinal?: (text: string) => void;
}

/**
 * Browser-native voice input. Nothing is sent to ShopMind until the user
 * submits; recognition itself is handled by the browser.
 */
export const useSpeechInput = ({ onTranscript, onFinal }: SpeechInputOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callbacks = useRef({ onTranscript, onFinal });
  callbacks.current = { onTranscript, onFinal };
  const isSupported = getRecognitionCtor() !== null;

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("Voice input isn't supported in this browser.");
      return;
    }
    recognitionRef.current?.abort();
    const recognition = new Ctor();
    recognition.lang = navigator.language || "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    let finalText = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interim += result[0].transcript;
      }
      callbacks.current.onTranscript((finalText + interim).trim());
    };
    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "Microphone access was blocked. Allow it in your browser to use voice."
          : event.error === "no-speech"
            ? "We didn't catch that. Try speaking again."
            : "Voice input stopped unexpectedly.",
      );
    };
    recognition.onend = () => {
      setIsListening(false);
      if (finalText.trim()) callbacks.current.onFinal?.(finalText.trim());
    };

    setError(null);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setError("Voice input couldn't start. Please try again.");
    }
  }, []);

  return { isSupported, isListening, error, start, stop, clearError: () => setError(null) };
};
