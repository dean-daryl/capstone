package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.CourseResponseDto;
import com.example.somatekbackend.dto.CreateCourseRequestDto;
import com.example.somatekbackend.models.Course;
import com.example.somatekbackend.models.User;
import com.example.somatekbackend.repository.ICourseRepository;
import com.example.somatekbackend.service.storage.DocumentMetadataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseService implements ICourseService {

    private final ICourseRepository courseRepository;
    private final IDocumentService documentService;
    private final DocumentMetadataStore documentMetadataStore;

    @Override
    public CourseResponseDto createCourse(CreateCourseRequestDto request, User user) {
        Course course = new Course();
        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setCohort(request.getCohort());
        course.setFacilitator(user);
        course.setCustomerId(user.getCustomerId());
        Course saved = courseRepository.save(course);
        return toDto(saved);
    }

    @Override
    public List<CourseResponseDto> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CourseResponseDto getCourseById(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found: " + id));
        return toDto(course);
    }

    @Override
    public void deleteCourse(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found: " + id));
        documentService.deleteDocumentsByCourseId(id.toString());
        courseRepository.delete(course);
    }

    private CourseResponseDto toDto(Course course) {
        String facilitatorName = "";
        if (course.getFacilitator() != null) {
            facilitatorName = course.getFacilitator().getFirstName() + " " + course.getFacilitator().getLastName();
        }
        long docCount = documentMetadataStore.findByCourseId(course.getId().toString()).size();
        return new CourseResponseDto(
                course.getId(),
                course.getName(),
                course.getCode(),
                course.getCohort(),
                facilitatorName,
                docCount,
                course.getCreatedAt()
        );
    }
}
