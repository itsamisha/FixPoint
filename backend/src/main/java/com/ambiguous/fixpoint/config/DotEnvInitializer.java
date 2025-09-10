package com.ambiguous.fixpoint.config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.PropertiesPropertySource;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

/**
 * Loads environment variables from .env file
 */
public class DotEnvInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        
        // Look for .env file in the project root
        Path envFile = Paths.get(".env");
        
        if (Files.exists(envFile)) {
            try {
                Properties props = new Properties();
                props.load(new FileInputStream(envFile.toFile()));
                
                // Add the properties to Spring's environment
                environment.getPropertySources().addLast(
                    new PropertiesPropertySource("dotenv", props)
                );
                
                System.out.println("✅ Loaded .env file successfully");
                
                // Debug: Print loaded properties (without sensitive values)
                props.forEach((key, value) -> {
                    String keyStr = key.toString();
                    if (keyStr.contains("PASSWORD") || keyStr.contains("SECRET") || keyStr.contains("KEY")) {
                        System.out.println("🔒 " + keyStr + "=***");
                    } else {
                        System.out.println("📝 " + keyStr + "=" + value);
                    }
                });
                
            } catch (IOException e) {
                System.err.println("❌ Failed to load .env file: " + e.getMessage());
            }
        } else {
            System.out.println("⚠️ No .env file found in project root");
        }
    }
}
