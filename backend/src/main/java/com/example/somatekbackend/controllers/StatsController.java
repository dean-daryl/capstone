package com.example.somatekbackend.controllers;

import com.example.somatekbackend.dto.DetailedStatsDto;
import com.example.somatekbackend.dto.ResponseObjectDto;
import com.example.somatekbackend.models.Stats;
import com.example.somatekbackend.service.IStatsService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/stats")
@AllArgsConstructor
public class StatsController {

    private final IStatsService statsService;

    @GetMapping("/overview")
    public ResponseEntity<ResponseObjectDto> getOverviewStats() {
        try {
            return ResponseEntity.ok(new ResponseObjectDto(statsService.getOverviewStats()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ResponseObjectDto(e));
        }
    }

    @GetMapping("/overview/customer/{customerId}")
    public ResponseEntity<ResponseObjectDto> getOverviewStatsByCustomer(@PathVariable UUID customerId) {
        try {
            return ResponseEntity.ok(new ResponseObjectDto(statsService.getOverviewStatsByCustomerId(customerId)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ResponseObjectDto(e));
        }
    }

    @PostMapping("/save")
    public ResponseEntity<ResponseObjectDto> saveStats(@RequestParam(required = false) UUID customerId) {
        try {
            Stats stats = statsService.saveStats(
                customerId != null 
                    ? statsService.getOverviewStatsByCustomerId(customerId) 
                    : statsService.getOverviewStats(),
                LocalDate.now(),
                customerId
            );
            return ResponseEntity.ok(new ResponseObjectDto(stats));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ResponseObjectDto(e));
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<ResponseObjectDto> getLatestStats(@RequestParam(required = false) LocalDate date) {
        try {
            LocalDate statsDate = date != null ? date : LocalDate.now();
            Optional<Stats> stats = statsService.getLatestStats(statsDate);
            return stats.map(s -> ResponseEntity.ok(new ResponseObjectDto(s)))
                    .orElseGet(() -> ResponseEntity.ok(new ResponseObjectDto("No stats found for the given date")));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ResponseObjectDto(e));
        }
    }

    @GetMapping("/range")
    public ResponseEntity<ResponseObjectDto> getStatsByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(required = false) UUID customerId) {
        try {
            List<Stats> stats = customerId != null
                    ? statsService.getStatsByCustomerIdAndDateRange(customerId, startDate, endDate)
                    : statsService.getStatsByDateRange(startDate, endDate);
            return ResponseEntity.ok(new ResponseObjectDto(stats));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ResponseObjectDto(e));
        }
    }

    @GetMapping("/detailed")
    public ResponseEntity<ResponseObjectDto> getDetailedStats(@RequestParam(required = false) UUID customerId) {
        try {
            DetailedStatsDto stats = customerId != null
                    ? statsService.getDetailedStatsByCustomerId(customerId)
                    : statsService.getDetailedStats();
            return ResponseEntity.ok(new ResponseObjectDto(stats));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ResponseObjectDto(e));
        }
    }
}
