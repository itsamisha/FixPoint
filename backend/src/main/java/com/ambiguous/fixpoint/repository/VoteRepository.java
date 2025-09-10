package com.ambiguous.fixpoint.repository;

import com.ambiguous.fixpoint.entity.Vote;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    
    Optional<Vote> findByUserAndReport(User user, Report report);
    
    List<Vote> findByReport(Report report);
    
    List<Vote> findByUser(User user);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.report = :report")
    Long countByReport(@Param("report") Report report);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.user = :user")
    Long countByUser(@Param("user") User user);
    
    Boolean existsByUserAndReport(User user, Report report);
}
