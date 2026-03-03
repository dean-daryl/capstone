package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.CourseResponseDto;
import com.example.somatekbackend.dto.CreateCourseRequestDto;
import com.example.somatekbackend.models.User;

import java.util.List;
import java.util.UUID;

public interface ICourseService {
    CourseResponseDto createCourse(CreateCourseRequestDto request, User user);

    List<CourseResponseDto> getAllCourses();

    CourseResponseDto getCourseById(UUID id);

    void deleteCourse(UUID id);
}
