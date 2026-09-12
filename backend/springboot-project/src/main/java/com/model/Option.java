package com.decisionhub.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "options")
public class Option {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private String pros;

    private String cons;

    private Integer costScore;
    private Integer benefitsScore;
    private Integer riskScore;
    private Integer timeScore;
    private Integer convenienceScore;

    @Transient
    private long voteCount;

    @Transient
    private Integer rank;

    @Transient
    private Double averageRating;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "decision_id", nullable = false)
    private Decision decision;

    public Option() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTitle() { return name; }
    public void setTitle(String title) { this.name = title; }

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
    public long getVoteCount() { return voteCount; }
    public void setVoteCount(long voteCount) { this.voteCount = voteCount; }
    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Double getAverageScore() {
        int count = 0, total = 0;
        for (Integer score : new Integer[] { costScore, benefitsScore, riskScore, timeScore, convenienceScore }) {
            if (score != null) { total += score; count++; }
        }
        return count == 0 ? null : (double) total / count;
    }

    public Decision getDecision() {
        return decision;
    }

    public void setDecision(Decision decision) {
        this.decision = decision;
    }
}
