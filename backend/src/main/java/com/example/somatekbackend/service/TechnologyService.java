package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.NamedEntityRecognitionRequest;
import com.example.somatekbackend.dto.NamedEntityRecognitionResponse;
import com.example.somatekbackend.models.Technology;
import com.example.somatekbackend.repository.ITechnologyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TechnologyService implements ITechnologyService {
    private static final Logger log = LoggerFactory.getLogger(TechnologyService.class);
    @Value("${edenAi.ner.apiUrl}")
    private String edenAiApiUrl;

    @Value("${edenAi.token}")
    private String edenAiToken;

    @Autowired
    private ITechnologyRepository technologyRepository;

    @Override
    public List<Technology> createTechnology(String text) {
        // Call the method to extract technologies from the response
        List<String> technologies = this.extractTechnologiesFromResponse(text);

        if (technologies.isEmpty()) {
            return new ArrayList<>();
        }

        // Use a Set to avoid duplicate entries
        Set<String> technologySet = new HashSet<>(technologies);
        List<Technology> technologyList = new ArrayList<>();

        for (String technologyName : technologySet) {
            Technology technology = new Technology();
            technology.setTechnologyName(technologyName);
            technology.setCreatedAt(LocalDateTime.now());
            technology.setUpdatedAt(LocalDateTime.now());
            technologyRepository.save(technology);
            technologyList.add(technology);
        }

        return technologyList;
    }

    /**
     * This method processes the NER response and extracts only technologies.
     */
    private List<String> extractTechnologiesFromResponse(String text) {
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("response_as_dict", true);
        requestPayload.put("attributes_as_list", false);
        requestPayload.put("show_base_64", true);
        requestPayload.put("show_original_response", false);
        requestPayload.put("entities", List.of("Technology"));
        requestPayload.put("text", text);
        requestPayload.put("providers", List.of("openai"));

        // Set headers for the API request
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        httpHeaders.setBearerAuth(edenAiToken);

        // Send the request
        HttpEntity<Object> entityReq = new HttpEntity<>(requestPayload, httpHeaders);
        ResponseEntity<Map> response = restTemplate.exchange(edenAiApiUrl, HttpMethod.POST, entityReq, Map.class);

        // Parse the response to extract technologies
        Map<String, Object> responseMap = response.getBody();
        if (responseMap != null && responseMap.containsKey("openai")) {
            Map<String, Object> openAiResponse = (Map<String, Object>) responseMap.get("openai");
            List<Map<String, Object>> items = (List<Map<String, Object>>) openAiResponse.get("items");
            List<String> technologies = new ArrayList<>();

            for (Map<String, Object> item : items) {
                String entity = (String) item.get("entity");
                String category = (String) item.get("category");
                if ("Technology".equalsIgnoreCase(category)) {
                    technologies.add(entity);
                }
                else if ("Organization".equalsIgnoreCase(entity)) {
                    technologies.add(entity);
                }
                else if ("Company".equalsIgnoreCase(entity)) {
                    technologies.add(entity);
                }
                else if ("Tool".equalsIgnoreCase(entity)) {
                    technologies.add(entity);
                }
                else if ("Package".equalsIgnoreCase(entity)) {
                    technologies.add(entity);
                }
                else if("Software".equalsIgnoreCase(entity)) {
                    technologies.add(entity);
                }
                else if("Operating System".equalsIgnoreCase(entity)) {
                    technologies.add(entity);
                }
                else if("Computer Program".equalsIgnoreCase(entity)) {
                    technologies.add(entity);
                }
                else {
                    log.error("Failed to extract technologies from response", entity);
                }


            }
            return technologies;
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
