package com.example.somatekbackend.controllers;

import com.example.somatekbackend.models.Topic;
import com.example.somatekbackend.repository.ITopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/sync")
@Profile("local")
@RequiredArgsConstructor
public class SyncController {

    private final ITopicRepository topicRepository;

    @GetMapping("/topics")
    public ResponseEntity<List<Topic>> exportTopics() {
        return ResponseEntity.ok(topicRepository.findAll());
    }
}
