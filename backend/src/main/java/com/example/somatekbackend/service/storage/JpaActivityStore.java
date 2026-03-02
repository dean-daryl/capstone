package com.example.somatekbackend.service.storage;

import com.example.somatekbackend.dto.RecentActivityDto;
import com.example.somatekbackend.models.RecentActivity;
import com.example.somatekbackend.models.local.RecentActivityJpa;
import com.example.somatekbackend.repository.local.IRecentActivityJpaRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Component
@Profile("local")
@RequiredArgsConstructor
public class JpaActivityStore implements ActivityStore {

    private final IRecentActivityJpaRepository repository;
    private final ObjectMapper objectMapper;

    @Override
    public RecentActivity save(RecentActivity activity) {
        RecentActivityJpa jpa = toJpa(activity);
        RecentActivityJpa saved = repository.save(jpa);
        return toModel(saved);
    }

    @Override
    public Optional<RecentActivity> findById(String id) {
        return repository.findById(id).map(this::toModel);
    }

    @Override
    public Page<RecentActivityDto> findByUserId(String userId, Pageable pageable) {
        return repository.findByUserId(userId, pageable)
                .map(this::toDto);
    }

    @Override
    public Page<RecentActivityDto> findByUserIdAndDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return repository.findByUserIdAndUpdatedAtBetween(userId, startDate, endDate, pageable)
                .map(this::toDto);
    }

    private RecentActivityJpa toJpa(RecentActivity activity) {
        RecentActivityJpa jpa = new RecentActivityJpa();
        jpa.setId(activity.getId());
        jpa.setTitle(activity.getTitle());
        jpa.setConversationType(activity.getConversationType());
        jpa.setUserId(activity.getUserId());
        jpa.setCreatedAt(activity.getCreatedAt());
        jpa.setUpdatedAt(activity.getUpdatedAt());
        if (activity.getConversation() != null) {
            try {
                jpa.setConversationJson(objectMapper.writeValueAsString(activity.getConversation()));
            } catch (JsonProcessingException e) {
                jpa.setConversationJson("{}");
            }
        }
        return jpa;
    }

    private RecentActivity toModel(RecentActivityJpa jpa) {
        RecentActivity activity = new RecentActivity();
        activity.setId(jpa.getId());
        activity.setTitle(jpa.getTitle());
        activity.setConversationType(jpa.getConversationType());
        activity.setUserId(jpa.getUserId());
        activity.setCreatedAt(jpa.getCreatedAt());
        activity.setUpdatedAt(jpa.getUpdatedAt());
        if (jpa.getConversationJson() != null) {
            try {
                activity.setConversation(objectMapper.readValue(jpa.getConversationJson(), new TypeReference<Map<String, String>>() {}));
            } catch (JsonProcessingException e) {
                activity.setConversation(Collections.emptyMap());
            }
        }
        return activity;
    }

    private RecentActivityDto toDto(RecentActivityJpa jpa) {
        RecentActivityDto dto = new RecentActivityDto(jpa.getTitle(), jpa.getUserId(), jpa.getCreatedAt(), jpa.getUpdatedAt());
        dto.setId(jpa.getId());
        dto.setConversationType(jpa.getConversationType());
        return dto;
    }
}
