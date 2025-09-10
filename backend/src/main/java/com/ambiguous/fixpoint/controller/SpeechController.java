package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.service.GoogleSpeechService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@RequestMapping("/api/speech")
@CrossOrigin(origins = "*")
public class SpeechController {
    
    private static final Logger logger = LoggerFactory.getLogger(SpeechController.class);
    
    @Autowired
    private GoogleSpeechService googleSpeechService;
    
    /**
     * Convert speech audio to text
     * @param request Request containing base64 audio data
     * @return Response with recognized text
     */
    @PostMapping("/convert")
    public ResponseEntity<?> convertSpeechToText(@RequestBody Map<String, String> request) {
        try {
            String base64Audio = request.get("audio");
            
            if (base64Audio == null || base64Audio.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Audio data is required",
                    "message", "Please provide base64 encoded audio data"
                ));
            }
            
            logger.info("Received speech-to-text request. Audio length: {} characters", base64Audio.length());
            
            // Convert speech to text
            String transcript = googleSpeechService.convertSpeechToText(base64Audio);
            
            logger.info("Speech-to-text conversion successful. Transcript length: {} characters", transcript.length());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "transcript", transcript,
                "source", googleSpeechService.isEnabled() ? "Google Cloud API" : "Mock Service"
            ));
            
        } catch (Exception e) {
            logger.error("Error in speech-to-text conversion: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Speech recognition failed",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get speech service status
     * @return Response with service status information
     */
    @GetMapping("/status")
    public ResponseEntity<?> getServiceStatus() {
        try {
            return ResponseEntity.ok(Map.of(
                "enabled", googleSpeechService.isEnabled(),
                "projectId", googleSpeechService.getProjectId(),
                "service", "Google Cloud Speech-to-Text",
                "status", "operational"
            ));
        } catch (Exception e) {
            logger.error("Error getting service status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to get service status",
                "message", e.getMessage()
            ));
        }
    }
}
