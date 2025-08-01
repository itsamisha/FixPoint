package com.ambiguous.fixpoint.config;

import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create a test user if no users exist
        if (userRepository.count() == 0) {
            User testUser = new User();
            testUser.setUsername("test");
            testUser.setEmail("test@example.com");
            testUser.setPassword(passwordEncoder.encode("password"));
            testUser.setFullName("Test User");
            testUser.setRole(User.Role.CITIZEN);
            testUser.setIsActive(true);
            testUser.setEmailVerified(true);
            
            userRepository.save(testUser);
            
            System.out.println("Test user created:");
            System.out.println("Username: test");
            System.out.println("Email: test@example.com");
            System.out.println("Password: password");
        }
    }
}
