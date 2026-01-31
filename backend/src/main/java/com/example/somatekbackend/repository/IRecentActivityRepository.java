package com.example.somatekbackend.repository;

import com.example.somatekbackend.dto.RecentActivityDto;
import com.example.somatekbackend.models.RecentActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface IRecentActivityRepository extends MongoRepository<RecentActivity, String> {
    @Query(value = "{ 'userId': ?0 }", fields = "{ '_id':1, 'title': 1, 'updatedAt': 1 , 'conversationType' : 1}")
    Page<RecentActivityDto> findByUserId(String userId, Pageable pageable);

    @Query(value = "{ 'userId': ?0, 'updatedAt': { $gte: ?1, $lt: ?2 } }",
            fields = "{'_id': 1, 'title': 1, 'updatedAt': 1, 'conversationType' : 1 }")
    Page<RecentActivityDto> findByUserIdAndDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

}