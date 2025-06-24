package com.tourify.tourify.dto;

import com.tourify.tourify.entity.User;

public class AuthResponse {
    private ProfileResponse user;
    private String token;

    public AuthResponse(ProfileResponse user, String token) {
        this.user = user;
        this.token = token;
    }

    // Getters and setters
    public ProfileResponse getUser() { return user; }
    public void setUser(ProfileResponse user) { this.user = user; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}