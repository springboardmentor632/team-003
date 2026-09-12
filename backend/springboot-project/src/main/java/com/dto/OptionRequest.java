package com.decisionhub.dto;

public class OptionRequest {

    private String name;
    private String title;
    private String description;
    private String pros;
    private String cons;
    private Integer costScore;
    private Integer benefitsScore;
    private Integer riskScore;
    private Integer timeScore;
    private Integer convenienceScore;

    public OptionRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    public String getTitle() { return title == null || title.isBlank() ? name : title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPros() {
        return pros;
    }

    public void setPros(String pros) {
        this.pros = pros;
    }

    public String getCons() {
        return cons;
    }

    public void setCons(String cons) {
        this.cons = cons;
    }
    public Integer getCostScore() { return costScore; }
    public void setCostScore(Integer costScore) { this.costScore = costScore; }
    public Integer getBenefitsScore() { return benefitsScore; }
    public void setBenefitsScore(Integer benefitsScore) { this.benefitsScore = benefitsScore; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
    public Integer getTimeScore() { return timeScore; }
    public void setTimeScore(Integer timeScore) { this.timeScore = timeScore; }
    public Integer getConvenienceScore() { return convenienceScore; }
    public void setConvenienceScore(Integer convenienceScore) { this.convenienceScore = convenienceScore; }
}
