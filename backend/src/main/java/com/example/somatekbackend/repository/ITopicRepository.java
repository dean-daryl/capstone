package com.example.somatekbackend.repository;

import com.example.somatekbackend.models.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ITopicRepository extends JpaRepository<Topic, UUID> {
    List<Topic> findByCustomerId(UUID customerId);
    List<Topic> findByName(String name);
}
