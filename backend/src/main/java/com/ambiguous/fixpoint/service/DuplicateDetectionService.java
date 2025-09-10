package com.ambiguous.fixpoint.service;

import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class DuplicateDetectionService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private MultiAIService multiAIService;

    private static final double LOCATION_THRESHOLD = 10.0; // km (increased for better detection)
    private static final double DESCRIPTION_SIMILARITY_THRESHOLD = 0.2; // reduced for better detection
    private static final int TIME_WINDOW_HOURS = 720; // 30 days (increased for better detection)

    /**
     * Check for duplicate reports based on location, description, and time
     */
    public List<Report> findPotentialDuplicates(Report newReport) {
        LocalDateTime timeThreshold = LocalDateTime.now().minusHours(TIME_WINDOW_HOURS);
        
        System.out.println("Checking for duplicates. Time threshold: " + timeThreshold);
        System.out.println("New report category: " + newReport.getCategory());
        System.out.println("New report location: " + newReport.getLatitude() + ", " + newReport.getLongitude());
        
        // Get recent reports in the same category
        List<Report> recentReports = reportRepository.findByCategoryAndCreatedAtAfter(
            newReport.getCategory(), timeThreshold);

        System.out.println("Found " + recentReports.size() + " recent reports in same category");

        List<Report> duplicates = new ArrayList<>();

        for (Report existingReport : recentReports) {
            System.out.println("🔍 Checking report ID: " + existingReport.getId());
            System.out.println("📝 Existing description: '" + existingReport.getDescription() + "'");
            System.out.println("📝 New description: '" + newReport.getDescription() + "'");
            
            if (isDuplicate(newReport, existingReport)) {
                System.out.println("✅ *** DUPLICATE FOUND! Report ID: " + existingReport.getId() + " ***");
                duplicates.add(existingReport);
            } else {
                System.out.println("❌ Not a duplicate - Report ID: " + existingReport.getId());
            }
            System.out.println("---");
        }

        System.out.println("Found " + duplicates.size() + " duplicates");
        return duplicates;
    }

    /**
     * Comprehensive duplicate check
     */
    private boolean isDuplicate(Report newReport, Report existingReport) {
        try {
            System.out.println("=== isDuplicate called for report ID: " + existingReport.getId() + " ===");
            
            // Skip if same report
            if (newReport.getId() != null && newReport.getId().equals(existingReport.getId())) {
                System.out.println("Skipping same report ID");
                return false;
            }

            System.out.println("New report: lat=" + newReport.getLatitude() + ", lng=" + newReport.getLongitude() + ", desc='" + newReport.getDescription() + "'");
            System.out.println("Existing report: lat=" + existingReport.getLatitude() + ", lng=" + existingReport.getLongitude() + ", desc='" + existingReport.getDescription() + "'");

            // Check location proximity
            boolean locationMatch = isLocationSimilar(
                newReport.getLatitude(), newReport.getLongitude(),
                existingReport.getLatitude(), existingReport.getLongitude()
            );

            // Check description similarity
            boolean descriptionMatch = isDescriptionSimilar(
                newReport.getDescription(), existingReport.getDescription()
            );

            // Check category match
            boolean categoryMatch = newReport.getCategory().equals(existingReport.getCategory());

            System.out.println("Duplicate check for report:");
            System.out.println("Location match: " + locationMatch);
            System.out.println("Description match: " + descriptionMatch);
            System.out.println("Category match: " + categoryMatch);
            if (newReport.getLatitude() != null && existingReport.getLatitude() != null) {
                System.out.println("Distance: " + calculateDistance(newReport.getLatitude(), newReport.getLongitude(), 
                                                                   existingReport.getLatitude(), existingReport.getLongitude()));
            }

            // Consider it a duplicate if location + category match, or location + description match
            boolean isDup = locationMatch && (categoryMatch || descriptionMatch);
            System.out.println("Is duplicate: " + isDup);
            System.out.println("---");
            return isDup;
        } catch (Exception e) {
            System.out.println("ERROR in isDuplicate: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private boolean isLocationSimilar(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return false;
        }

        double distance = calculateDistance(lat1, lon1, lat2, lon2);
        return distance <= LOCATION_THRESHOLD;
    }

    /**
     * Haversine formula for distance calculation
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in km
    }

    /**
     * Enhanced description similarity using AI + basic similarity
     */
    private boolean isDescriptionSimilar(String desc1, String desc2) {
        if (desc1 == null || desc2 == null) {
            System.out.println("🚫 One description is null");
            return false;
        }

        System.out.println("🧠 Analyzing descriptions:");
        System.out.println("   Description 1: '" + desc1 + "'");
        System.out.println("   Description 2: '" + desc2 + "'");

        // First try basic similarity for quick wins
        String[] words1 = desc1.toLowerCase().split("\\W+");
        String[] words2 = desc2.toLowerCase().split("\\W+");
        double basicSimilarity = calculateJaccardSimilarity(words1, words2);
        
        System.out.println("📊 Basic similarity score: " + basicSimilarity);
        
        // If basic similarity is high, no need for AI
        if (basicSimilarity >= 0.8) {  // Raised threshold so AI gets used more often
            System.out.println("✅ Very high basic similarity (" + basicSimilarity + "), considering as duplicate");
            return true;
        }
        
        // If basic similarity is very low, skip AI to save resources  
        if (basicSimilarity < 0.05) {  // Lowered threshold so AI gets used more often
            System.out.println("❌ Very low basic similarity (" + basicSimilarity + "), skipping AI check");
            return false;
        }
        
        // Use AI for semantic similarity in the middle range
        System.out.println("🤖 Using AI for semantic similarity check (basic similarity: " + basicSimilarity + ")...");
        boolean aiResult = isSemanticallySimilar(desc1, desc2);
        System.out.println("🎯 AI result: " + aiResult);
        return aiResult;
    }

    /**
     * Calculate Jaccard similarity coefficient
     */
    private double calculateJaccardSimilarity(String[] words1, String[] words2) {
        java.util.Set<String> set1 = new java.util.HashSet<>(java.util.Arrays.asList(words1));
        java.util.Set<String> set2 = new java.util.HashSet<>(java.util.Arrays.asList(words2));

        // Find intersection
        java.util.Set<String> intersection = new java.util.HashSet<>(set1);
        intersection.retainAll(set2);

        // Find union
        java.util.Set<String> union = new java.util.HashSet<>(set1);
        union.addAll(set2);

        // Calculate Jaccard coefficient
        if (union.isEmpty()) {
            return 0.0;
        }
        
        return (double) intersection.size() / union.size();
    }

    /**
     * AI-powered semantic similarity check using Gemini
     */
    private boolean isSemanticallySimilar(String description1, String description2) {
        try {
            // Skip AI if descriptions are too similar already (basic check)
            String[] words1 = description1.toLowerCase().split("\\W+");
            String[] words2 = description2.toLowerCase().split("\\W+");
            double basicSimilarity = calculateJaccardSimilarity(words1, words2);
            
            if (basicSimilarity > 0.7) {
                System.out.println("High basic similarity (" + basicSimilarity + "), skipping AI check");
                return true;
            }

            // Use AI to determine semantic similarity
            String prompt = buildSemanticSimilarityPrompt(description1, description2);
            String aiResponse = multiAIService.analyzeTextWithGemini(prompt);
            
            System.out.println("AI semantic analysis result: " + aiResponse);
            
            // Parse AI response for similarity score
            return parseSemanticSimilarityResponse(aiResponse);
            
        } catch (Exception e) {
            System.err.println("Error in AI semantic similarity check: " + e.getMessage());
            // Fall back to basic similarity
            String[] words1 = description1.toLowerCase().split("\\W+");
            String[] words2 = description2.toLowerCase().split("\\W+");
            return calculateJaccardSimilarity(words1, words2) > DESCRIPTION_SIMILARITY_THRESHOLD;
        }
    }

    private String buildSemanticSimilarityPrompt(String desc1, String desc2) {
        return String.format(
            "Analyze if these two issue descriptions refer to the same problem or very similar problems that could be duplicates:\n\n" +
            "Description 1: \"%s\"\n" +
            "Description 2: \"%s\"\n\n" +
            "Consider factors like:\n" +
            "- Same type of infrastructure issue (roads, lighting, waste, etc.)\n" +
            "- Similar problem description (potholes, damages, blockages, etc.)\n" +
            "- Could reasonably be the same physical issue\n\n" +
            "Respond with ONLY 'SIMILAR' if they likely refer to the same issue, or 'DIFFERENT' if they are clearly different issues.\n" +
            "Examples:\n" +
            "- 'Large pothole on Main St' and 'Road damage on Main Street' = SIMILAR\n" +
            "- 'Broken streetlight' and 'Pothole on road' = DIFFERENT\n" +
            "- 'Garbage not collected' and 'Waste management issue' = SIMILAR\n\n" +
            "Response:",
            desc1, desc2
        );
    }

    private boolean parseSemanticSimilarityResponse(String response) {
        if (response == null) return false;
        
        String cleanResponse = response.trim().toUpperCase();
        
        // Look for SIMILAR in the response
        if (cleanResponse.contains("SIMILAR")) {
            System.out.println("AI determined descriptions are SIMILAR");
            return true;
        } else if (cleanResponse.contains("DIFFERENT")) {
            System.out.println("AI determined descriptions are DIFFERENT");
            return false;
        }
        
        // If unclear response, fall back to basic similarity
        System.out.println("Unclear AI response, falling back to basic similarity");
        return false;
    }

    /**
     * Get duplicate score for ranking
     */
    public double getDuplicateScore(Report newReport, Report existingReport) {
        double locationScore = 0.0;
        double descriptionScore = 0.0;
        double categoryScore = 0.0;

        // Location score (inverse of distance)
        if (newReport.getLatitude() != null && newReport.getLongitude() != null &&
            existingReport.getLatitude() != null && existingReport.getLongitude() != null) {
            double distance = calculateDistance(
                newReport.getLatitude(), newReport.getLongitude(),
                existingReport.getLatitude(), existingReport.getLongitude()
            );
            locationScore = Math.max(0, 1 - (distance / LOCATION_THRESHOLD));
        }

        // Description similarity score
        if (newReport.getDescription() != null && existingReport.getDescription() != null) {
            String[] words1 = newReport.getDescription().toLowerCase().split("\\W+");
            String[] words2 = existingReport.getDescription().toLowerCase().split("\\W+");
            descriptionScore = calculateJaccardSimilarity(words1, words2);
        }

        // Category score
        if (newReport.getCategory() != null && newReport.getCategory().equals(existingReport.getCategory())) {
            categoryScore = 1.0;
        }

        // Weighted combination
        return (locationScore * 0.4) + (descriptionScore * 0.4) + (categoryScore * 0.2);
    }

    /**
     * Get ranked list of duplicates with scores
     */
    public List<DuplicateResult> findRankedDuplicates(Report newReport) {
        List<Report> potentialDuplicates = findPotentialDuplicates(newReport);
        
        return potentialDuplicates.stream()
            .map(duplicate -> new DuplicateResult(duplicate, getDuplicateScore(newReport, duplicate)))
            .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
            .collect(Collectors.toList());
    }

    /**
     * Inner class for duplicate results with scores
     */
    public static class DuplicateResult {
        private Report report;
        private double score;

        public DuplicateResult(Report report, double score) {
            this.report = report;
            this.score = score;
        }

        public Report getReport() { return report; }
        public double getScore() { return score; }
        public void setReport(Report report) { this.report = report; }
        public void setScore(double score) { this.score = score; }
    }
}
