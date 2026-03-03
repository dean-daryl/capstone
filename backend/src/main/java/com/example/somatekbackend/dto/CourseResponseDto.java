package com.example.somatekbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponseDto {
    private UUID id;
    private String name;
    private String code;
    private String cohort;
    private String facilitatorName;
    private long documentCount;
    private LocalDateTime createdAt;
}
