package com.example.somatekbackend.repository;

import com.example.somatekbackend.models.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IEnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByCourse_Id(UUID courseId);
    List<Enrollment> findByEnrollmentId(UUID enrollmentId);
}
