package com.decisionhub.dto;

import java.util.Set;

public class UserInterestsRequest {
    private Set<String> interests;

    public UserInterestsRequest() {}

    public UserInterestsRequest(Set<String> interests) {
        this.interests = interests;
    }

    public Set<String> getInterests() { return interests; }
    public void setInterests(Set<String> interests) { this.interests = interests; }
}
