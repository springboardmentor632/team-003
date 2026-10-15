package com.dto;

public class FcmStatusResponse {

    private boolean enabled;
    private boolean configured;
    private String projectId;
    private long registeredTokens;
    private String message;

    public FcmStatusResponse() {}

    public FcmStatusResponse(boolean enabled, boolean configured, String projectId, long registeredTokens, String message) {
        this.enabled = enabled;
        this.configured = configured;
        this.projectId = projectId;
        this.registeredTokens = registeredTokens;
        this.message = message;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isConfigured() {
        return configured;
    }

    public void setConfigured(boolean configured) {
        this.configured = configured;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public long getRegisteredTokens() {
        return registeredTokens;
    }

    public void setRegisteredTokens(long registeredTokens) {
        this.registeredTokens = registeredTokens;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
