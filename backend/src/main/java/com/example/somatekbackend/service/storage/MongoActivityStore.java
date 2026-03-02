package com.example.somatekbackend.service.storage;

import com.example.somatekbackend.dto.RecentActivityDto;
import com.example.somatekbackend.models.RecentActivity;
import com.example.somatekbackend.repository.IRecentActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@Profile("!local")
@RequiredArgsConstructor
public class MongoActivityStore implements ActivityStore {

    private final IRecentActivityRepository repository;

    @Override
    public RecentActivity save(RecentActivity activity) {
        return repository.save(activity);
    }

    @Override
    public Optional<RecentActivity> findById(String id) {
        return repository.findById(id);
    }

    @Override
    public Page<RecentActivityDto> findByUserId(String userId, Pageable pageable) {
        return repository.findByUserId(userId, pageable);
    }

    @Override
    public Page<RecentActivityDto> findByUserIdAndDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return repository.findByUserIdAndDateRange(userId, startDate, endDate, pageable);
    }
}
