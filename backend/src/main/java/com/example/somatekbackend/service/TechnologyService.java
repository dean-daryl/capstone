package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.TextClassificationRequest;
import com.example.somatekbackend.dto.TextClassificationResponse;
import com.example.somatekbackend.models.Technology;
import com.example.somatekbackend.repository.ITechnologyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TechnologyService implements ITechnologyService {
    private static final Logger log = LoggerFactory.getLogger(TechnologyService.class);

    @Value("${textcat.service.url}")
    private String textcatServiceUrl;

    @Value("${textcat.service.threshold:0.5}")
    private Double textcatThreshold;

    @Autowired
    private ITechnologyRepository technologyRepository;

    @Override
    public List<Technology> createTechnology(String text) {
        List<TextClassificationResponse.CategoryScore> categories = this.classifyText(text);

        if (categories.isEmpty()) {
            return new ArrayList<>();
        }

        List<Technology> technologyList = new ArrayList<>();

        for (TextClassificationResponse.CategoryScore category : categories) {
            Technology technology = new Technology();
            technology.setTechnologyName(category.getLabel());
            technology.setConfidenceScore(category.getScore());
            technology.setCreatedAt(LocalDateTime.now());
            technology.setUpdatedAt(LocalDateTime.now());
            technologyRepository.save(technology);
            technologyList.add(technology);
        }

        return technologyList;
    }

    private List<TextClassificationResponse.CategoryScore> classifyText(String text) {
        RestTemplate restTemplate = new RestTemplate();

        TextClassificationRequest request = new TextClassificationRequest();
        request.setText(text);
        request.setThreshold(textcatThreshold);

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<TextClassificationRequest> entity = new HttpEntity<>(request, httpHeaders);

        try {
            ResponseEntity<TextClassificationResponse> response = restTemplate.postForEntity(
                    textcatServiceUrl + "/classify",
                    entity,
                    TextClassificationResponse.class
            );

            TextClassificationResponse body = response.getBody();
            if (body != null && body.getCategories() != null) {
                return body.getCategories();
            }
        } catch (Exception e) {
            log.error("Failed to classify text via textcat service", e);
        }

        return new ArrayList<>();
    }

    @Override
    public Map<String, Long> fetchTechnologyCountForPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        List<Technology> technologies = this.technologyRepository.findTechnologiesByCreatedAtBetween(startDate, endDate);
        Map<String, Long> technologyCountMap = new HashMap<>();

        for (Technology technology : technologies) {
            String techName = technology.getTechnologyName();
            technologyCountMap.put(techName, technologyCountMap.getOrDefault(techName, 0L) + 1);
        }

        return technologyCountMap;
    }

    @Override
    public List<Technology> fetchTechnologies() {
        return technologyRepository.findAll();
    }
}
