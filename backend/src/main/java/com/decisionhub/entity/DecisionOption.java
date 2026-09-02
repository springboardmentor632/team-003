package com.decisionhub.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "decision_options")
public class DecisionOption {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 200) private String title;
    @Column(length = 2000) private String description;
    private Integer costScore;
    private Integer benefitsScore;
    private Integer riskScore;
    private Integer timeScore;
    private Integer convenienceScore;
    @Column(length = 1000) private String pros;
    @Column(length = 1000) private String cons;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private Decision decision;

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getCostScore() { return costScore; }
    public void setCostScore(Integer value) { costScore = value; }
    public Integer getBenefitsScore() { return benefitsScore; }
    public void setBenefitsScore(Integer value) { benefitsScore = value; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer value) { riskScore = value; }
    public Integer getTimeScore() { return timeScore; }
    public void setTimeScore(Integer value) { timeScore = value; }
    public Integer getConvenienceScore() { return convenienceScore; }
    public void setConvenienceScore(Integer value) { convenienceScore = value; }
    public String getPros() { return pros; }
    public void setPros(String value) { pros = value; }
    public String getCons() { return cons; }
    public void setCons(String value) { cons = value; }
    public Decision getDecision() { return decision; }
    public void setDecision(Decision decision) { this.decision = decision; }
}
