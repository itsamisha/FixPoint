package com.ambiguous.fixpoint.repository;

import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    // Default findAll method with User and Organization relationships eagerly fetched
    @Query("SELECT DISTINCT r FROM Report r " +
           "LEFT JOIN FETCH r.reporter " +
           "LEFT JOIN FETCH r.assignedTo " +
           "LEFT JOIN FETCH r.targetOrganizations")
    List<Report> findAllWithUsers();
    
    List<Report> findByReporter(User reporter);
    
    List<Report> findByStatus(Report.Status status);
    
    List<Report> findByCategory(Report.Category category);
    
    Page<Report> findByStatusOrderByCreatedAtDesc(Report.Status status, Pageable pageable);
    
    Page<Report> findByCategoryOrderByCreatedAtDesc(Report.Category category, Pageable pageable);
    
    Page<Report> findByReporterOrderByCreatedAtDesc(User reporter, Pageable pageable);
    
    @Query("SELECT r FROM Report r LEFT JOIN FETCH r.reporter LEFT JOIN FETCH r.assignedTo WHERE r.assignedTo = :user ORDER BY r.createdAt DESC")
    Page<Report> findByAssignedToOrderByCreatedAtDesc(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT r FROM Report r WHERE r.latitude BETWEEN :minLat AND :maxLat " +
           "AND r.longitude BETWEEN :minLng AND :maxLng")
    List<Report> findReportsInArea(@Param("minLat") Double minLat, 
                                  @Param("maxLat") Double maxLat,
                                  @Param("minLng") Double minLng, 
                                  @Param("maxLng") Double maxLng);
    
    @Query("SELECT r FROM Report r LEFT JOIN FETCH r.reporter LEFT JOIN FETCH r.assignedTo WHERE r.status = :status AND r.category = :category " +
           "ORDER BY r.createdAt DESC")
    Page<Report> findByStatusAndCategoryOrderByCreatedAtDesc(@Param("status") Report.Status status,
                                                            @Param("category") Report.Category category,
                                                            Pageable pageable);
    
    @Query("SELECT r FROM Report r WHERE r.createdAt >= :startDate ORDER BY r.voteCount DESC")
    List<Report> findTopVotedReportsAfterDate(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(r) FROM Report r WHERE r.status = :status")
    Long countByStatus(@Param("status") Report.Status status);
    
    @Query("SELECT COUNT(r) FROM Report r WHERE r.category = :category")
    Long countByCategory(@Param("category") Report.Category category);
    
    @Query("SELECT r FROM Report r ORDER BY r.voteCount DESC")
    Page<Report> findAllOrderByVoteCountDesc(Pageable pageable);
    
    // Find reports assigned to a specific user
    Page<Report> findByAssignedToId(Long assignedToId, Pageable pageable);
    
    // Find reports targeted to a specific organization
    @Query("SELECT r FROM Report r JOIN r.targetOrganizations o WHERE o.id = :organizationId")
    Page<Report> findByTargetOrganizationsId(@Param("organizationId") Long organizationId, Pageable pageable);
    
    // For duplicate detection
    List<Report> findByCategoryAndCreatedAtAfter(Report.Category category, LocalDateTime createdAt);
    
    // Find all reports, prioritizing those with images first, then by latest created date
    @Query("SELECT DISTINCT r FROM Report r " +
           "LEFT JOIN FETCH r.reporter " +
           "LEFT JOIN FETCH r.assignedTo " +
           "LEFT JOIN FETCH r.targetOrganizations " +
           "ORDER BY " +
           "CASE WHEN r.imagePath IS NOT NULL AND r.imagePath != '' THEN 0 ELSE 1 END, " +
           "r.createdAt DESC")
    Page<Report> findAllWithImagesPrioritizedOrderByCreatedAtDesc(Pageable pageable);
    
    // Find reports by status, prioritizing those with images first, then by latest created date
    @Query("SELECT DISTINCT r FROM Report r " +
           "LEFT JOIN FETCH r.reporter " +
           "LEFT JOIN FETCH r.assignedTo " +
           "LEFT JOIN FETCH r.targetOrganizations " +
           "WHERE r.status = :status ORDER BY " +
           "CASE WHEN r.imagePath IS NOT NULL AND r.imagePath != '' THEN 0 ELSE 1 END, " +
           "r.createdAt DESC")
    Page<Report> findByStatusWithImagesPrioritizedOrderByCreatedAtDesc(@Param("status") Report.Status status, Pageable pageable);
    
    // Find reports by category, prioritizing those with images first, then by latest created date
    @Query("SELECT DISTINCT r FROM Report r " +
           "LEFT JOIN FETCH r.reporter " +
           "LEFT JOIN FETCH r.assignedTo " +
           "LEFT JOIN FETCH r.targetOrganizations " +
           "WHERE r.category = :category ORDER BY " +
           "CASE WHEN r.imagePath IS NOT NULL AND r.imagePath != '' THEN 0 ELSE 1 END, " +
           "r.createdAt DESC")
    Page<Report> findByCategoryWithImagesPrioritizedOrderByCreatedAtDesc(@Param("category") Report.Category category, Pageable pageable);
    
    // Find reports with images, ordered by latest first
    @Query("SELECT r FROM Report r WHERE r.imagePath IS NOT NULL AND r.imagePath != '' ORDER BY r.createdAt DESC")
    Page<Report> findReportsWithImagesOrderByCreatedAtDesc(Pageable pageable);
    
    // Find reports with images by status, ordered by latest first
    @Query("SELECT r FROM Report r WHERE r.imagePath IS NOT NULL AND r.imagePath != '' AND r.status = :status ORDER BY r.createdAt DESC")
    Page<Report> findReportsWithImagesByStatusOrderByCreatedAtDesc(@Param("status") Report.Status status, Pageable pageable);
    
    // Find reports with images by category, ordered by latest first
    @Query("SELECT r FROM Report r WHERE r.imagePath IS NOT NULL AND r.imagePath != '' AND r.category = :category ORDER BY r.createdAt DESC")
    Page<Report> findReportsWithImagesByCategoryOrderByCreatedAtDesc(@Param("category") Report.Category category, Pageable pageable);
}
