package com.example.somatekbackend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transcript_chunks")
@Getter
@Setter
public class TranscriptChunk extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    @JsonIgnore
    private CourseSession session;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String speaker;

    @Column(columnDefinition = "TEXT", name = "text_content")
    private String textContent;

    private String embeddingId;
    private String transcriptFormat;
    private String cohort;

    @Column(name = "customer_id")
    private UUID customerId;
}
