package com.decisionhub.service;

import com.decisionhub.dto.DecisionRequest;
import com.decisionhub.dto.DecisionResponse;
import com.decisionhub.dto.VoteRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DecisionService {
    DecisionResponse create(String email, DecisionRequest request);
    Page<DecisionResponse> publicDecisions(String category, Pageable pageable);
    Page<DecisionResponse> myDecisions(String email, Pageable pageable);
    DecisionResponse get(Long id, String email);
    DecisionResponse update(Long id, String email, DecisionRequest request);
    DecisionResponse addOption(Long id, String email, DecisionRequest.OptionRequest request);
    void delete(Long id, String email);
    DecisionResponse vote(Long id, String email, VoteRequest request);
    DecisionResponse retract(Long id, String email, Long optionId);
}
