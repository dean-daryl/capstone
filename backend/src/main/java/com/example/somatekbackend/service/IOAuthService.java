package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.LoginRequest;
import com.example.somatekbackend.dto.LoginResponse;
import com.example.somatekbackend.dto.UserDto;
import com.example.somatekbackend.models.User;

import java.util.Map;

public interface IOAuthService {
    String getOauthAccessTokenGoogle(String code);

    Map<String, String> getProfileDetailsGoogle(String accessToken);

    String extractAccessToken(String accessToken);

    LoginResponse login(LoginRequest loginRequest);

    User signup(UserDto userDto);

}

