package com.example.somatekbackend;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Full context load test — only runs when the full infrastructure
 * (PostgreSQL, MongoDB, Ollama, Qdrant, MinIO) is available.
 * Skipped in local/CI unit-test runs.
 */
@SpringBootTest
@EnabledIfEnvironmentVariable(named = "SPRING_INTEGRATION_TESTS", matches = "true")
class SomaTekBackEndApplicationTests {

    @Test
    void contextLoads() {
    }

}
