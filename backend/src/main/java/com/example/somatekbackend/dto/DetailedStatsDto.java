package com.example.somatekbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetailedStatsDto {
    
    private Long totalDocuments;
    private Long totalQueries;
    private Long totalTopics;
    private Double averageSatisfaction;
    
    private Long queriesFromPlugin;
    private Long queriesFromApp;
    private Long queriesFromOther;
    
    private List<TopicCountDto> topTopics;
    
    private Map<String, Long> queriesByType;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicCountDto {
        private String topicName;
        private Long count;
    }
}
