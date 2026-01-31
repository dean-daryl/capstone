package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.ERole;
import com.example.somatekbackend.dto.LoginRequest;
import com.example.somatekbackend.dto.LoginResponse;
import com.example.somatekbackend.dto.UserDto;
import com.example.somatekbackend.models.User;
import com.example.somatekbackend.repository.IUserRepository;
import com.example.somatekbackend.util.TokenUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class OAuthService implements IOAuthService {

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private TokenUtil tokenUtil;

    @Value("${google.oauth.client-id}")
    private  String clientId;

    @Value("${google.oauth.client-secret}")
    private  String clientSecret;
    @Autowired
    private UserService userService;

    public String getOauthAccessTokenGoogle(String code) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("redirect_uri", "http://somatek.redjanvier.com/auth/grantcode");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("scope", "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile");
        params.add("scope", "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email");
        params.add("scope", "openid");
        params.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, httpHeaders);

        String url = "https://oauth2.googleapis.com/token";
        String response = restTemplate.postForObject(url, requestEntity, String.class);
        return response;
    }

        public Map<String, String> getProfileDetailsGoogle(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setBearerAuth(accessToken);

        HttpEntity<String> requestEntity = new HttpEntity<>(httpHeaders);

        String url = "https://www.googleapis.com/oauth2/v2/userinfo";
        ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Object.class);
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> responseMap = objectMapper.convertValue(response.getBody(), Map.class);
        String email = (String) responseMap.get("email");
        User user = userRepository.findUserByEmail(email).orElseThrow(()-> new RuntimeException("User with such an email doesnt exist"));

            String token;
            try {
                token = tokenUtil.generateToken(user);

            } catch (BadCredentialsException e) {
                throw new RuntimeException("Invalid username or password");
            } catch (Exception e) {
                throw new RuntimeException("Login failed: " + e.getMessage());
            }
         Map<String, String> map = new HashMap<>();
            map.put("token", token);
            map.put("firstname", user.getFirstName());
            map.put("userId", String.valueOf(user.getId()));
        return map;
    }

    @Override
    public LoginResponse login(LoginRequest loginRequest) {

        if (loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
            throw new IllegalArgumentException("Username or password cannot be null");
        }
        Optional<User> userOptional = userRepository.findUserByEmail(loginRequest.getUsername());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        User user = userOptional.get();
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(user.getEmail(), loginRequest.getPassword());
        try {
            Authentication authentication = authenticationManager.authenticate(authenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = tokenUtil.generateToken(userDetails);
            return new LoginResponse(token, "Bearer", user.getId(), user.getEmail(), user.getEmail(), user.getFirstName(), user.getLastName(), String.valueOf(user.getRole()));

        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid username or password");
        } catch (Exception e) {
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    @Override
    public User signup(UserDto userDto) {
        User user = (User) userService.createUser(userDto);
        if(ObjectUtils.isEmpty(user)) {
            throw new RuntimeException("User creation failed");
        }

        return user;
    }


    public String extractAccessToken(String jsonResponse) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonResponse);
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
