package com.example.somatekbackend.controllers;

import com.example.somatekbackend.dto.ResponseObjectDto;
import com.example.somatekbackend.dto.TranslateRequestDto;
import com.example.somatekbackend.service.TranslationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class TranslationController {

    private final TranslationService translationService;

    @PostMapping("/translate")
    public ResponseEntity<ResponseObjectDto> translate(@RequestBody TranslateRequestDto request) {
        try {
            return ResponseEntity.ok(new ResponseObjectDto(
                    translationService.translate(request.getText(), request.getSrcLang(), request.getTgtLang())
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ResponseObjectDto(e));
        }
    }
}
