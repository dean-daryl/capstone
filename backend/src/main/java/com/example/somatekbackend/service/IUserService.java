package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.UserDto;
import com.example.somatekbackend.models.User;
import org.springframework.stereotype.Service;

@Service
public interface IUserService {

    User createUser(UserDto userDto);
}
