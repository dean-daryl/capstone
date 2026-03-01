package com.example.somatekbackend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "stats")
@Getter
@Setter
public class Stats extends BaseEntity {

    @Column(name = "total_documents")
    private Long totalDocuments;

    @Column(name = "total_queries")
    private Long totalQueries;

    @Column(name = "average_satisfaction")
    private Double averageSatisfaction;

    @Column(name = "total_topics")
    private Long totalTopics;

    @Column(name = "stats_date")
    private LocalDate statsDate;

    @Column(name = "customer_id")
    private UUID customerId;
}
