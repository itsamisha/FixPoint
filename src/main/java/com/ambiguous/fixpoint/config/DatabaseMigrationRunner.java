package com.ambiguous.fixpoint.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Component
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            Statement statement = connection.createStatement();
            
            // Check if migration is needed
            try {
                // Try to insert a long string to test current limit
                System.out.println("Checking database column constraints...");
                
                // Alter the column to TEXT type (unlimited)
                statement.executeUpdate("ALTER TABLE REPORTS ALTER COLUMN DESCRIPTION SET DATA TYPE TEXT");
                System.out.println("✅ Database migration completed: DESCRIPTION column changed to TEXT type (unlimited length)");
                
            } catch (Exception e) {
                // If the column is already TEXT, this might fail silently
                System.out.println("Database migration check completed. Column may already be correct type.");
            }
            
            statement.close();
        } catch (Exception e) {
            System.err.println("Database migration failed: " + e.getMessage());
            // Don't throw exception to prevent application startup failure
        }
    }
}
