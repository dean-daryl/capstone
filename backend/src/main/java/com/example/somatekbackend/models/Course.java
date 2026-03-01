package com.example.somatekbackend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "courses")
@Getter
@Setter
public class Course extends BaseEntity {

    private String name;
    private String code;
    private String cohort;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facilitator_id")
    @JsonIgnore
    private User facilitator;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<CourseSession> sessions = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Enrollment> enrollments = new ArrayList<>();

    @Column(name = "customer_id")
    private UUID customerId;
}
