package com.tourify.tourify.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = {"http://localhost:3000", "http://20.40.57.81", "http://20.40.57.81:80"}, allowCredentials = "true")

public class FileUploadController {

    private static final String UPLOAD_DIR = "images/";
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    @PostMapping("/media")

    public ResponseEntity<?> uploadMedia(@RequestParam("file") MultipartFile file,
                                       @RequestParam("userId") Long userId) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(Map.of("message", "File size exceeds 50MB limit"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only image and video files are allowed"));
            }

            // Create upload directory if it doesn't exist
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + "_" + userId + fileExtension;

            // Save file
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFilename);
            Files.write(filePath, file.getBytes());

            // Return file URL
            String fileUrl = "/images/" + uniqueFilename;
            
            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "filename", uniqueFilename,
                "originalName", originalFilename,
                "size", file.getSize(),
                "contentType", contentType
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Failed to save file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "An error occurred while uploading file"));
        }
    }
} 