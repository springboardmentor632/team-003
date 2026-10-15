package com.decisionhub.dto;

import java.util.Set;

public class UserProfileUpdateRequest {
    private String name;
    private String bio;
    private String avatarUrl;
    private Set<String> interests;

    public UserProfileUpdateRequest() {}

    public UserProfileUpdateRequest(String name, String bio, String avatarUrl, Set<String> interests) {
        this.name = name;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.interests = interests;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public Set<String> getInterests() { return interests; }
    public void setInterests(Set<String> interests) { this.interests = interests; }
}
