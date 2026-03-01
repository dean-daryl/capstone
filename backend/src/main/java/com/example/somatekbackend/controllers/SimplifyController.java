package com.example.somatekbackend.controllers;

import com.example.somatekbackend.dto.ResponseObjectDto;
import com.example.somatekbackend.dto.SimplifyRequestDto;
import com.example.somatekbackend.dto.SimplifyResponseDto;
import com.example.somatekbackend.service.SimplifyService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class SimplifyController {

    private final SimplifyService simplifyService;

    @PostMapping("/simplify")
    public ResponseEntity<ResponseObjectDto> simplify(@RequestBody SimplifyRequestDto request) {
        try {
            String simplified = simplifyService.simplify(request.getText());
            return ResponseEntity.ok(new ResponseObjectDto(new SimplifyResponseDto(simplified)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ResponseObjectDto(e));
        }
    }
}
