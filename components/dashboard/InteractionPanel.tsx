import React, { useState, useRef, useEffect } from 'react';
import { JournalEntry } from '../../types';
import { analyzeWellness, analyzeWellnessTextOnly } from '../../services/geminiService';

interface InteractionPanelProps {
  onNewEntry: (entry: JournalEntry) => void;
}

const InteractionPanel: React.FC<InteractionPanelProps> = ({ onNewEntry }) => {
  const [text, setText] = useState('');
  const [sleepHours, setSleepHours] = useState(8);
  const [stressLevel, setStressLevel] = useState(5);
  const [facialImage, setFacialImage] = useState<string | undefined>(undefined); // Now holds the full data URI
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null); // For SpeechRecognition
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // FIX: Property 'SpeechRecognition' does not exist on type 'Window & typeof globalThis'.
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        // Append final transcript to existing text
        if (finalTranscript) {
            setText(prevText => (prevText ? prevText.trim() + ' ' : '') + finalTranscript.trim() + '. ');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    } else {
      console.warn('Speech Recognition not supported by this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFacialImage(result); // Store the full data URI
      };
      reader.onerror = () => {
        setError("Failed to read the selected file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearPhoto = () => {
    setFacialImage(undefined);
    if(fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && !facialImage) {
      setError("Please add a journal entry or upload a photo to continue.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let analysis;

      if (facialImage) {
        const parts = facialImage.split(',');
        const mimeTypePart = parts[0].match(/:(.*?);/);
        const imageMimeType = mimeTypePart ? mimeTypePart[1] : undefined;
        const imageBase64 = parts[1];

        if (imageBase64 && imageMimeType) {
            analysis = await analyzeWellness({ text, sleepHours, stressLevel, imageBase64, imageMimeType });
        } else {
            // This case might happen if data URI is malformed, so we treat it as text-only
            // but we need to ensure text is present
             if(!text.trim()) {
                throw new Error("Invalid image format. Please upload a valid image or add a text entry.");
             }
            analysis = await analyzeWellnessTextOnly({ text, sleepHours, stressLevel });
        }
      } else {
          // No image, text must be present due to initial validation.
          analysis = await analyzeWellnessTextOnly({ text, sleepHours, stressLevel });
      }

      const newEntry: JournalEntry = {
        id: new Date().toISOString() + Math.random().toString(36),
        date: new Date().toISOString(),
        transcribedText: text,
        analysis,
        facialImage, // Store the full data URI
        sleepHours,
        stressLevel
      };

      onNewEntry(newEntry);

      // Reset form
      setText('');
      setSleepHours(8);
      setStressLevel(5);
      setFacialImage(undefined);
      if(fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-lg p-6 space-y-6 ring-1 ring-slate-700">
      <h2 className="text-xl font-bold text-slate-100">Create a New Entry</h2>
      
      {/* Journal Text Area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How are you feeling today? You can type or use the microphone to speak."
          className="w-full h-40 bg-slate-700 text-slate-200 p-4 rounded-lg border border-slate-600 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none transition"
          disabled={isLoading}
        />
        <button 
          onClick={handleToggleRecording}
          title={isRecording ? "Stop Recording" : "Start Recording"}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-600 hover:bg-slate-500 text-slate-200'}`}
          disabled={isLoading}
        >
          {/* Microphone Icon */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v1h6v-1h-2v-2.07z" clipRule="evenodd" /></svg>
        </button>
      </div>

      {/* Metrics Sliders */}
      <div className="space-y-4">
        <div>
          <label htmlFor="sleep" className="flex justify-between text-sm font-medium text-slate-300 mb-1">
            <span>Hours of Sleep</span>
            <span className="font-bold text-amber-400">{sleepHours} hrs</span>
          </label>
          <input
            id="sleep"
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            disabled={isLoading}
          />
        </div>
        <div>
           <label htmlFor="stress" className="flex justify-between text-sm font-medium text-slate-300 mb-1">
            <span>Stress Level</span>
            <span className="font-bold text-amber-400">{stressLevel} / 10</span>
          </label>
          <input
            id="stress"
            type="range"
            min="1"
            max="10"
            step="1"
            value={stressLevel}
            onChange={(e) => setStressLevel(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            disabled={isLoading}
          />
        </div>
      </div>
      
      {/* Facial Image Upload */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-300">Facial Expression (Optional)</p>
        <div className="bg-slate-700 rounded-lg p-4 flex flex-col items-center space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg"
          />
          {facialImage ? (
            <div className="relative">
              <img src={facialImage} alt="Uploaded facial expression" className="w-full max-w-xs h-auto rounded-md" />
              <button onClick={handleClearPhoto} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors" title="Remove Photo">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          ) : (
            <button onClick={handleUploadClick} className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Upload Photo
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-center text-red-400">{error}</p>}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || (!text.trim() && !facialImage)}
        className="w-full bg-amber-500 text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-lg transition-transform transform hover:scale-105 disabled:bg-amber-500/50 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isLoading ? 'Analyzing...' : 'Save & Analyze Entry'}
      </button>
    </div>
  );
};

export default InteractionPanel;