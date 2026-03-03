package com.example.somatekbackend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateCourseRequestDto {
    private String name;
    private String code;
    private String cohort;
}
