package com.example.somatekbackend.controllers;

import com.example.somatekbackend.dto.CreateCourseRequestDto;
import com.example.somatekbackend.dto.ResponseObjectDto;
import com.example.somatekbackend.models.User;
import com.example.somatekbackend.service.ICourseService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/courses")
@AllArgsConstructor
public class CourseController {

    private final ICourseService courseService;

    @PostMapping
    public ResponseEntity<ResponseObjectDto> createCourse(
            @RequestBody CreateCourseRequestDto request,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(new ResponseObjectDto(courseService.createCourse(request, user)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseObjectDto(e));
        }
    }

    @GetMapping
    public ResponseEntity<ResponseObjectDto> getAllCourses() {
        try {
            return ResponseEntity.ok(new ResponseObjectDto(courseService.getAllCourses()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ResponseObjectDto(e));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseObjectDto> getCourseById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(new ResponseObjectDto(courseService.getCourseById(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseObjectDto(e));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseObjectDto> deleteCourse(@PathVariable UUID id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok(new ResponseObjectDto(null, "Course deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseObjectDto(e));
        }
    }
}
