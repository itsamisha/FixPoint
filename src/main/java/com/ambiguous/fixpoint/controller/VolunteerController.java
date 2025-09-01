package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.service.VolunteerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/volunteers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class VolunteerController {

    @Autowired
    private VolunteerService volunteerService;

    /**
     * Get volunteer leaderboard
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getVolunteerLeaderboard() {
        try {
            List<Map<String, Object>> leaderboard = volunteerService.getVolunteerLeaderboard();
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all volunteers
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllVolunteers() {
        try {
            List<Map<String, Object>> volunteers = volunteerService.getAllVolunteers();
            return ResponseEntity.ok(volunteers);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get volunteer statistics
     */
    @GetMapping("/{volunteerId}/stats")
    public ResponseEntity<Map<String, Object>> getVolunteerStats(@PathVariable Long volunteerId) {
        try {
            Map<String, Object> stats = volunteerService.getVolunteerStats(volunteerId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
