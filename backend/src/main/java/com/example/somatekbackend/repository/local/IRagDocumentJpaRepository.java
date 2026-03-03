package com.example.somatekbackend.repository.local;

import com.example.somatekbackend.dto.EDocumentStatus;
import com.example.somatekbackend.models.local.RagDocumentJpa;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Profile("local")
public interface IRagDocumentJpaRepository extends JpaRepository<RagDocumentJpa, String> {
    List<RagDocumentJpa> findByStatus(EDocumentStatus status);

    List<RagDocumentJpa> findAllByOrderByCreatedAtDesc();

    List<RagDocumentJpa> findByCourseId(String courseId);
}
