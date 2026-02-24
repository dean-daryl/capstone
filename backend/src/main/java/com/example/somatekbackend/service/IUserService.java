package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.UserDto;
import com.example.somatekbackend.models.User;

public interface IUserService {

    User createUser(UserDto userDto);
}
