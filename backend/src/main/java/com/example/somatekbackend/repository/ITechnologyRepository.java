package com.example.somatekbackend.repository;

import com.example.somatekbackend.models.Technology;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Repository
public interface ITechnologyRepository extends JpaRepository<Technology, UUID> {
    List<Technology> findTechnologiesByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

}
