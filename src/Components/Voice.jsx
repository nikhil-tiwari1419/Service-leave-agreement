import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, Languages, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../Context/Theme';

// Supported languages for voice input with proper locale codes
export const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', name: 'English (India)', flag: '🇮🇳', nativeName: 'English' },
  { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳', nativeName: 'Hindi' },
  { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳', nativeName: 'Marathi' },
  { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳', nativeName: 'Tamil' },
  { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳', nativeName: 'Telugu' },
  { code: 'bn-IN', name: 'বাংলা', flag: '🇮🇳', nativeName: 'Bengali' },
  { code: 'gu-IN', name: 'ગુજરાતી', flag: '🇮🇳', nativeName: 'Gujarati' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ', flag: '🇮🇳', nativeName: 'Kannada' },
  { code: 'ml-IN', name: 'മലയാളം', flag: '🇮🇳', nativeName: 'Malayalam' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', nativeName: 'Punjabi' },
  { code: 'or-IN', name: 'ଓଡ଼ିଆ', flag: '🇮🇳', nativeName: 'Odia' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', nativeName: 'English US' },
];

/**
 * Professional Voice Recognition Component
 * Supports multiple Indian languages with robust error handling
 */
function Voice({ value, onChange, placeholder = "Describe your issue...", rows = 4 }) {
  const { theme } = useTheme();
  
  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [transcriptBuffer, setTranscriptBuffer] = useState("");
  
  // Refs
  const recognitionRef = useRef(null);
  const languageMenuRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  const isStoppingRef = useRef(false);

  // Check browser support
  useEffect(() => {
    const hasSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsRecognitionSupported(hasSupport);
    
    if (!hasSupport) {
      setVoiceError('Voice input not supported. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize and configure Speech Recognition
  const initializeRecognition = useCallback(() => {
    if (!isRecognitionSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Optimal configuration for Indian languages
    recognition.continuous = true;          // Keep listening
    recognition.interimResults = true;      // Show real-time results
    recognition.maxAlternatives = 3;        // Get multiple alternatives for better accuracy
    recognition.lang = selectedLanguage;    // Set selected language

    // Handle results
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update interim display
      if (interimTranscript) {
        setTranscriptBuffer(interimTranscript);
      }

      // Add final transcript to text
      if (finalTranscript) {
        const cleanTranscript = finalTranscript.trim();
        if (cleanTranscript) {
          const currentValue = value.trim();
          const separator = currentValue ? ' ' : '';
          const newValue = currentValue + separator + cleanTranscript;
          
          onChange({ target: { value: newValue } });
          setTranscriptBuffer(""); // Clear buffer after adding
        }
      }
    };

    // Handle errors with specific messages
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      // Don't show error for aborted (user stopped)
      if (event.error === 'aborted' && isStoppingRef.current) {
        return;
      }

      switch (event.error) {
        case 'no-speech':
          setVoiceError('No speech detected. Please speak clearly.');
          break;
        case 'audio-capture':
          setVoiceError('Microphone not found. Please check your device.');
          break;
        case 'not-allowed':
          setVoiceError('Microphone permission denied. Please allow microphone access.');
          setIsListening(false);
          setSessionActive(false);
          break;
        case 'network':
          setVoiceError('Network error. Please check your internet connection.');
          break;
        case 'language-not-supported':
          setVoiceError(`Language ${selectedLanguage} not supported. Try English.`);
          break;
        case 'service-not-allowed':
          setVoiceError('Speech service not available. Please try again.');
          break;
        default:
          setVoiceError(`Error: ${event.error}. Please try again.`);
      }
    };

    // Handle when recognition starts
    recognition.onstart = () => {
      console.log('Recognition started for:', selectedLanguage);
      setSessionActive(true);
      setVoiceError("");
    };

    // Handle when recognition ends
    recognition.onend = () => {
      console.log('Recognition ended');
      setSessionActive(false);

      // Auto-restart if still in listening mode and not manually stopped
      if (isListening && !isStoppingRef.current) {
        // Wait a bit before restarting to avoid rapid restarts
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        
        restartTimeoutRef.current = setTimeout(() => {
          try {
            if (recognitionRef.current && isListening) {
              recognitionRef.current.start();
            }
          } catch (error) {
            console.error('Error restarting recognition:', error);
            setIsListening(false);
          }
        }, 300);
      }
    };

    // Additional event handlers for debugging
    recognition.onsoundstart = () => {
      console.log('Sound detected');
    };

    recognition.onspeechstart = () => {
      console.log('Speech detected');
      setVoiceError(""); // Clear errors when speech is detected
    };

    recognition.onspeechend = () => {
      console.log('Speech ended');
    };

    return recognition;
  }, [selectedLanguage, isListening, value, onChange, isRecognitionSupported]);

  // Initialize recognition when language changes
  useEffect(() => {
    if (!isRecognitionSupported) return;

    // Clean up old recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping old recognition:', error);
      }
    }

    // Create new recognition with current language
    recognitionRef.current = initializeRecognition();

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error in cleanup:', error);
        }
      }
    };
  }, [selectedLanguage, initializeRecognition, isRecognitionSupported]);

  // Start voice recognition
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setVoiceError('Voice recognition not initialized. Please refresh the page.');
      return;
    }

    isStoppingRef.current = false;
    setVoiceError("");
    setTranscriptBuffer("");

    try {
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.start();
      setIsListening(true);
      console.log('Started listening in:', selectedLanguage);
    } catch (error) {
      console.error('Error starting recognition:', error);
      
      if (error.message && error.message.includes('already started')) {
        // Already started, just update state
        setIsListening(true);
      } else {
        setVoiceError('Failed to start voice input. Please try again.');
      }
    }
  }, [selectedLanguage]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    isStoppingRef.current = true;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Stopped listening');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }

    setIsListening(false);
    setSessionActive(false);
    setTranscriptBuffer("");
  }, []);

  // Toggle voice input
  const toggleVoiceInput = useCallback(() => {
    if (!isRecognitionSupported) {
      setVoiceError('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, isRecognitionSupported, startListening, stopListening]);

  // Change language
  const handleLanguageChange = useCallback((langCode) => {
    const wasListening = isListening;
    
    // Stop current recognition if active
    if (wasListening) {
      stopListening();
    }

    setSelectedLanguage(langCode);
    setShowLanguageMenu(false);
    setVoiceError("");

    // Restart with new language if was listening
    if (wasListening) {
      setTimeout(() => {
        startListening();
      }, 500);
    }
  }, [isListening, startListening, stopListening]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold">
          Issue Description <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative" ref={languageMenuRef}>
            <button
              type="button"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              disabled={!isRecognitionSupported}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                !isRecognitionSupported 
                  ? "opacity-50 cursor-not-allowed"
                  : theme === "dark"
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-black"
              }`}
              title="Select voice input language"
            >
              <Languages size={16} />
              <span className="hidden sm:inline">
                {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.flag}
              </span>
              <span className="hidden md:inline text-xs">
                {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
              </span>
            </button>

            {showLanguageMenu && (
              <div className={`absolute right-0 mt-2 w-59 rounded-lg shadow-xl border z-20 max-h-96 overflow-y-auto ${
                theme === "dark"
                  ? "bg-slate-700 border-gray-600"
                  : "bg-white border-gray-200"
              }`}>
                <div className={`sticky top-0 px-4 py-2 text-xs font-semibold border-b ${
                  theme === "dark" 
                    ? "bg-slate-800 border-gray-600 text-gray-400" 
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}>
                  Select Language / भाषा चुनें
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full px-5 py-3 text-left flex items-center gap-6 transition-colors ${
                      selectedLanguage === lang.code
                        ? theme === "dark"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : theme === "dark"
                        ? "hover:bg-slate-600 text-white"
                        : "hover:bg-gray-100 text-black"
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{lang.name}</div>
                      <div className="text-xs opacity-75">{lang.nativeName}</div>
                    </div>
                    {selectedLanguage === lang.code && (
                      <CheckCircle2 size={16} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={!isRecognitionSupported}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50"
                : theme === "dark"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } ${!isRecognitionSupported ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
            title={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening ? (
              <>
                <MicOff size={18} className="animate-pulse" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic size={18} />
                <span>Voice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={`${placeholder} You can also use voice input in your preferred language!`}
        rows={rows}
        className={`w-full px-4 py-3 rounded-lg border-2 transition-all outline-none resize-none ${
          theme === "dark"
            ? "bg-slate-700 border-gray-600 focus:border-blue-500 text-white placeholder-gray-400"
            : "bg-white border-gray-300 focus:border-blue-500 text-black placeholder-gray-500"
        }`}
      />
      
      {/* Live transcript buffer (interim results) */}
      {transcriptBuffer && isListening && (
        <div className={`mt-2 p-2 rounded-lg border-l-4 border-blue-500 ${
          theme === "dark" ? "bg-blue-900/20" : "bg-blue-50"
        }`}>
          <p className="text-sm italic text-blue-600 dark:text-blue-400">
            Recognizing: "{transcriptBuffer}"
          </p>
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-red-500 animate-pulse">
            <Volume2 size={16} className="animate-bounce" />
            <span className="font-medium">
              Listening in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
            </span>
          </div>
          {sessionActive && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150"></div>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {voiceError && (
        <div className={`mt-2 p-3 rounded-lg border-l-4 border-orange-500 ${
          theme === "dark" ? "bg-orange-900/20" : "bg-orange-50"
        }`}>
          <p className="text-orange-600 dark:text-orange-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{voiceError}</span>
          </p>
        </div>
      )}

      {/* Character count and tips */}
      <div className="flex items-center justify-between mt-1">
        <p className={`text-xs ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          {value.length} characters
        </p>
        {!isListening && isRecognitionSupported && value.length === 0 && (
          <p className={`text-xs ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>
            💡 Tip: Click Voice to speak in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
          </p>
        )}
      </div>
    </div>
  );
}

export default Voice;