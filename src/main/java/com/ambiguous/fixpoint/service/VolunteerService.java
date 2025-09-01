package com.ambiguous.fixpoint.service;

import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.repository.UserRepository;
import com.ambiguous.fixpoint.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

@Service
public class VolunteerService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReportRepository reportRepository;

    /**
     * Get volunteer leaderboard with completed task counts and ratings
     */
    public List<Map<String, Object>> getVolunteerLeaderboard() {
        // Get all active volunteers
        List<User> volunteers = userRepository.findActiveVolunteers();
        
        return volunteers.stream()
            .map(volunteer -> {
                Map<String, Object> leaderboardEntry = new HashMap<>();
                
                // Get reports assigned to this volunteer
                List<Report> assignedReports = reportRepository.findByAssignedToId(volunteer.getId(), PageRequest.of(0, 1000)).getContent();
                
                // Calculate completed tasks
                long completedTasks = assignedReports.stream()
                    .filter(report -> report.getStatus() == Report.Status.RESOLVED || 
                                   report.getWorkStage() == Report.WorkStage.COMPLETED)
                    .count();
                
                long totalTasks = assignedReports.size();
                
                // Calculate success rate
                double successRate = totalTasks > 0 ? (double) completedTasks / totalTasks : 0.0;
                
                // Calculate rating based on completed tasks and other factors
                double rating = calculateVolunteerRating(volunteer, completedTasks, successRate);
                
                leaderboardEntry.put("id", volunteer.getId());
                leaderboardEntry.put("fullName", volunteer.getFullName());
                leaderboardEntry.put("username", volunteer.getUsername());
                leaderboardEntry.put("completedTasks", (int) completedTasks);
                leaderboardEntry.put("totalTasks", (int) totalTasks);
                leaderboardEntry.put("successRate", Math.round(successRate * 100));
                leaderboardEntry.put("rating", Math.round(rating * 10) / 10.0); // Round to 1 decimal place
                leaderboardEntry.put("avatar", generateAvatar(volunteer.getFullName()));
                
                return leaderboardEntry;
            })
            .filter(entry -> (Integer) entry.get("completedTasks") > 0) // Only show volunteers with completed tasks
            .sorted((a, b) -> Integer.compare((Integer) b.get("completedTasks"), (Integer) a.get("completedTasks")))
            .collect(Collectors.toList());
    }

    /**
     * Calculate volunteer rating based on various factors
     */
    private double calculateVolunteerRating(User volunteer, long completedTasks, double successRate) {
        double baseRating = 3.0; // Base rating starts at 3.0
        
        // Bonus for completed tasks (up to 1.0)
        double taskBonus = Math.min(completedTasks * 0.1, 1.0);
        
        // Bonus for success rate (up to 0.5)
        double successBonus = successRate * 0.5;
        
        // Bonus for being active (up to 0.3)
        double activityBonus = 0.3; // All active volunteers get this
        
        // Bonus for having skills (up to 0.2)
        double skillsBonus = volunteer.getVolunteerSkills() != null && !volunteer.getVolunteerSkills().isEmpty() ? 0.2 : 0.0;
        
        double totalRating = baseRating + taskBonus + successBonus + activityBonus + skillsBonus;
        
        // Ensure rating is between 1.0 and 5.0
        return Math.max(1.0, Math.min(5.0, totalRating));
    }

    /**
     * Generate avatar initials from full name
     */
    private String generateAvatar(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return "V";
        }
        
        String[] nameParts = fullName.trim().split("\\s+");
        if (nameParts.length >= 2) {
            return (String.valueOf(nameParts[0].charAt(0)) + String.valueOf(nameParts[1].charAt(0))).toUpperCase();
        } else {
            return fullName.substring(0, Math.min(2, fullName.length())).toUpperCase();
        }
    }

    /**
     * Get volunteer statistics for a specific volunteer
     */
    public Map<String, Object> getVolunteerStats(Long volunteerId) {
        User volunteer = userRepository.findById(volunteerId)
            .orElseThrow(() -> new RuntimeException("Volunteer not found"));
        
        if (!volunteer.getIsVolunteer()) {
            throw new RuntimeException("User is not a volunteer");
        }
        
        List<Report> assignedReports = reportRepository.findByAssignedToId(volunteer.getId(), PageRequest.of(0, 1000)).getContent();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAssigned", assignedReports.size());
        stats.put("completed", (int) assignedReports.stream()
            .filter(report -> report.getStatus() == Report.Status.RESOLVED || 
                           report.getWorkStage() == Report.WorkStage.COMPLETED)
            .count());
        stats.put("inProgress", (int) assignedReports.stream()
            .filter(report -> report.getStatus() == Report.Status.IN_PROGRESS)
            .count());
        stats.put("pending", (int) assignedReports.stream()
            .filter(report -> report.getStatus() == Report.Status.SUBMITTED)
            .count());
        
        return stats;
    }

    /**
     * Get all volunteers with basic information
     */
    public List<Map<String, Object>> getAllVolunteers() {
        List<User> volunteers = userRepository.findActiveVolunteers();
        
        return volunteers.stream()
            .map(volunteer -> {
                Map<String, Object> volunteerInfo = new HashMap<>();
                volunteerInfo.put("id", volunteer.getId());
                volunteerInfo.put("fullName", volunteer.getFullName());
                volunteerInfo.put("username", volunteer.getUsername());
                volunteerInfo.put("email", volunteer.getEmail());
                volunteerInfo.put("volunteerSkills", volunteer.getVolunteerSkills());
                volunteerInfo.put("createdAt", volunteer.getCreatedAt());
                volunteerInfo.put("isActive", volunteer.getIsActive());
                return volunteerInfo;
            })
            .collect(Collectors.toList());
    }
}
