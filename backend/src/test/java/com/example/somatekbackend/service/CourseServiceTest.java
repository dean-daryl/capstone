package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.CourseResponseDto;
import com.example.somatekbackend.dto.CreateCourseRequestDto;
import com.example.somatekbackend.dto.ERole;
import com.example.somatekbackend.models.Course;
import com.example.somatekbackend.models.User;
import com.example.somatekbackend.repository.ICourseRepository;
import com.example.somatekbackend.service.storage.DocumentMetadataStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private ICourseRepository courseRepository;

    @Mock
    private IDocumentService documentService;

    @Mock
    private DocumentMetadataStore documentMetadataStore;

    @InjectMocks
    private CourseService courseService;

    private User teacher;
    private CreateCourseRequestDto createRequest;

    @BeforeEach
    void setUp() {
        teacher = new User();
        teacher.setId(UUID.randomUUID());
        teacher.setFirstName("Jane");
        teacher.setLastName("Smith");
        teacher.setEmail("jane@example.com");
        teacher.setRole(ERole.TEACHER);
        teacher.setCustomerId(UUID.randomUUID());

        createRequest = new CreateCourseRequestDto();
        createRequest.setName("Intro to CS");
        createRequest.setCode("CS101");
        createRequest.setCohort("2024");
    }

    @Test
    void createCourse_success() {
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> {
            Course course = invocation.getArgument(0);
            course.setId(UUID.randomUUID());
            return course;
        });
        when(documentMetadataStore.findByCourseId(anyString())).thenReturn(Collections.emptyList());

        CourseResponseDto result = courseService.createCourse(createRequest, teacher);

        assertNotNull(result);
        assertEquals("Intro to CS", result.getName());
        assertEquals("CS101", result.getCode());
        assertEquals("2024", result.getCohort());
        assertEquals("Jane Smith", result.getFacilitatorName());
        verify(courseRepository).save(any(Course.class));
    }

    @Test
    void getAllCourses_returnsListOfCourses() {
        Course course = new Course();
        course.setId(UUID.randomUUID());
        course.setName("Math");
        course.setCode("MATH101");
        course.setFacilitator(teacher);

        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(documentMetadataStore.findByCourseId(anyString())).thenReturn(Collections.emptyList());

        List<CourseResponseDto> results = courseService.getAllCourses();

        assertEquals(1, results.size());
        assertEquals("Math", results.get(0).getName());
    }

    @Test
    void getCourseById_notFound_throwsException() {
        UUID id = UUID.randomUUID();
        when(courseRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> courseService.getCourseById(id));
    }

    @Test
    void deleteCourse_deletesDocumentsAndCourse() {
        UUID id = UUID.randomUUID();
        Course course = new Course();
        course.setId(id);
        course.setName("To Delete");

        when(courseRepository.findById(id)).thenReturn(Optional.of(course));

        courseService.deleteCourse(id);

        verify(documentService).deleteDocumentsByCourseId(id.toString());
        verify(courseRepository).delete(course);
    }
}
