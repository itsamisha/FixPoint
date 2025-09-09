package com.ambiguous.fixpoint.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "FixPoint API");
        response.put("status", "running");
        response.put("version", "1.0.0");
        response.put("message", "FixPoint Backend API is running successfully!");
        response.put("endpoints", new String[]{
            "/api/public/organizations",
            "/api/public/signin",
            "/api/public/signup",
            "/actuator/health"
        });
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "FixPoint API");
        return ResponseEntity.ok(response);
    }
}
