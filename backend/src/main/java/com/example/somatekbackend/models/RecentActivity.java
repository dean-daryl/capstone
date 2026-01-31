package com.example.somatekbackend.models;

import com.example.somatekbackend.dto.ERequestType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "recent-activity")
@Getter
@Setter
public class RecentActivity {
    @Id
    private String id;

    private String title;

    private Map<String, String> conversation;

    private ERequestType conversationType;

    private String userId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
