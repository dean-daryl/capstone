package com.example.somatekbackend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "topics")
@Getter
@Setter
public class Topic extends BaseEntity {

    private String name;

    @Column(columnDefinition = "TEXT")
    private String response;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<QueryTopic> queryTopics = new ArrayList<>();

    @Column(name = "customer_id")
    private UUID customerId;
}
