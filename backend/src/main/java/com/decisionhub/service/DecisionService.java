package com.decisionhub.service;

import com.decisionhub.dto.CommentRequest;
import com.decisionhub.dto.CommentResponse;
import com.decisionhub.dto.CreateDecisionRequest;
import com.decisionhub.dto.DecisionResponse;
import com.decisionhub.dto.VoteRequest;

import java.util.List;

public interface DecisionService {
    DecisionResponse create(CreateDecisionRequest request, String email);
    List<DecisionResponse> list();
    DecisionResponse get(Long id);
    void vote(Long id, VoteRequest request, String email);
    List<CommentResponse> comments(Long id);
    CommentResponse addComment(Long id, CommentRequest request, String email);
}