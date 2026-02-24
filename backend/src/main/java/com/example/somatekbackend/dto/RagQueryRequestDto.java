package com.example.somatekbackend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class RagQueryRequestDto {
    private String question;
    private String type;
    private String source;
    private UUID customerId;
}
