package com.example.somatekbackend.controllers;

import com.example.somatekbackend.dto.LoginResponse;
import com.example.somatekbackend.dto.ResponseObjectDto;
import com.example.somatekbackend.models.User;
import com.example.somatekbackend.repository.IUserRepository;
import com.example.somatekbackend.util.TokenUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("auth")
@Profile("local")
public class AutoLoginController {

    private final IUserRepository userRepository;
    private final TokenUtil tokenUtil;

    @Value("${somatek.seed.email:teacher@school.rw}")
    private String seedEmail;

    public AutoLoginController(IUserRepository userRepository, TokenUtil tokenUtil) {
        this.userRepository = userRepository;
        this.tokenUtil = tokenUtil;
    }

    @GetMapping("auto-login")
    public ResponseObjectDto autoLogin() {
        User user = userRepository.findUserByEmail(seedEmail)
                .orElseThrow(() -> new RuntimeException("Seed user not found"));

        String token = tokenUtil.generateToken(user, user.getRole().name());

        LoginResponse response = new LoginResponse(
                token, "Bearer", user.getId(), user.getEmail(), user.getEmail(),
                user.getFirstName(), user.getLastName(), String.valueOf(user.getRole())
        );

        return new ResponseObjectDto(response);
    }
}
