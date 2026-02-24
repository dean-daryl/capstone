package com.example.somatekbackend.repository;

import com.example.somatekbackend.models.ResourceChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IResourceChunkRepository extends JpaRepository<ResourceChunk, UUID> {
    List<ResourceChunk> findByResource_Id(UUID resourceId);
}
