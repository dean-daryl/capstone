package com.example.somatekbackend.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RagConfig {

    @Value("${rag.chunk.size:200}")
    private int chunkSize;

    @Value("${rag.chunk.overlap:30}")
    private int chunkOverlap;

    @Value("${rag.search.top-k:3}")
    private int topK;

    @Value("${rag.search.similarity-threshold:0.5}")
    private double similarityThreshold;

    private static final String SYSTEM_PROMPT = """
            You are a helpful assistant that answers questions based on the provided document context.
            Use the following retrieved document chunks to answer the user's question.
            Synthesize information from multiple chunks when needed.
            If the user asks about a person, project, or topic mentioned in the documents, \
            provide all relevant details you can find in the context.
            If the context truly contains no relevant information, say so clearly.
            Always be thorough - combine details from different sections of the documents.
            """;

    private static final String ADVISOR_PROMPT_TEMPLATE = """

            ---------------------
            DOCUMENT CONTEXT:
            {question_answer_context}
            ---------------------

            Based on the document context above, answer the following question thoroughly.
            If the context contains relevant information, use it to provide a complete answer.

            Question: {query}
            Answer:""";

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
