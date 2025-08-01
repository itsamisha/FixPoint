package com.ambiguous.fixpoint.service;

import com.ambiguous.fixpoint.dto.ReportRequest;
import com.ambiguous.fixpoint.dto.ReportSummary;
import com.ambiguous.fixpoint.dto.UserSummary;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.entity.Vote;
import com.ambiguous.fixpoint.repository.ReportRepository;
import com.ambiguous.fixpoint.repository.UserRepository;
import com.ambiguous.fixpoint.repository.VoteRepository;
import com.ambiguous.fixpoint.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private CommentRepository commentRepository;

    private final String uploadDir = "uploads/";

    public ReportSummary createReport(ReportRequest reportRequest, MultipartFile image, User reporter) {
        Report report = new Report();
        report.setTitle(reportRequest.getTitle());
        report.setDescription(reportRequest.getDescription());
        report.setCategory(reportRequest.getCategory());
        report.setPriority(reportRequest.getPriority());
        report.setLatitude(reportRequest.getLatitude());
        report.setLongitude(reportRequest.getLongitude());
        report.setLocationAddress(reportRequest.getLocationAddress());
        report.setReporter(reporter);

        // Handle image upload
        if (image != null && !image.isEmpty()) {
            try {
                String imagePath = saveImage(image);
                report.setImagePath(imagePath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image", e);
            }
        }

        Report savedReport = reportRepository.save(report);
        return convertToReportSummary(savedReport, null);
    }

    public Page<ReportSummary> getAllReports(Pageable pageable, User currentUser) {
        Page<Report> reports = reportRepository.findAll(pageable);
        return reports.map(report -> convertToReportSummary(report, currentUser));
    }

    public Page<ReportSummary> getReportsByStatus(Report.Status status, Pageable pageable, User currentUser) {
        Page<Report> reports = reportRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        return reports.map(report -> convertToReportSummary(report, currentUser));
    }

    public Page<ReportSummary> getReportsByCategory(Report.Category category, Pageable pageable, User currentUser) {
        Page<Report> reports = reportRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
        return reports.map(report -> convertToReportSummary(report, currentUser));
    }

    public Page<ReportSummary> getUserReports(User user, Pageable pageable) {
        Page<Report> reports = reportRepository.findByReporterOrderByCreatedAtDesc(user, pageable);
        return reports.map(report -> convertToReportSummary(report, user));
    }

    public Optional<ReportSummary> getReportById(Long id, User currentUser) {
        Optional<Report> report = reportRepository.findById(id);
        return report.map(r -> convertToReportSummary(r, currentUser));
    }

    public List<ReportSummary> getReportsInArea(Double minLat, Double maxLat, Double minLng, Double maxLng, User currentUser) {
        List<Report> reports = reportRepository.findReportsInArea(minLat, maxLat, minLng, maxLng);
        return reports.stream()
                .map(report -> convertToReportSummary(report, currentUser))
                .collect(Collectors.toList());
    }

    public ReportSummary updateReportStatus(Long reportId, Report.Status status, String resolutionNotes, User admin) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus(status);
        if (resolutionNotes != null) {
            report.setResolutionNotes(resolutionNotes);
        }
        
        if (status == Report.Status.RESOLVED) {
            report.setResolvedAt(LocalDateTime.now());
        }

        Report updatedReport = reportRepository.save(report);
        return convertToReportSummary(updatedReport, admin);
    }

    public ReportSummary assignReport(Long reportId, Long assigneeId, User admin) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new RuntimeException("Assignee not found"));

        report.setAssignedTo(assignee);
        Report updatedReport = reportRepository.save(report);
        return convertToReportSummary(updatedReport, admin);
    }

    public ReportSummary voteForReport(Long reportId, User user) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        // Check if user already voted
        if (voteRepository.existsByUserAndReport(user, report)) {
            // Remove vote
            Vote existingVote = voteRepository.findByUserAndReport(user, report).orElse(null);
            if (existingVote != null) {
                voteRepository.delete(existingVote);
                report.setVoteCount(report.getVoteCount() - 1);
            }
        } else {
            // Add vote
            Vote vote = new Vote(user, report);
            voteRepository.save(vote);
            report.setVoteCount(report.getVoteCount() + 1);
        }

        Report updatedReport = reportRepository.save(report);
        return convertToReportSummary(updatedReport, user);
    }

    private String saveImage(MultipartFile image) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);

        // Save file
        Files.copy(image.getInputStream(), filePath);

        return uploadDir + fileName;
    }

    private ReportSummary convertToReportSummary(Report report, User currentUser) {
        ReportSummary summary = new ReportSummary();
        summary.setId(report.getId());
        summary.setTitle(report.getTitle());
        summary.setDescription(report.getDescription());
        summary.setCategory(report.getCategory());
        summary.setStatus(report.getStatus());
        summary.setPriority(report.getPriority());
        summary.setLatitude(report.getLatitude());
        summary.setLongitude(report.getLongitude());
        summary.setLocationAddress(report.getLocationAddress());
        summary.setImagePath(report.getImagePath());
        summary.setResolutionImagePath(report.getResolutionImagePath());
        summary.setResolutionNotes(report.getResolutionNotes());
        summary.setResolvedAt(report.getResolvedAt());
        summary.setVoteCount(report.getVoteCount());
        summary.setCreatedAt(report.getCreatedAt());
        summary.setUpdatedAt(report.getUpdatedAt());

        // Set reporter info
        summary.setReporter(convertToUserSummary(report.getReporter()));

        // Set assigned user info
        if (report.getAssignedTo() != null) {
            summary.setAssignedTo(convertToUserSummary(report.getAssignedTo()));
        }

        // Set comment count
        Long commentCount = commentRepository.countByReport(report);
        summary.setCommentCount(commentCount.intValue());

        // Check if current user has voted
        if (currentUser != null) {
            boolean hasVoted = voteRepository.existsByUserAndReport(currentUser, report);
            summary.setHasUserVoted(hasVoted);
        }

        return summary;
    }

    private UserSummary convertToUserSummary(User user) {
        UserSummary userSummary = new UserSummary();
        userSummary.setId(user.getId());
        userSummary.setUsername(user.getUsername());
        userSummary.setEmail(user.getEmail());
        userSummary.setFullName(user.getFullName());
        userSummary.setRole(user.getRole());
        userSummary.setIsVolunteer(user.getIsVolunteer());
        return userSummary;
    }
}
