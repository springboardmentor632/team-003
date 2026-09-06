package com.decisionhub.service;

import com.decisionhub.dto.DecisionRequest;
import com.decisionhub.dto.OptionRequest;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DecisionService {

    private final DecisionRepository decisionRepository;
    private final OptionRepository optionRepository;

    public DecisionService(
            DecisionRepository decisionRepository,
            OptionRepository optionRepository) {

        this.decisionRepository = decisionRepository;
        this.optionRepository = optionRepository;
    }

    // CREATE DECISION
    public Decision createDecision(DecisionRequest request) {

        Decision decision = new Decision();

        decision.setTitle(request.getTitle());
        decision.setDescription(request.getDescription());
        decision.setCreatedBy(request.getCreatedBy());

        return decisionRepository.save(decision);
    }

    // GET ALL DECISIONS
    public List<Decision> getAllDecisions() {
        return decisionRepository.findAll();
    }

    // GET DECISION BY ID
    public Decision getDecisionById(Long id) {

        return decisionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Decision not found"));
    }

    // UPDATE DECISION
    public Decision updateDecision(
            Long id,
            DecisionRequest request) {

        Decision decision = getDecisionById(id);

        decision.setTitle(request.getTitle());
        decision.setDescription(request.getDescription());
        decision.setCreatedBy(request.getCreatedBy());

        return decisionRepository.save(decision);
    }

    // DELETE DECISION
    public void deleteDecision(Long id) {

        Decision decision = getDecisionById(id);

        decisionRepository.delete(decision);
    }

    // ADD OPTION
    public Option addOption(
            Long decisionId,
            OptionRequest request) {

        Decision decision = getDecisionById(decisionId);

        Option option = new Option();

        option.setName(request.getName());
        option.setDescription(request.getDescription());
        option.setPros(request.getPros());
        option.setCons(request.getCons());

        option.setDecision(decision);

        return optionRepository.save(option);
    }

    // GET OPTIONS
    public List<Option> getOptions(Long decisionId) {

        getDecisionById(decisionId);

        return optionRepository.findByDecisionId(decisionId);
    }
}