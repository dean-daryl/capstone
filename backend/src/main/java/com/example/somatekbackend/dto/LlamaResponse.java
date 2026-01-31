package com.example.somatekbackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LlamaResponse {
    private String id;
    private String object;
    private long created;
    private String model;
    private List<Choice> choices;
    private Usage usage;

    @Getter
    @Setter
    public static class Choice {
        private int index;
        private Message message;
        private String finish_reason;

        @Getter
        @Setter
        public static class Message {
            private String role;
            private String content;
        }
    }

    @Getter
    @Setter
    public static class Usage {
        private double queue_time;
        private int prompt_tokens;
        private double prompt_time;
        private int completion_tokens;
        private double completion_time;
        private int total_tokens;
        private double total_time;
    }
}
