package com.ambiguous.fixpoint.dto;

public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private UserSummary user;

    // Constructors
    public JwtAuthenticationResponse() {}

    public JwtAuthenticationResponse(String accessToken, UserSummary user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    // Getters and Setters
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public UserSummary getUser() { return user; }
    public void setUser(UserSummary user) { this.user = user; }
}
