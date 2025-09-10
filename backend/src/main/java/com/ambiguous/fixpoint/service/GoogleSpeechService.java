package com.ambiguous.fixpoint.service;

import com.google.cloud.speech.v1.*;
import com.google.protobuf.ByteString;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Service
public class GoogleSpeechService {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleSpeechService.class);
    
    @Value("${google.cloud.project-id:}")
    private String projectId;
    
    @Value("${google.cloud.speech.enabled:false}")
    private boolean speechEnabled;
    
    /**
     * Convert speech audio to text using Google Cloud Speech-to-Text API
     * @param base64Audio Base64 encoded audio data
     * @return Recognized text from the audio
     */
    public String convertSpeechToText(String base64Audio) {
        if (!speechEnabled) {
            logger.warn("Google Speech-to-Text is disabled. Using mock response.");
            return getMockTranscript();
        }
        
        try {
            // Decode base64 audio
            byte[] audioBytes = Base64.getDecoder().decode(base64Audio);
            
            // Create recognition config
            RecognitionConfig config = RecognitionConfig.newBuilder()
                .setLanguageCode("en-US")
                .setEncoding(RecognitionConfig.AudioEncoding.WEBM_OPUS)
                .setSampleRateHertz(48000)
                .setModel("latest_long")
                .setEnableAutomaticPunctuation(true)
                .setEnableWordTimeOffsets(false)
                .build();
            
            // Create recognition audio
            RecognitionAudio audio = RecognitionAudio.newBuilder()
                .setContent(ByteString.copyFrom(audioBytes))
                .build();
            
            // Create speech client
            try (SpeechClient speechClient = SpeechClient.create()) {
                // Perform recognition
                RecognizeResponse response = speechClient.recognize(config, audio);
                
                // Extract transcript
                StringBuilder transcript = new StringBuilder();
                List<SpeechRecognitionResult> results = response.getResultsList();
                
                for (SpeechRecognitionResult result : results) {
                    List<SpeechRecognitionAlternative> alternatives = result.getAlternativesList();
                    for (SpeechRecognitionAlternative alternative : alternatives) {
                        transcript.append(alternative.getTranscript()).append(" ");
                    }
                }
                
                String finalTranscript = transcript.toString().trim();
                logger.info("Speech recognition successful. Transcript: {}", finalTranscript);
                return finalTranscript;
                
            } catch (IOException e) {
                logger.error("Error creating SpeechClient: {}", e.getMessage());
                return getMockTranscript();
            }
            
        } catch (Exception e) {
            logger.error("Error in speech recognition: {}", e.getMessage());
            return getMockTranscript();
        }
    }
    
    /**
     * Get a mock transcript for testing purposes
     * @return Mock transcript text
     */
    private String getMockTranscript() {
        return "This is a mock transcript from Google Speech-to-Text API. In production, this would be the actual recognized speech from your audio input.";
    }
    
    /**
     * Check if Google Speech-to-Text is enabled
     * @return true if enabled, false otherwise
     */
    public boolean isEnabled() {
        return speechEnabled;
    }
    
    /**
     * Get the Google Cloud project ID
     * @return Project ID string
     */
    public String getProjectId() {
        return projectId;
    }
}
