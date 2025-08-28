package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.dto.AIDescriptionResponse;
import com.ambiguous.fixpoint.service.AIImageAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIController {

    @Autowired
    private AIImageAnalysisService aiImageAnalysisService;

    @PostMapping("/analyze-image")
    public ResponseEntity<AIDescriptionResponse> analyzeImage(@RequestParam("image") MultipartFile image) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AIDescriptionResponse(null, false, "No image provided"));
            }

            // Validate image type
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                    .body(new AIDescriptionResponse(null, false, "Invalid file type. Please upload an image."));
            }

            // Validate file size (10MB limit)
            if (image.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(new AIDescriptionResponse(null, false, "Image size should be less than 10MB"));
            }

            String description = aiImageAnalysisService.analyzeImageAndGenerateDescription(image);
            return ResponseEntity.ok(new AIDescriptionResponse(description));

        } catch (Exception e) {
            // If AI service fails, provide fallback
            String fallbackDescription = aiImageAnalysisService.generateFallbackDescription(image.getOriginalFilename());
            return ResponseEntity.ok(new AIDescriptionResponse(fallbackDescription, false, 
                "AI analysis unavailable. Please edit the generated description."));
        }
    }
}
