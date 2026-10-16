package com.decisionhub.dto;

import java.time.LocalDateTime;

public class VotingHistoryResponse {
    private Long voteId;
    private Long decisionId;
    private String decisionTitle;
    private String decisionCategory;
    private String pollType;
    private Long optionId;
    private String optionTitle;
    private Integer rating;
    private boolean anonymous;
    private LocalDateTime votedAt;

    public VotingHistoryResponse() {}

    public VotingHistoryResponse(Long voteId, Long decisionId, String decisionTitle, String decisionCategory,
                                 String pollType, Long optionId, String optionTitle, Integer rating,
                                 boolean anonymous, LocalDateTime votedAt) {
        this.voteId = voteId;
        this.decisionId = decisionId;
        this.decisionTitle = decisionTitle;
        this.decisionCategory = decisionCategory;
        this.pollType = pollType;
        this.optionId = optionId;
        this.optionTitle = optionTitle;
        this.rating = rating;
        this.anonymous = anonymous;
        this.votedAt = votedAt;
    }

    public Long getVoteId() { return voteId; }
    public void setVoteId(Long voteId) { this.voteId = voteId; }

    public Long getDecisionId() { return decisionId; }
    public void setDecisionId(Long decisionId) { this.decisionId = decisionId; }

    public String getDecisionTitle() { return decisionTitle; }
    public void setDecisionTitle(String decisionTitle) { this.decisionTitle = decisionTitle; }

    public String getDecisionCategory() { return decisionCategory; }
    public void setDecisionCategory(String decisionCategory) { this.decisionCategory = decisionCategory; }

    public String getPollType() { return pollType; }
    public void setPollType(String pollType) { this.pollType = pollType; }

    public Long getOptionId() { return optionId; }
    public void setOptionId(Long optionId) { this.optionId = optionId; }

    public String getOptionTitle() { return optionTitle; }
    public void setOptionTitle(String optionTitle) { this.optionTitle = optionTitle; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }

    public LocalDateTime getVotedAt() { return votedAt; }
    public void setVotedAt(LocalDateTime votedAt) { this.votedAt = votedAt; }
}
