package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.entity.Organization;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.OrganizationRepository;
import com.ambiguous.fixpoint.repository.ReportRepository;
import com.ambiguous.fixpoint.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test-data")
@CrossOrigin(origins = "*")
public class TestDataController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/add-reports/{organizationId}")
    public ResponseEntity<?> addTestReportsForOrganization(@PathVariable Long organizationId) {
        try {
            // Find the organization
            Organization organization = organizationRepository.findById(organizationId)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            // Get a citizen user to create reports
            User citizenUser = userRepository.findByUserType(User.UserType.CITIZEN)
                    .stream().findFirst().orElse(null);

            if (citizenUser == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No citizen user found");
                return ResponseEntity.badRequest().body(error);
            }

            // Define test report data
            Object[][] reportData = {
                {"Pothole on Main Street", "Large pothole causing traffic issues near the city center", 
                 Report.Category.ROADS_INFRASTRUCTURE, Report.Status.SUBMITTED, Report.Priority.HIGH,
                 23.7450, 90.4095, "Main Street, Dhaka"},
                {"Street Light Not Working", "Street light has been out for 2 weeks on Oak Avenue",
                 Report.Category.STREET_LIGHTING, Report.Status.IN_PROGRESS, Report.Priority.MEDIUM,
                 23.7461, 90.4106, "Oak Avenue, Dhaka"},
                {"Garbage Overflow", "Garbage bins overflowing in residential area",
                 Report.Category.SANITATION_WASTE, Report.Status.SUBMITTED, Report.Priority.HIGH,
                 23.7472, 90.4117, "Green Park, Dhaka"},
                {"Water Drainage Issue", "Poor drainage causing waterlogging after rain",
                 Report.Category.WATER_DRAINAGE, Report.Status.IN_PROGRESS, Report.Priority.URGENT,
                 23.7483, 90.4128, "Riverside Road, Dhaka"},
                {"Illegal Parking", "Cars blocking emergency access",
                 Report.Category.TRAFFIC_PARKING, Report.Status.RESOLVED, Report.Priority.MEDIUM,
                 23.7494, 90.4139, "Hospital Road, Dhaka"}
            };

            int createdCount = 0;
            for (Object[] data : reportData) {
                Report report = new Report();
                report.setTitle((String) data[0]);
                report.setDescription((String) data[1]);
                report.setCategory((Report.Category) data[2]);
                report.setStatus((Report.Status) data[3]);
                report.setPriority((Report.Priority) data[4]);
                report.setLatitude((Double) data[5]);
                report.setLongitude((Double) data[6]);
                report.setLocationAddress((String) data[7]);
                report.setReporter(citizenUser);
                report.setVoteCount((int) (Math.random() * 20) + 1);
                
                // Set target organization
                report.getTargetOrganizations().add(organization);
                
                // Set progress for reports in progress
                if (report.getStatus() == Report.Status.IN_PROGRESS) {
                    report.setProgressPercentage((int) (Math.random() * 70) + 10);
                    report.setWorkStage(Report.WorkStage.IN_PROGRESS);
                    report.setProgressNotes("Work is currently in progress. Updates will be provided regularly.");
                }
                
                // Set resolution for resolved reports
                if (report.getStatus() == Report.Status.RESOLVED) {
                    report.setProgressPercentage(100);
                    report.setWorkStage(Report.WorkStage.COMPLETED);
                    report.setResolvedAt(LocalDateTime.now().minusDays((int) (Math.random() * 30)));
                    report.setResolutionNotes("Issue has been successfully resolved. Thank you for reporting.");
                }
                
                // Set creation time
                report.setCreatedAt(LocalDateTime.now().minusDays((int) (Math.random() * 60)));
                
                reportRepository.save(report);
                createdCount++;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Successfully created " + createdCount + " test reports for " + organization.getName());
            response.put("organizationId", organizationId);
            response.put("organizationName", organization.getName());
            response.put("reportsCreated", createdCount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error creating test reports: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/organizations")
    public ResponseEntity<?> getAllOrganizations() {
        try {
            List<Organization> organizations = organizationRepository.findAll();
            return ResponseEntity.ok(organizations);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching organizations: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching users: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
