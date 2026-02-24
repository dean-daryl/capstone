package com.example.somatekbackend.controllers;

import com.example.somatekbackend.dto.ResponseObjectDto;
import com.example.somatekbackend.service.IStatsService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
