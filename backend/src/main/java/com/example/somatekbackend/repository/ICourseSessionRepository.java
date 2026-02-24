package com.example.somatekbackend.repository;

import com.example.somatekbackend.models.CourseSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ICourseSessionRepository extends JpaRepository<CourseSession, UUID> {
    List<CourseSession> findByCourse_Id(UUID courseId);
    List<CourseSession> findByCustomerId(UUID customerId);
}
