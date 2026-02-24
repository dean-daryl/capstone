package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.TextClassificationRequest;
import com.example.somatekbackend.dto.TextClassificationResponse;
import com.example.somatekbackend.models.Topic;
import com.example.somatekbackend.models.UserQuery;
import com.example.somatekbackend.repository.ITopicRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicService {

    private static final Logger log = LoggerFactory.getLogger(TopicService.class);

    @Value("${textcat.service.url}")
    private String textcatServiceUrl;

    @Value("${textcat.service.threshold:0.5}")
    private Double textcatThreshold;

    private final ITopicRepository topicRepository;

    @Async
    public void classifyAndCreateTopic(UserQuery query, String answer, UUID customerId) {
        try {
            List<TextClassificationResponse.CategoryScore> categories = classifyText(query.getText());

            if (categories.isEmpty()) {
                createDefaultTopic(query, answer, customerId);
                return;
            }

            for (TextClassificationResponse.CategoryScore category : categories) {
                Topic topic = new Topic();
                topic.setName(category.getLabel());
                topic.setResponse(answer);
                topic.setCustomerId(customerId);
                topicRepository.save(topic);
            }

            log.info("Created {} topic(s) for query {}", categories.size(), query.getId());
        } catch (Exception e) {
            log.error("Failed to classify query {}", query.getId(), e);
            createDefaultTopic(query, answer, customerId);
        }
    }

    private void createDefaultTopic(UserQuery query, String answer, UUID customerId) {
        Topic topic = new Topic();
        topic.setName("General Query");
        topic.setResponse(answer);
        topic.setCustomerId(customerId);
        topicRepository.save(topic);
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

        return List.of();
    }

    public List<Topic> getTopicsByCustomer(UUID customerId) {
        return topicRepository.findByCustomerId(customerId);
    }
}
