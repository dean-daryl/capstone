package com.example.somatekbackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LlamaRequestDto {
    private List<MessageStructure> messages;
    private String model;
}
