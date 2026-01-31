package com.example.somatekbackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
public class RecentActivityDto {
    private String id;
    private String title;
    private String userId;
    private ERequestType conversationType;
    private Map<String, String> conversation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RecentActivityDto(String title, String userId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.title = title;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
