package com.example.somatekbackend.controllers;

import com.example.somatekbackend.dto.CourseResponseDto;
import com.example.somatekbackend.dto.CreateCourseRequestDto;
import com.example.somatekbackend.dto.ERole;
import com.example.somatekbackend.dto.ResponseObjectDto;
import com.example.somatekbackend.models.User;
import com.example.somatekbackend.service.ICourseService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseControllerTest {

    @Mock
    private ICourseService courseService;

    @InjectMocks
    private CourseController courseController;

    @Test
    void createCourse_returnsOk() {
        CreateCourseRequestDto request = new CreateCourseRequestDto();
        request.setName("Physics");
        request.setCode("PHY101");
        request.setCohort("2024");

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setRole(ERole.TEACHER);

        CourseResponseDto dto = new CourseResponseDto(
                UUID.randomUUID(), "Physics", "PHY101", "2024",
                "John Doe", 0, LocalDateTime.now());

        when(courseService.createCourse(any(), any())).thenReturn(dto);

        ResponseEntity<ResponseObjectDto> response = courseController.createCourse(request, user);

        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().getStatus());
    }

    @Test
    void getAllCourses_returnsListOfCourses() {
        CourseResponseDto dto = new CourseResponseDto(
                UUID.randomUUID(), "Math", "MATH101", "2024",
                "Jane Smith", 3, LocalDateTime.now());

        when(courseService.getAllCourses()).thenReturn(List.of(dto));

        ResponseEntity<ResponseObjectDto> response = courseController.getAllCourses();

        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().getStatus());
    }

    @Test
    void deleteCourse_returnsOk() {
        UUID id = UUID.randomUUID();
        doNothing().when(courseService).deleteCourse(id);

        ResponseEntity<ResponseObjectDto> response = courseController.deleteCourse(id);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Course deleted successfully", response.getBody().getMessage());
    }

    @Test
    void getCourseById_notFound_returnsBadRequest() {
        UUID id = UUID.randomUUID();
        when(courseService.getCourseById(id)).thenThrow(new RuntimeException("Course not found"));

        ResponseEntity<ResponseObjectDto> response = courseController.getCourseById(id);

        assertEquals(400, response.getStatusCode().value());
        assertFalse(response.getBody().getStatus());
    }
}
