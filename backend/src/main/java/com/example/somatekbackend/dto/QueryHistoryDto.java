package com.example.somatekbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class QueryHistoryDto {
    private UUID id;
    private String text;
    private String response;
    private String source;
    private LocalDateTime createdAt;
}
