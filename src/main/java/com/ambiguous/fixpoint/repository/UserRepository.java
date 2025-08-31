package com.ambiguous.fixpoint.repository;

import com.ambiguous.fixpoint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Boolean existsByUsername(String username);
    
    Boolean existsByEmail(String email);
    
    List<User> findByRole(User.Role role);
    
    List<User> findByIsVolunteerTrue();
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isActive = true")
    List<User> findActiveUsersByRole(@Param("role") User.Role role);
    
    @Query("SELECT u FROM User u WHERE u.isVolunteer = true AND u.isActive = true")
    List<User> findActiveVolunteers();
    
    @Query("SELECT u FROM User u WHERE u.isActive = true ORDER BY u.createdAt DESC")
    List<User> findAllActiveUsers();
    
    List<User> findByUserType(User.UserType userType);
    
    List<User> findByOrganizationAndUserType(com.ambiguous.fixpoint.entity.Organization organization, User.UserType userType);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.organization WHERE u.id = :id")
    Optional<User> findByIdWithOrganization(@Param("id") Long id);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.organization WHERE u.username = :username")
    Optional<User> findByUsernameWithOrganization(@Param("username") String username);
}
