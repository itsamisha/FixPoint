package com.ambiguous.fixpoint.dto;

public class AIDescriptionResponse {
    private String description;
    private boolean success;
    private String error;

    public AIDescriptionResponse() {}

    public AIDescriptionResponse(String description) {
        this.description = description;
        this.success = true;
    }

    public AIDescriptionResponse(String description, boolean success, String error) {
        this.description = description;
        this.success = success;
        this.error = error;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
