package com.example.somatekbackend.repository;

import com.example.somatekbackend.models.ResourceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IResourceImageRepository extends JpaRepository<ResourceImage, UUID> {
    Optional<ResourceImage> findByResource_Id(UUID resourceId);
}
