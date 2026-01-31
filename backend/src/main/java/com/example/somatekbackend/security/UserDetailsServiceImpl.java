package com.example.somatekbackend.security;

import com.example.somatekbackend.models.User;
import com.example.somatekbackend.repository.IUserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final IUserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findUserByEmail(username).orElseThrow(()-> new RuntimeException("User with email " + username + " not found"));
        return org.springframework.security.core.userdetails.User.builder().username(user.getEmail()).password(user.getPassword()).build();
    }
}
