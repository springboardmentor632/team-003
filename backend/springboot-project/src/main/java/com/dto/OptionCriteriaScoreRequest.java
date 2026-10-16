package com.decisionhub.dto;

public class OptionCriteriaScoreRequest {

    private String criterion;
    private Integer score;

    public OptionCriteriaScoreRequest() {
    }

    public OptionCriteriaScoreRequest(String criterion, Integer score) {
        this.criterion = criterion;
        this.score = score;
    }

    public String getCriterion() {
        return criterion;
    }

    public void setCriterion(String criterion) {
        this.criterion = criterion;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }
}
