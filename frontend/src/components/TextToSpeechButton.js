import React, { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

const TextToSpeechButton = ({ text, className = "" }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef(null);

  const speakText = () => {
    if (isSpeaking) {
      // Stop speaking
      if (speechRef.current) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return;
    }

    // Start speaking
    if ("speechSynthesis" in window) {
      speechRef.current = new SpeechSynthesisUtterance(text);
      speechRef.current.rate = 0.9; // Slightly slower for better comprehension
      speechRef.current.pitch = 1.0;
      speechRef.current.volume = 1.0;

      // Set language to English (you can make this configurable)
      speechRef.current.lang = "en-US";

      speechRef.current.onstart = () => setIsSpeaking(true);
      speechRef.current.onend = () => setIsSpeaking(false);
      speechRef.current.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(speechRef.current);
    } else {
      console.error("Text-to-speech is not supported in this browser");
    }
  };

  return (
    <div className={`tts-controls ${className}`}>
      <button
        type="button"
        onClick={speakText}
        className={`btn btn-tts ${isSpeaking ? "speaking" : ""}`}
        title={isSpeaking ? "Click to stop" : "Click to hear"}
      >
        {isSpeaking ? (
          <VolumeX size={16} className="mr-1" />
        ) : (
          <Volume2 size={16} className="mr-1" />
        )}
        {isSpeaking ? "Stop" : "Hear"}
      </button>
      {isSpeaking && <span className="speaking-indicator">🔊 Speaking...</span>}
    </div>
  );
};

export default TextToSpeechButton;
