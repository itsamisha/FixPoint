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

    private static final double LOCATION_THRESHOLD = 5.0; // km (increased for testing)
    private static final double DESCRIPTION_SIMILARITY_THRESHOLD = 0.3; // reduced for testing
    private static final int TIME_WINDOW_HOURS = 168; // 7 days (increased for testing)

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
            System.out.println("Checking report ID: " + existingReport.getId());
            if (isDuplicate(newReport, existingReport)) {
                System.out.println("*** DUPLICATE FOUND! Report ID: " + existingReport.getId() + " ***");
                duplicates.add(existingReport);
            } else {
                System.out.println("Not a duplicate - Report ID: " + existingReport.getId());
            }
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
     * Simple text similarity using Jaccard coefficient
     */
    private boolean isDescriptionSimilar(String desc1, String desc2) {
        if (desc1 == null || desc2 == null) {
            return false;
        }

        // Convert to lowercase and split into words
        String[] words1 = desc1.toLowerCase().split("\\W+");
        String[] words2 = desc2.toLowerCase().split("\\W+");

        // Calculate Jaccard similarity
        double similarity = calculateJaccardSimilarity(words1, words2);
        return similarity >= DESCRIPTION_SIMILARITY_THRESHOLD;
    }

    /**
     * Calculate Jaccard similarity coefficient
     */
    private double calculateJaccardSimilarity(String[] words1, String[] words2) {
        java.util.Set<String> set1 = java.util.Set.of(words1);
        java.util.Set<String> set2 = java.util.Set.of(words2);

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
