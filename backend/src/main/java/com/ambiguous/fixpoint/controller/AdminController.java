package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private CommentRepository commentRepository;
    
    /**
     * Delete all comments from the database
     * WARNING: This will permanently delete all comments!
     */
    @DeleteMapping("/comments/all")
    public ResponseEntity<?> deleteAllComments() {
        try {
            long count = commentRepository.count();
            commentRepository.deleteAll();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "All comments deleted successfully",
                "deletedCount", count
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to delete comments",
                "message", e.getMessage()
            ));
        }
    }
}
