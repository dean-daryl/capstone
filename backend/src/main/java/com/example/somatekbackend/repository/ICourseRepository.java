package com.example.somatekbackend.repository;

import com.example.somatekbackend.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ICourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByCustomerId(UUID customerId);
    List<Course> findByCohort(String cohort);
}
