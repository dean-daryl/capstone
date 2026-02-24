package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.DetailedStatsDto;
import com.example.somatekbackend.dto.OverviewStatsDto;
import com.example.somatekbackend.models.Stats;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IStatsService {
    OverviewStatsDto getOverviewStats();
    
    OverviewStatsDto getOverviewStatsByCustomerId(UUID customerId);
    
    DetailedStatsDto getDetailedStats();
    
    DetailedStatsDto getDetailedStatsByCustomerId(UUID customerId);
    
    Stats saveStats(OverviewStatsDto statsDto, LocalDate statsDate, UUID customerId);
    
    Optional<Stats> getLatestStats(LocalDate statsDate);
    
    Optional<Stats> getLatestStatsByCustomerId(UUID customerId, LocalDate statsDate);
    
    List<Stats> getStatsByDateRange(LocalDate startDate, LocalDate endDate);
    
    List<Stats> getStatsByCustomerIdAndDateRange(UUID customerId, LocalDate startDate, LocalDate endDate);
    
    Stats calculateAndSaveStats(UUID customerId);
}
