package com.ambiguous.fixpoint.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/admin/database")
public class DatabaseController {

    @Autowired
    private DataSource dataSource;

    @PostMapping("/backup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> backupDatabase() {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String backupFileName = "fixpoint_backup_" + timestamp + ".sql";
            String backupPath = "./backups/" + backupFileName;
            
            // Create backups directory if it doesn't exist
            File backupsDir = new File("./backups");
            if (!backupsDir.exists()) {
                backupsDir.mkdirs();
            }
            
            // Create backup using H2's SCRIPT command
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {
                stmt.execute("SCRIPT TO '" + backupPath + "'");
            }
            
            return ResponseEntity.ok().body(new BackupResponse("Backup created successfully", backupFileName));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Backup failed: " + e.getMessage());
        }
    }

    @PostMapping("/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restoreDatabase(@RequestParam String backupFileName) {
        try {
            String backupPath = "./backups/" + backupFileName;
            File backupFile = new File(backupPath);
            
            if (!backupFile.exists()) {
                return ResponseEntity.badRequest().body("Backup file not found");
            }
            
            // Restore using H2's RUNSCRIPT command
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {
                stmt.execute("RUNSCRIPT FROM '" + backupPath + "'");
            }
            
            return ResponseEntity.ok().body("Database restored successfully from " + backupFileName);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Restore failed: " + e.getMessage());
        }
    }

    @GetMapping("/backup/{fileName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadBackup(@PathVariable String fileName) {
        try {
            File backupFile = new File("./backups/" + fileName);
            if (!backupFile.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new FileSystemResource(backupFile);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/info")
    public ResponseEntity<?> getDatabaseInfo() {
        try {
            File dataDir = new File("./data");
            boolean dbExists = dataDir.exists() && dataDir.listFiles() != null && dataDir.listFiles().length > 0;
            
            File backupsDir = new File("./backups");
            String[] backupFiles = backupsDir.exists() ? backupsDir.list((dir, name) -> name.endsWith(".sql")) : new String[0];
            
            return ResponseEntity.ok().body(new DatabaseInfo(
                dbExists ? "File-based (persistent)" : "Not initialized",
                "./data/fixpoint",
                backupFiles != null ? backupFiles.length : 0,
                backupFiles
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to get database info: " + e.getMessage());
        }
    }

    private static class BackupResponse {
        public String message;
        public String fileName;
        
        public BackupResponse(String message, String fileName) {
            this.message = message;
            this.fileName = fileName;
        }
    }

    private static class DatabaseInfo {
        public String type;
        public String location;
        public int backupCount;
        public String[] backupFiles;
        
        public DatabaseInfo(String type, String location, int backupCount, String[] backupFiles) {
            this.type = type;
            this.location = location;
            this.backupCount = backupCount;
            this.backupFiles = backupFiles;
        }
    }
}
