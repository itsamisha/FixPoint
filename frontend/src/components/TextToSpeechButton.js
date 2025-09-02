import React, { useState, useRef } from "react";
import { Volume2, VolumeX, Mic, MicOff, RotateCcw } from "lucide-react";

const TextToSpeechButton = ({ text, className = "", onTextUpdate }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState("tts"); // "tts" or "stt"
  const [transcript, setTranscript] = useState("");
  const speechRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Text-to-Speech functionality
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
      speechRef.current.rate = 0.9;
      speechRef.current.pitch = 1.0;
      speechRef.current.volume = 1.0;
      speechRef.current.lang = "en-US";

      speechRef.current.onstart = () => setIsSpeaking(true);
      speechRef.current.onend = () => setIsSpeaking(false);
      speechRef.current.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(speechRef.current);
    } else {
      console.error("Text-to-speech is not supported in this browser");
    }
  };

  // Speech-to-Text functionality
  const startListening = async () => {
    try {
      console.log("Starting speech recording...");
      setIsListening(true);
      setTranscript("");

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log("Recording stopped, processing audio...");

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Convert to base64 for API
        const base64Audio = await blobToBase64(audioBlob);

        // Process the audio
        await processAudio(base64Audio);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      mediaRecorderRef.current.start();
      console.log("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsListening(false);
      setTranscript("");
    }
  };

  // Convert blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Process audio with fallback
  const processAudio = async (base64Audio) => {
    try {
      console.log("Processing audio...");

      // Try to call our backend API first
      try {
        const response = await fetch("/api/speech/convert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audio: base64Audio,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.transcript) {
          console.log("API transcript:", result.transcript);
          console.log("Source:", result.source);

          if (onTextUpdate) {
            onTextUpdate(result.transcript);
          }
        } else {
          throw new Error(result.message || "Failed to get transcript");
        }
      } catch (apiError) {
        console.log(
          "Backend API failed, using offline fallback:",
          apiError.message
        );

        // Offline fallback - simulate speech recognition
        const offlineTranscript =
          "This is an offline transcript. Your speech was recorded but the backend service is not available. Please ensure the backend is running for real speech recognition.";

        if (onTextUpdate) {
          onTextUpdate(offlineTranscript);
        }
      }

      setTranscript("");
    } catch (error) {
      console.error("Error processing audio:", error);

      // Final fallback
      const fallbackTranscript =
        "Speech recognition failed. Error: " + error.message;

      if (onTextUpdate) {
        onTextUpdate(fallbackTranscript);
      }

      setTranscript("");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
    }

    setIsListening(false);
    setTranscript("");
  };

  const toggleMode = () => {
    setMode(mode === "tts" ? "stt" : "tts");
  };

  const handleMainAction = () => {
    if (mode === "tts") {
      speakText();
    } else {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    }
  };

  const getMainButtonText = () => {
    if (mode === "tts") {
      return isSpeaking ? "Stop" : "Hear";
    } else {
      return isListening ? "Stop" : "Speak";
    }
  };

  const getMainButtonIcon = () => {
    if (mode === "tts") {
      return isSpeaking ? (
        <VolumeX size={16} className="mr-1" />
      ) : (
        <Volume2 size={16} className="mr-1" />
      );
    } else {
      return isListening ? (
        <MicOff size={16} className="mr-1" />
      ) : (
        <Mic size={16} className="mr-1" />
      );
    }
  };

  const getMainButtonClass = () => {
    if (mode === "tts") {
      return isSpeaking ? "speaking" : "";
    } else {
      return isListening ? "listening" : "";
    }
  };

  return (
    <div className={`tts-controls ${className}`}>
      {/* Mode Toggle Button */}
      <button
        type="button"
        onClick={toggleMode}
        className="btn btn-mode-toggle"
        title={`Switch to ${
          mode === "tts" ? "Speech-to-Text" : "Text-to-Speech"
        }`}
      >
        <RotateCcw size={14} />
        {mode === "tts" ? "🎤 STT" : "🔊 TTS"}
      </button>

      {/* Main Action Button */}
      <button
        type="button"
        onClick={handleMainAction}
        className={`btn btn-tts ${getMainButtonClass()}`}
        title={
          mode === "tts"
            ? isSpeaking
              ? "Click to stop"
              : "Click to hear"
            : isListening
            ? "Click to stop recording"
            : "Click to start recording"
        }
      >
        {getMainButtonIcon()}
        {getMainButtonText()}
      </button>

      {/* Status Indicator */}
      {isSpeaking && <span className="speaking-indicator">🔊 Speaking...</span>}
      {isListening && (
        <span className="listening-indicator">🎤 Listening...</span>
      )}

      {/* Live Transcript Display */}
      {isListening && transcript && (
        <span className="live-transcript">🎯 "{transcript}"</span>
      )}

      {/* Mode Info */}
      <span className="mode-info">
        {mode === "tts" ? "Text → Speech" : "Speech → Text"}
      </span>
    </div>
  );
};

export default TextToSpeechButton;
