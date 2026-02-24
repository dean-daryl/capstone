package com.example.somatekbackend.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class RagConfig {

    @Value("${spring.ai.ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.read-timeout-minutes:10}")
    private int ollamaReadTimeoutMinutes;

    @Value("${rag.chunk.size:200}")
    private int chunkSize;

    @Value("${rag.chunk.overlap:30}")
    private int chunkOverlap;

    @Value("${rag.search.top-k:3}")
    private int topK;

    @Value("${rag.search.similarity-threshold:0.5}")
    private double similarityThreshold;

    private static final String SYSTEM_PROMPT = """
            You are a helpful assistant that explains technical documents in simple English.
            Always respond in English. Translate any non-English text to English.
            Explain concepts in your own words — never copy text verbatim.
            Only use information from the provided context. If no relevant context exists, say so.
            """;

    private static final String ADVISOR_PROMPT_TEMPLATE = """

            Context from documents:
            {question_answer_context}

            User question: {query}

            Explain the answer in simple, clear English:""";

    @Bean
    public OllamaApi ollamaApi() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(30));
        requestFactory.setReadTimeout(Duration.ofMinutes(ollamaReadTimeoutMinutes));

        RestClient.Builder restClientBuilder = RestClient.builder()
                .requestFactory(requestFactory);

        return OllamaApi.builder()
                .baseUrl(ollamaBaseUrl)
                .restClientBuilder(restClientBuilder)
                .build();
    }

    @Bean
    public TokenTextSplitter tokenTextSplitter() {
        return new TokenTextSplitter(chunkSize, chunkOverlap, 5, 10000, true);
    }

    @Bean
    public ChatClient ragChatClient(ChatModel chatModel, VectorStore vectorStore) {
        return ChatClient.builder(chatModel)
                .defaultSystem(SYSTEM_PROMPT)
                .defaultAdvisors(
                        QuestionAnswerAdvisor.builder(vectorStore)
                                .searchRequest(SearchRequest.builder()
                                        .topK(topK)
                                        .similarityThreshold(similarityThreshold)
                                        .build())
                                .promptTemplate(new PromptTemplate(ADVISOR_PROMPT_TEMPLATE))
                                .build())
                .build();
    }
}
