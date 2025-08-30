package com.ambiguous.fixpoint.config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Loads environment variables from .env file for local development
 * This allows developers to store sensitive API keys locally without committing them to Git
 */
public class DotEnvApplicationContextInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        
        // Look for .env file in project root
        File envFile = new File(".env");
        if (envFile.exists() && envFile.isFile()) {
            try {
                loadEnvFile(envFile, environment);
                System.out.println("✅ Loaded environment variables from .env file");
            } catch (IOException e) {
                System.err.println("⚠️ Failed to load .env file: " + e.getMessage());
            }
        } else {
            System.out.println("ℹ️ No .env file found - using system environment variables");
        }
    }

    private void loadEnvFile(File envFile, ConfigurableEnvironment environment) throws IOException {
        Properties properties = new Properties();
        try (FileInputStream inputStream = new FileInputStream(envFile)) {
            properties.load(inputStream);
        }

        Map<String, Object> envMap = new HashMap<>();
        for (String key : properties.stringPropertyNames()) {
            String value = properties.getProperty(key);
            // Skip empty values and comments
            if (value != null && !value.trim().isEmpty() && !key.startsWith("#")) {
                envMap.put(key, value.trim());
                // Also set as system property for Spring Boot ${} placeholders
                System.setProperty(key, value.trim());
            }
        }

        if (!envMap.isEmpty()) {
            environment.getPropertySources().addLast(new MapPropertySource("dotenv", envMap));
        }
    }
}
