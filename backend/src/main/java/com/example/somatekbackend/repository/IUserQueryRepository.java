package com.example.somatekbackend.repository;

import com.example.somatekbackend.models.UserQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IUserQueryRepository extends JpaRepository<UserQuery, UUID> {
    List<UserQuery> findByCustomerId(UUID customerId);
    List<UserQuery> findByType(String type);

    @Query("SELECT COALESCE(AVG(q.satisfaction), 0) FROM UserQuery q WHERE q.satisfaction IS NOT NULL")
    double findAverageSatisfaction();
}
