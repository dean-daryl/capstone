package com.example.somatekbackend.repository;

import com.example.somatekbackend.models.QueryTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IQueryTopicRepository extends JpaRepository<QueryTopic, UUID> {
    List<QueryTopic> findByQuery_Id(UUID queryId);
    List<QueryTopic> findByTopic_Id(UUID topicId);
}
