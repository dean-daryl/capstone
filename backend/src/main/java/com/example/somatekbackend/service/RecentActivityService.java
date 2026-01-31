package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.ERequestType;
import com.example.somatekbackend.dto.LlamaRequestDto;
import com.example.somatekbackend.dto.LlamaResponse;
import com.example.somatekbackend.dto.MessageStructure;
import com.example.somatekbackend.dto.RecentActivityDto;
import com.example.somatekbackend.models.RecentActivity;
import com.example.somatekbackend.repository.IRecentActivityRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@AllArgsConstructor
@NoArgsConstructor
@Service
public class RecentActivityService implements IRecentActivityService{
    @Value("${llama.modelName}")
    private String llamaModelName;

    @Value("${llama.apiUrl}")
    private String llamaApiUrl;

    @Value("${llama.apiKey}")
    private String llamaApiKey;

    @Autowired
    private IRecentActivityRepository recentActivityRepository;
    @Override
    public RecentActivity createRecentActivity(RecentActivityDto recentActivityDto, String title) {
        RecentActivity recentActivity = new RecentActivity();

        recentActivity.setTitle(this.generateTitle(title));
        recentActivity.setConversation(recentActivityDto.getConversation());
        recentActivity.setUserId(recentActivityDto.getUserId());
        recentActivity.setConversationType(recentActivityDto.getConversationType());
        recentActivity.setCreatedAt(LocalDateTime.now());
        recentActivity.setUpdatedAt(LocalDateTime.now());

            return recentActivityRepository.save(recentActivity);
    }

    @Override
    public Page<RecentActivityDto> getRecentActivitiesByUserId(String userId, Pageable pageable) {
        return recentActivityRepository.findByUserId(userId, pageable);
    }

    @Override
    public Page<RecentActivityDto> getRecentActivitiesByUserIdByDateRange(String userId,LocalDateTime startDate, LocalDateTime endDate,  Pageable pageable) {
       return recentActivityRepository.findByUserIdAndDateRange(userId, startDate, endDate, pageable);
    }

    @Override
    public RecentActivity getRecentActivityById(String recentActivityId) {
        return recentActivityRepository.findById(recentActivityId).orElseThrow(()-> new RuntimeException("Unable to find recent activity"));
    }

    private String generateTitle(String text){
        RestTemplate restTemplate = new RestTemplate();
        LlamaRequestDto request = new LlamaRequestDto();
        request.setModel(llamaModelName);
        List<MessageStructure> messages = new ArrayList<>();
        messages.add(new MessageStructure("user",(text.concat(" ").concat("from this conversation please derive a small title and dont add Here is a small title derived from the conversation "))));
        request.setMessages(messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(llamaApiKey);

        HttpEntity<LlamaRequestDto> requestEntity = new HttpEntity<>(request, headers);


        ResponseEntity<LlamaResponse> response = restTemplate.exchange(llamaApiUrl, HttpMethod.POST, requestEntity, LlamaResponse.class);

        if (response.getBody() != null && !response.getBody().getChoices().isEmpty()) {
            return response.getBody().getChoices().get(0).getMessage().getContent();
        }
        return null;
    }
}
