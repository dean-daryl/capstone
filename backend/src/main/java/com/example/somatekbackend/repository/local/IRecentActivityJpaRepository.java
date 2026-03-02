package com.example.somatekbackend.repository.local;

import com.example.somatekbackend.models.local.RecentActivityJpa;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
@Profile("local")
public interface IRecentActivityJpaRepository extends JpaRepository<RecentActivityJpa, String> {
    Page<RecentActivityJpa> findByUserId(String userId, Pageable pageable);

    Page<RecentActivityJpa> findByUserIdAndUpdatedAtBetween(String userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}
