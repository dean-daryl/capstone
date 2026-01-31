package com.example.somatekbackend.controllers;

import com.example.somatekbackend.models.Technology;
import com.example.somatekbackend.service.TechnologyService;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("technology")
@AllArgsConstructor
public class TechnologyController {
    private final TechnologyService technologyService;
    @PostMapping
    public List<Technology> createTechnology(@RequestParam("text") String text) {
        return technologyService.createTechnology(text);
    }
    @GetMapping("")
    public List<Technology> getTechnologies() {
        return technologyService.fetchTechnologies();
    }
    @GetMapping("/stats/by-date-range")
    public Map<String, Long> getTechnologyCount(@RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
                                                @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return technologyService.fetchTechnologyCountForPeriod(startDate, endDate);
    }
}
