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
@Table(name = "queries")
@Getter
@Setter
public class UserQuery extends BaseEntity {

    @Column(columnDefinition = "TEXT")
    private String text;

    private String type;

    @Column(columnDefinition = "TEXT")
    private String response;

    private String sourcesUsed;
    private Integer satisfaction;

    @OneToMany(mappedBy = "query", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<QueryTopic> queryTopics = new ArrayList<>();

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "source")
    private String source;
}
