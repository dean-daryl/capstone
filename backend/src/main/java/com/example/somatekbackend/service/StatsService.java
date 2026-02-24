package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.OverviewStatsDto;
import com.example.somatekbackend.repository.IRagDocumentRepository;
import com.example.somatekbackend.repository.ITopicRepository;
import com.example.somatekbackend.repository.IUserQueryRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class StatsService implements IStatsService {

    private final IRagDocumentRepository ragDocumentRepository;
    private final IUserQueryRepository userQueryRepository;
    private final ITopicRepository topicRepository;

    @Override
    public OverviewStatsDto getOverviewStats() {
        long totalDocuments = ragDocumentRepository.count();
        long totalQueries = userQueryRepository.count();
        double averageSatisfaction = userQueryRepository.findAverageSatisfaction();
        long totalTopics = topicRepository.count();

        return new OverviewStatsDto(totalDocuments, totalQueries, averageSatisfaction, totalTopics);
    }
}
