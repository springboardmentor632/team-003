package com.decisionhub.dto;

import java.util.Map;

public class CustomCriterionRequest {

    private String name;
    private Map<Long, Integer> scores; // optionId -> score (1-10)

    public CustomCriterionRequest() {
    }

    public CustomCriterionRequest(String name) {
        this.name = name;
    }

    public CustomCriterionRequest(String name, Map<Long, Integer> scores) {
        this.name = name;
        this.scores = scores;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Map<Long, Integer> getScores() {
        return scores;
    }

    public void setScores(Map<Long, Integer> scores) {
        this.scores = scores;
    }
}
