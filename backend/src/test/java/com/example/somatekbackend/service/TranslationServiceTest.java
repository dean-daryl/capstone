package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.TranslateResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TranslationServiceTest {

    @InjectMocks
    private TranslationService translationService;

    @Mock
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(translationService, "nllbServiceUrl", "http://localhost:8002");
        ReflectionTestUtils.setField(translationService, "restTemplate", restTemplate);
    }

    @Test
    void translate_success() {
        TranslateResponseDto expected = new TranslateResponseDto();
        expected.setTranslatedText("Muraho");
        expected.setSrcLang("eng_Latn");
        expected.setTgtLang("kin_Latn");

        when(restTemplate.postForEntity(
                eq("http://localhost:8002/translate"),
                any(HttpEntity.class),
                eq(TranslateResponseDto.class)
        )).thenReturn(ResponseEntity.ok(expected));

        TranslateResponseDto result = translationService.translate("Hello", "eng_Latn", "kin_Latn");

        assertNotNull(result);
        assertEquals("Muraho", result.getTranslatedText());
    }

    @Test
    void translate_withProtectTerms() {
        TranslateResponseDto expected = new TranslateResponseDto();
        expected.setTranslatedText("Translated text");
        expected.setProtectedTerms(List.of("API"));

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(TranslateResponseDto.class)))
                .thenReturn(ResponseEntity.ok(expected));

        TranslateResponseDto result = translationService.translate(
                "The API is important", "eng_Latn", "kin_Latn", List.of("API"));

        assertNotNull(result);
        assertEquals(1, result.getProtectedTerms().size());
    }

    @Test
    void translate_serviceUnavailable_throwsException() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(TranslateResponseDto.class)))
                .thenThrow(new RuntimeException("Connection refused"));

        assertThrows(RuntimeException.class,
                () -> translationService.translate("Hello", "eng_Latn", "kin_Latn"));
    }
}
