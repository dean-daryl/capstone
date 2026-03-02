package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.DetailedStatsDto;
import com.example.somatekbackend.dto.OverviewStatsDto;
import com.example.somatekbackend.models.Stats;
import com.example.somatekbackend.models.Topic;
import com.example.somatekbackend.models.UserQuery;
import com.example.somatekbackend.service.storage.DocumentMetadataStore;
import com.example.somatekbackend.repository.IStatsRepository;
import com.example.somatekbackend.repository.ITopicRepository;
import com.example.somatekbackend.repository.IUserQueryRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class StatsService implements IStatsService {

    private final DocumentMetadataStore documentMetadataStore;
    private final IUserQueryRepository userQueryRepository;
    private final ITopicRepository topicRepository;
    private final IStatsRepository statsRepository;

    @Override
    public OverviewStatsDto getOverviewStats() {
        long totalDocuments = documentMetadataStore.count();
        long totalQueries = userQueryRepository.count();
        double averageSatisfaction = userQueryRepository.findAverageSatisfaction();
        long totalTopics = topicRepository.count();

        return new OverviewStatsDto(totalDocuments, totalQueries, averageSatisfaction, totalTopics);
    }

    @Override
    public OverviewStatsDto getOverviewStatsByCustomerId(UUID customerId) {
        long totalDocuments = documentMetadataStore.count();
        long totalQueries = userQueryRepository.findByCustomerId(customerId).size();
        double averageSatisfaction = userQueryRepository.findAverageSatisfaction();
        long totalTopics = topicRepository.findByCustomerId(customerId).size();

        return new OverviewStatsDto(totalDocuments, totalQueries, averageSatisfaction, totalTopics);
    }

    @Override
    public DetailedStatsDto getDetailedStats() {
        List<UserQuery> allQueries = userQueryRepository.findAll();
        List<Topic> allTopics = topicRepository.findAll();

        return buildDetailedStats(allQueries, allTopics);
    }

    @Override
    public DetailedStatsDto getDetailedStatsByCustomerId(UUID customerId) {
        List<UserQuery> customerQueries = userQueryRepository.findByCustomerId(customerId);
        List<Topic> customerTopics = topicRepository.findByCustomerId(customerId);

        return buildDetailedStats(customerQueries, customerTopics);
    }

    private DetailedStatsDto buildDetailedStats(List<UserQuery> queries, List<Topic> topics) {
        long totalDocuments = documentMetadataStore.count();
        long totalQueries = queries.size();
        long totalTopics = topics.size();
        double averageSatisfaction = queries.stream()
                .filter(q -> q.getSatisfaction() != null)
                .mapToInt(UserQuery::getSatisfaction)
                .average()
                .orElse(0.0);

        long queriesFromPlugin = queries.stream()
                .filter(q -> "plugin".equalsIgnoreCase(q.getSource()))
                .count();

        long queriesFromApp = queries.stream()
                .filter(q -> "app".equalsIgnoreCase(q.getSource()) || "web".equalsIgnoreCase(q.getSource()))
                .count();

        long queriesFromOther = queries.stream()
                .filter(q -> q.getSource() == null || 
                        (!"plugin".equalsIgnoreCase(q.getSource()) && 
                         !"app".equalsIgnoreCase(q.getSource()) && 
                         !"web".equalsIgnoreCase(q.getSource())))
                .count();

        Map<String, Long> topicCounts = topics.stream()
                .collect(Collectors.groupingBy(Topic::getName, Collectors.counting()));

        List<DetailedStatsDto.TopicCountDto> topTopics = topicCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> new DetailedStatsDto.TopicCountDto(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        Map<String, Long> queriesByType = queries.stream()
                .collect(Collectors.groupingBy(UserQuery::getType, Collectors.counting()));

        return new DetailedStatsDto(
                totalDocuments,
                totalQueries,
                totalTopics,
                averageSatisfaction,
                queriesFromPlugin,
                queriesFromApp,
                queriesFromOther,
                topTopics,
                queriesByType
        );
    }

    @Override
    public Stats saveStats(OverviewStatsDto statsDto, LocalDate statsDate, UUID customerId) {
        Stats stats = new Stats();
        stats.setTotalDocuments(statsDto.getTotalDocuments());
        stats.setTotalQueries(statsDto.getTotalQueries());
        stats.setAverageSatisfaction(statsDto.getAverageSatisfaction());
        stats.setTotalTopics(statsDto.getTotalTopics());
        stats.setStatsDate(statsDate);
        stats.setCustomerId(customerId);
        return statsRepository.save(stats);
    }

    @Override
    public Optional<Stats> getLatestStats(LocalDate statsDate) {
        return statsRepository.findTopByStatsDateOrderByUpdatedAtDesc(statsDate);
    }

    @Override
    public Optional<Stats> getLatestStatsByCustomerId(UUID customerId, LocalDate statsDate) {
        return statsRepository.findTopByCustomerIdAndStatsDateOrderByUpdatedAtDesc(customerId, statsDate);
    }

    @Override
    public List<Stats> getStatsByDateRange(LocalDate startDate, LocalDate endDate) {
        return statsRepository.findByStatsDateBetween(startDate, endDate);
    }

    @Override
    public List<Stats> getStatsByCustomerIdAndDateRange(UUID customerId, LocalDate startDate, LocalDate endDate) {
        return statsRepository.findByCustomerIdAndStatsDateBetween(customerId, startDate, endDate);
    }

    @Override
    public Stats calculateAndSaveStats(UUID customerId) {
        OverviewStatsDto statsDto = customerId != null 
            ? getOverviewStatsByCustomerId(customerId) 
            : getOverviewStats();
        
        LocalDate today = LocalDate.now();
        return saveStats(statsDto, today, customerId);
    }
}
