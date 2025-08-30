package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.dto.AIDescriptionResponse;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.service.AIImageAnalysisService;
import com.ambiguous.fixpoint.service.MultiAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIController {

    @Autowired
    private AIImageAnalysisService aiImageAnalysisService;
    
    @Autowired
    private MultiAIService multiAIService;

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

    /**
     * Enhanced AI description generation with multiple AI provider support
     */
    @PostMapping("/analyze-image-enhanced")
    public ResponseEntity<?> analyzeImageEnhanced(
            @RequestParam("image") MultipartFile image,
            @RequestParam("category") String category) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No image provided"));
            }

            // Validate file type
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid file type. Please upload an image."));
            }

            // Validate file size (max 10MB)
            if (image.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File too large. Maximum size is 10MB."));
            }

            System.out.println("Generating enhanced AI description for category: " + category);
            
            // Use MultiAI service for better provider support
            String description = multiAIService.generateEnhancedDescription(image, category);
            Report.Priority priority = multiAIService.assessPriority(description, category);
            Map<String, Object> providerStatus = multiAIService.getProviderStatus();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("description", description);
            response.put("suggestedPriority", priority.toString());
            response.put("category", category);
            response.put("enhancedFeatures", Map.of(
                "aiGenerated", true,
                "categorySpecific", true,
                "priorityAssessment", true,
                "multiProviderSupport", true
            ));
            response.put("providerInfo", providerStatus);

            System.out.println("Enhanced AI description generated successfully using multi-provider service");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error in enhanced AI image analysis: " + e.getMessage());
            e.printStackTrace();
            
            // Fallback to basic AI service
            try {
                String fallbackDescription = aiImageAnalysisService.analyzeImageAndGenerateDescription(image);
                Map<String, Object> fallbackResponse = new HashMap<>();
                fallbackResponse.put("success", true);
                fallbackResponse.put("description", fallbackDescription);
                fallbackResponse.put("suggestedPriority", "MEDIUM");
                fallbackResponse.put("category", category);
                fallbackResponse.put("enhancedFeatures", Map.of(
                    "aiGenerated", true,
                    "categorySpecific", false,
                    "priorityAssessment", false,
                    "fallbackUsed", true
                ));
                return ResponseEntity.ok(fallbackResponse);
            } catch (Exception fallbackError) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Failed to analyze image: " + e.getMessage());
                errorResponse.put("fallbackDescription", 
                    "Unable to generate AI description. Please provide a manual description of the issue shown in the image.");
                
                return ResponseEntity.ok(errorResponse);
            }
        }
    }

    /**
     * Auto-detect category from image (future feature)
     */
    @PostMapping("/detect-category")
    public ResponseEntity<?> detectCategory(@RequestParam("image") MultipartFile image) {
        try {
            // For now, return a default category - can be enhanced later
            String detectedCategory = "ROADS_INFRASTRUCTURE";
            return ResponseEntity.ok(Map.of(
                "success", true,
                "detectedCategory", detectedCategory,
                "confidence", 0.70 // Placeholder
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "error", e.getMessage(),
                "detectedCategory", "OTHER"
            ));
        }
    }

    /**
     * Get AI analysis capabilities info
     */
    @GetMapping("/capabilities")
    public ResponseEntity<?> getCapabilities() {
        Map<String, Object> capabilities = new HashMap<>();
        capabilities.put("enhancedDescriptions", true);
        capabilities.put("categorySpecificAnalysis", true);
        capabilities.put("priorityAssessment", true);
        capabilities.put("supportedCategories", new String[]{
            "ROADS_INFRASTRUCTURE",
            "SANITATION_WASTE", 
            "STREET_LIGHTING",
            "WATER_DRAINAGE",
            "TRAFFIC_PARKING",
            "PUBLIC_SAFETY",
            "ENVIRONMENTAL"
        });
        capabilities.put("maxFileSize", "10MB");
        capabilities.put("supportedFormats", new String[]{"JPEG", "PNG", "WebP"});
        
        return ResponseEntity.ok(capabilities);
    }
}
