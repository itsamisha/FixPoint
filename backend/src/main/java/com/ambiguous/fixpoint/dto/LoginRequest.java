package com.ambiguous.fixpoint.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank
    private String usernameOrEmail;

    @NotBlank
    private String password;

    // Constructors
    public LoginRequest() {}

    public LoginRequest(String usernameOrEmail, String password) {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
    }

    // Getters and Setters
    public String getUsernameOrEmail() { return usernameOrEmail; }
    public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
