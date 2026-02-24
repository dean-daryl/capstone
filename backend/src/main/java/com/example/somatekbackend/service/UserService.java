package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.ERole;
import com.example.somatekbackend.dto.UserDto;
import com.example.somatekbackend.exception.ResourceExistsException;
import com.example.somatekbackend.models.User;
import com.example.somatekbackend.repository.IUserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService implements IUserService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User createUser(UserDto userDto) {
        if(userRepository.findUserByEmail(userDto.getEmail()).isPresent()) {
            throw new ResourceExistsException("User with email " + userDto.getEmail() + " already exists");
        }
        User newUser = new User();
        newUser.setEmail(userDto.getEmail());
        newUser.setFirstName(userDto.getFirstName());
        newUser.setLastName(userDto.getLastName());
        newUser.setRole(ERole.valueOf(userDto.getRole()));
        String encryptedPassword = passwordEncoder.encode(userDto.getPassword());
        newUser.setPassword(encryptedPassword);

        return userRepository.save(newUser);
    }
}
