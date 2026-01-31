package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.RecentActivityDto;
import com.example.somatekbackend.models.RecentActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface IRecentActivityService {
    RecentActivity createRecentActivity(RecentActivityDto recentActivityDto, String title);

    Page<RecentActivityDto> getRecentActivitiesByUserId(String userId, Pageable pageable);

    Page<RecentActivityDto> getRecentActivitiesByUserIdByDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    RecentActivity getRecentActivityById(String recentActivityId);
}
