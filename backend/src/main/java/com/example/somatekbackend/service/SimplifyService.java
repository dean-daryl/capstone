package com.example.somatekbackend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

@Service
public class SimplifyService {

    private static final Logger log = LoggerFactory.getLogger(SimplifyService.class);

    private final ChatClient simplifyClient;

    private static final String SIMPLIFY_PROMPT = """
            Simplify the following text to basic English (A2 level).
            Use short sentences and simple words.
            Keep the same meaning but make it easy to understand for someone learning English.
            Do not add any extra information or commentary.
            Only return the simplified text.

            Text to simplify:
            %s""";

    public SimplifyService(ChatModel chatModel) {
        this.simplifyClient = ChatClient.builder(chatModel).build();
    }

    public String simplify(String text) {
        try {
            String response = simplifyClient.prompt()
                    .user(String.format(SIMPLIFY_PROMPT, text))
                    .call()
                    .content();
            return response;
        } catch (Exception e) {
            log.error("Failed to simplify text", e);
            throw new RuntimeException("Simplification failed: " + e.getMessage());
        }
    }
}
