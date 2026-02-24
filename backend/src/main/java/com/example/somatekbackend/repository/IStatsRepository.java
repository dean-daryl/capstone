package com.example.somatekbackend.repository;

import com.example.somatekbackend.models.Stats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IStatsRepository extends JpaRepository<Stats, UUID> {
    Optional<Stats> findTopByStatsDateOrderByUpdatedAtDesc(LocalDate statsDate);
    
    List<Stats> findByStatsDateBetween(LocalDate startDate, LocalDate endDate);
    
    Optional<Stats> findTopByCustomerIdAndStatsDateOrderByUpdatedAtDesc(UUID customerId, LocalDate statsDate);
    
    List<Stats> findByCustomerIdAndStatsDateBetween(UUID customerId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COALESCE(AVG(s.averageSatisfaction), 0) FROM Stats s WHERE s.statsDate BETWEEN :startDate AND :endDate")
    double findAverageSatisfactionByDateRange(LocalDate startDate, LocalDate endDate);
}
