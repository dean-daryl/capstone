package com.example.somatekbackend.controllers;

import com.example.somatekbackend.dto.ResponseObjectDto;
import com.example.somatekbackend.models.User;
import com.example.somatekbackend.repository.IUserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class UserController {

    private final IUserRepository userRepository;

    @GetMapping
    public ResponseEntity<ResponseObjectDto> getAllUsers() {
        try {
            List<Map<String, Object>> users = userRepository.findAll().stream()
                    .map(this::toDto)
                    .toList();
            return ResponseEntity.ok(new ResponseObjectDto(users));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ResponseObjectDto(e));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResponseObjectDto> toggleUserStatus(@PathVariable UUID id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found: " + id));
            user.setActive(!user.isActive());
            userRepository.save(user);
            return ResponseEntity.ok(new ResponseObjectDto(toDto(user), "User status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseObjectDto(e));
        }
    }

    private Map<String, Object> toDto(User user) {
        return Map.of(
                "id", user.getId(),
                "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                "lastName", user.getLastName() != null ? user.getLastName() : "",
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "active", user.isActive(),
                "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
        );
    }
}
