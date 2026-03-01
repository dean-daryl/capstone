package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.TranslateResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TranslationService {

    private static final Logger log = LoggerFactory.getLogger(TranslationService.class);

    @Value("${nllb.service.url}")
    private String nllbServiceUrl;

    private final RestTemplate restTemplate;

    public TranslationService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(60_000);
        this.restTemplate = new RestTemplate(factory);
    }

    public TranslateResponseDto translate(String text, String srcLang, String tgtLang) {
        return translate(text, srcLang, tgtLang, List.of());
    }

    public TranslateResponseDto translate(String text, String srcLang, String tgtLang, List<String> protectTerms) {

        Map<String, Object> request = new HashMap<>();
        request.put("text", text);
        request.put("src_lang", srcLang);
        request.put("tgt_lang", tgtLang);
        if (protectTerms != null && !protectTerms.isEmpty()) {
            request.put("protect_terms", protectTerms);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<TranslateResponseDto> response = restTemplate.postForEntity(
                    nllbServiceUrl + "/translate",
                    entity,
                    TranslateResponseDto.class
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to translate text via NLLB service", e);
            throw new RuntimeException("Translation service unavailable: " + e.getMessage());
        }
    }
}
