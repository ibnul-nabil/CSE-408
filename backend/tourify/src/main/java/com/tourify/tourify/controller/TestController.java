package com.tourify.tourify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;

@RestController
public class TestController {
    
    @Autowired
    private DataSource dataSource;
    
    @GetMapping("/test-db")
    public String testDatabase() {
        try {
            Connection connection = dataSource.getConnection();
            String dbName = connection.getCatalog();
            connection.close();
            return "✅ Connected to database: " + dbName;
        } catch (Exception e) {
            return "❌ Database connection failed: " + e.getMessage();
        }
    }
}