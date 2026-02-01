import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Languages, AlertCircle } from 'lucide-react';
import { useTheme } from '../Context/Theme';

// Supported languages for voice input
export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur-IN', name: 'اردو', flag: '🇮🇳' },
  { code: 'or-IN', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
];

function Voice({ value, onChange, placeholder = "Describe your issue...", rows = 4 }) {
  const { theme } = useTheme();
  
  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  
  // Refs
  const recognitionRef = useRef(null);
  const languageMenuRef = useRef(null);
  const lastProcessedIndexRef = useRef(0);

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

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configuration to prevent word repetition
      recognitionRef.current.continuous = false; // Changed to false to prevent repeated processing
      recognitionRef.current.interimResults = false; // Changed to false for better accuracy
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onresult = (event) => {
        // Only process new results
        for (let i = lastProcessedIndexRef.current; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim();
            
            // Only add non-empty transcripts
            if (transcript) {
              // Add a space before new text if there's existing content
              const separator = value.trim() ? ' ' : '';
              onChange({ target: { value: value + separator + transcript } });
            }
            
            lastProcessedIndexRef.current = i + 1;
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          setVoiceError('Microphone access denied. Please enable microphone permissions.');
        } else if (event.error === 'network') {
          setVoiceError('Network error. Please check your internet connection.');
        } else if (event.error === 'aborted') {
          // Silently handle aborted errors (expected when stopping)
          return;
        } else {
          setVoiceError(`Voice input error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        // Auto-restart if still in listening mode (for continuous listening)
        if (isListening) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            // Ignore errors when already started
            if (error.message !== 'recognition has already been started') {
              console.error('Error restarting recognition:', error);
              setIsListening(false);
            }
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore stop errors
        }
      }
    };
  }, [selectedLanguage, isListening, value, onChange]);

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setVoiceError('Speech recognition not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      // Stop listening
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    } else {
      // Start listening
      setVoiceError("");
      lastProcessedIndexRef.current = 0;
      
      try {
        recognitionRef.current.lang = selectedLanguage;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        setVoiceError('Failed to start voice input. Please try again.');
      }
    }
  };

  // Change language
  const handleLanguageChange = (langCode) => {
    const wasListening = isListening;
    
    // Stop current recognition if active
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        // Ignore errors
      }
    }

    setSelectedLanguage(langCode);
    setShowLanguageMenu(false);

    // Restart with new language if was listening
    if (wasListening) {
      setTimeout(() => {
        try {
          recognitionRef.current.lang = langCode;
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Error restarting with new language:', error);
        }
      }, 300);
    }
  };

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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                theme === "dark"
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-black"
              }`}
              title="Select voice input language"
            >
              <Languages size={16} />
              <span className="hidden sm:inline">
                {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.flag}
              </span>
            </button>

            {showLanguageMenu && (
              <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-xl border z-20 max-h-96 overflow-y-auto ${
                theme === "dark"
                  ? "bg-slate-700 border-gray-600"
                  : "bg-white border-gray-200"
              }`}>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full px-4 py-2 text-left flex items-center gap-2 transition-colors ${
                      selectedLanguage === lang.code
                        ? theme === "dark"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : theme === "dark"
                        ? "hover:bg-slate-600 text-white"
                        : "hover:bg-gray-100 text-black"
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={!recognitionRef.current}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                : theme === "dark"
                ? "bg-slate-700 hover:bg-slate-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-black"
            } ${!recognitionRef.current ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            <span className="hidden sm:inline">
              {isListening ? "Stop" : "Voice"}
            </span>
          </button>
        </div>
      </div>

      <textarea
        value={value}
        onChange={onChange}
        placeholder={`${placeholder} You can also use voice input in your preferred language!`}
        rows={rows}
        className={`w-full px-4 py-3 rounded-lg border-2 transition-all outline-none resize-none ${
          theme === "dark"
            ? "bg-slate-700 border-gray-600 focus:border-blue-500 text-white"
            : "bg-white border-gray-300 focus:border-blue-500 text-black"
        }`}
      />
      
      {isListening && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-500 animate-pulse">
          <Volume2 size={16} />
          <span>
            Listening in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}... Speak now
          </span>
        </div>
      )}

      {voiceError && (
        <p className="text-orange-500 text-sm mt-1 flex items-center gap-1">
          <AlertCircle size={14} /> {voiceError}
        </p>
      )}

      <p className={`text-xs mt-1 ${
        theme === "dark" ? "text-gray-400" : "text-gray-500"
      }`}>
        {value.length} characters
      </p>
    </div>
  );
}

export default Voice;