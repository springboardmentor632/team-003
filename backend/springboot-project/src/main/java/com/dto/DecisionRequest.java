package com.decisionhub.dto;

import java.util.ArrayList;
import java.util.List;

public class DecisionRequest {

    private String title;
    private String description;
    private String createdBy;
    private String category;
    private String visibility;
    private String pollType;
    private boolean allowAnonymousVoting;
    private Boolean closed;
    private Long communityId;
    private List<OptionRequest> options = new ArrayList<>();

    public DecisionRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
    public String getPollType() { return pollType; }
    public void setPollType(String pollType) { this.pollType = pollType; }
    public boolean isAllowAnonymousVoting() { return allowAnonymousVoting; }
    public void setAllowAnonymousVoting(boolean allowAnonymousVoting) { this.allowAnonymousVoting = allowAnonymousVoting; }
    public Boolean getClosed() { return closed; }
    public void setClosed(Boolean closed) { this.closed = closed; }
    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }
    public List<OptionRequest> getOptions() { return options; }
    public void setOptions(List<OptionRequest> options) { this.options = options == null ? new ArrayList<>() : options; }
}
