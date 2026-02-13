package com.example.somatekbackend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity(name = "technology")
@Getter
@Setter
public class Technology extends BaseEntity {
    private String technologyName;

    @Column(nullable = true)
    private Double confidenceScore;
}
