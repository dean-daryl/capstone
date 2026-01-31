package com.example.somatekbackend.service;

import com.example.somatekbackend.models.Technology;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface ITechnologyService {
    List<Technology> createTechnology(String text);
    Map<String, Long> fetchTechnologyCountForPeriod(LocalDateTime startDate, LocalDateTime endDate);
    List<Technology> fetchTechnologies();
}
