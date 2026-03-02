package com.example.somatekbackend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chroma.vectorstore.ChromaApi;
import org.springframework.ai.chroma.vectorstore.ChromaVectorStore;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

/**
 * Manually configures ChromaDB VectorStore for the local profile.
 * <p>
 * Spring AI 1.0.0 defaults to tenant "SpringAiTenant" and database "SpringAiDatabase".
 * These must exist in ChromaDB before the VectorStore bean can initialize.
 * This config pre-creates the tenant, database, and collection via REST API.
 */
@Configuration
@Profile("local")
public class ChromaInitConfig {

    private static final Logger logger = LoggerFactory.getLogger(ChromaInitConfig.class);

    private static final String TENANT = "SpringAiTenant";
    private static final String DATABASE = "SpringAiDatabase";

    @Value("${spring.ai.vectorstore.chroma.url:http://localhost:8000}")
    private String chromaUrl;

    @Value("${spring.ai.vectorstore.chroma.collection-name:somatek_documents}")
    private String collectionName;

    @Bean
    public ChromaApi chromaApi() {
        return ChromaApi.builder()
                .baseUrl(chromaUrl)
                .restClientBuilder(RestClient.builder())
                .build();
    }

    @Bean
    public VectorStore vectorStore(ChromaApi chromaApi, EmbeddingModel embeddingModel) {
        waitForChroma();
        ensureTenant();
        ensureDatabase();
        ensureCollection();

        return ChromaVectorStore.builder(chromaApi, embeddingModel)
                .collectionName(collectionName)
                .initializeSchema(true)
                .build();
    }

    private void waitForChroma() {
        RestTemplate rest = new RestTemplate();
        for (int i = 0; i < 30; i++) {
            try {
                rest.getForObject(chromaUrl + "/api/v2/heartbeat", String.class);
                logger.info("ChromaDB is ready at {}", chromaUrl);
                return;
            } catch (Exception e) {
                // not ready yet
            }
            try { Thread.sleep(1000); } catch (InterruptedException ex) { Thread.currentThread().interrupt(); }
        }
        throw new RuntimeException("ChromaDB not reachable at " + chromaUrl + " after 30s");
    }

    private void ensureTenant() {
        try {
            post("/api/v2/tenants", "{\"name\": \"" + TENANT + "\"}");
            logger.info("Created ChromaDB tenant: {}", TENANT);
        } catch (Exception e) {
            // 409 = already exists, which is fine
            logger.debug("Tenant '{}' may already exist: {}", TENANT, e.getMessage());
        }
    }

    private void ensureDatabase() {
        try {
            post("/api/v2/tenants/" + TENANT + "/databases", "{\"name\": \"" + DATABASE + "\"}");
            logger.info("Created ChromaDB database: {}", DATABASE);
        } catch (Exception e) {
            logger.debug("Database '{}' may already exist: {}", DATABASE, e.getMessage());
        }
    }

    private void ensureCollection() {
        try {
            post("/api/v2/tenants/" + TENANT + "/databases/" + DATABASE + "/collections",
                    "{\"name\": \"" + collectionName + "\"}");
            logger.info("Created ChromaDB collection: {}", collectionName);
        } catch (Exception e) {
            logger.debug("Collection '{}' may already exist: {}", collectionName, e.getMessage());
        }
    }

    private void post(String path, String body) {
        RestTemplate rest = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        rest.postForObject(chromaUrl + path, new HttpEntity<>(body, headers), String.class);
    }
}
