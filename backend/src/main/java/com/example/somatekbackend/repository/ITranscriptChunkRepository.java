package com.example.somatekbackend.repository;

import com.example.somatekbackend.models.TranscriptChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ITranscriptChunkRepository extends JpaRepository<TranscriptChunk, UUID> {
    List<TranscriptChunk> findBySession_Id(UUID sessionId);
    List<TranscriptChunk> findBySpeaker(String speaker);
}
