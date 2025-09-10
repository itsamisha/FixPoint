package com.ambiguous.fixpoint.repository;

import com.ambiguous.fixpoint.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    
    Optional<Organization> findByName(String name);
    
    Optional<Organization> findByContactEmail(String contactEmail);
    
    List<Organization> findByIsActiveTrue();
    
    List<Organization> findByType(Organization.OrganizationType type);
    
    List<Organization> findByTypeAndIsActiveTrue(Organization.OrganizationType type);
    
    List<Organization> findByCity(String city);
    
    List<Organization> findByCityAndIsActiveTrue(String city);
    
    @Query("SELECT o FROM Organization o WHERE o.isActive = true AND " +
           "(o.serviceAreas LIKE %:area% OR o.city = :area)")
    List<Organization> findByServiceArea(String area);
    
    @Query("SELECT o FROM Organization o WHERE o.isActive = true AND " +
           "o.categories LIKE %:category%")
    List<Organization> findByCategory(String category);
    
    @Query("SELECT o FROM Organization o WHERE o.isActive = true AND " +
           "(LOWER(o.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(o.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Organization> searchByKeyword(String keyword);
    
    boolean existsByName(String name);
    
    boolean existsByContactEmail(String contactEmail);
}
