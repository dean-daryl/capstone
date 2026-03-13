package com.example.somatekbackend.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * SimplifyService depends on Spring AI ChatClient which requires a running ChatModel.
 * These tests verify the service's error handling behavior.
 */
class SimplifyServiceTest {

    @Test
    void constructor_withNullChatModel_throwsException() {
        assertThrows(Exception.class, () -> new SimplifyService(null));
    }
}
