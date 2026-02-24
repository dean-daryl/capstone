package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.RagQueryRequestDto;
import com.example.somatekbackend.dto.RagQueryResponseDto;
import com.example.somatekbackend.models.UserQuery;
import com.example.somatekbackend.repository.IUserQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserQueryService {

    private final IUserQueryRepository userQueryRepository;
    private final IDocumentService documentService;
    private final IStatsService statsService;
    private final TopicService topicService;

    public RagQueryResponseDto query(String question, String type, String source, UUID customerId) {
        UserQuery userQuery = new UserQuery();
        userQuery.setText(question);
        userQuery.setType(type != null ? type : "rag");
        userQuery.setSource(source != null ? source : "web");
        userQuery.setCustomerId(customerId);
        userQuery.setCreatedAt(LocalDateTime.now());
        userQuery.setUpdatedAt(LocalDateTime.now());

        UserQuery savedQuery = userQueryRepository.save(userQuery);

        try {
            RagQueryRequestDto request = new RagQueryRequestDto();
            request.setQuestion(question);
            RagQueryResponseDto response = documentService.queryDocuments(request);

            savedQuery.setResponse(response.getAnswer());
            savedQuery.setSourcesUsed(String.valueOf(response.getSources().size()));
            savedQuery.setUpdatedAt(LocalDateTime.now());
            userQueryRepository.save(savedQuery);

            topicService.classifyAndCreateTopic(savedQuery, response.getAnswer(), customerId);

            statsService.calculateAndSaveStats(customerId);

            return response;
        } catch (Exception e) {
            savedQuery.setResponse("Error: " + e.getMessage());
            savedQuery.setUpdatedAt(LocalDateTime.now());
            userQueryRepository.save(savedQuery);
            throw e;
        }
    }

    public List<UserQuery> getQueriesByCustomer(UUID customerId) {
        return userQueryRepository.findByCustomerId(customerId);
    }

    public List<UserQuery> getQueriesByType(String type) {
        return userQueryRepository.findByType(type);
    }

    public UserQuery updateSatisfaction(UUID queryId, Integer satisfaction) {
        UserQuery userQuery = userQueryRepository.findById(queryId)
                .orElseThrow(() -> new RuntimeException("Query not found: " + queryId));
        userQuery.setSatisfaction(satisfaction);
        userQuery.setUpdatedAt(LocalDateTime.now());
        
        UserQuery updated = userQueryRepository.save(userQuery);
        
        if (userQuery.getCustomerId() != null) {
            statsService.calculateAndSaveStats(userQuery.getCustomerId());
        }
        
        return updated;
    }
}
