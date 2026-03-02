package com.example.somatekbackend.service.storage;

import com.example.somatekbackend.dto.RecentActivityDto;
import com.example.somatekbackend.models.RecentActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ActivityStore {
    RecentActivity save(RecentActivity activity);

    Optional<RecentActivity> findById(String id);

    Page<RecentActivityDto> findByUserId(String userId, Pageable pageable);

    Page<RecentActivityDto> findByUserIdAndDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}