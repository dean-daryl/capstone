package com.example.somatekbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OverviewStatsDto {
    private long totalDocuments;
    private long totalQueries;
    private double averageSatisfaction;
    private long totalTopics;
}
