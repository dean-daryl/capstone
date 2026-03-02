package com.example.somatekbackend.config;

import com.example.somatekbackend.dto.ERole;
import com.example.somatekbackend.models.Topic;
import com.example.somatekbackend.models.User;
import com.example.somatekbackend.repository.ITopicRepository;
import com.example.somatekbackend.repository.IUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("local")
public class LocalDataSeeder implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(LocalDataSeeder.class);

    private static final List<String> DEFAULT_TOPICS = List.of(
            "Mathematics", "Science", "English", "Kinyarwanda", "Social Studies", "Creative Arts"
    );

    private final IUserRepository userRepository;
    private final ITopicRepository topicRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${somatek.seed.email:teacher@school.rw}")
    private String seedEmail;

    @Value("${somatek.seed.password:changeme}")
    private String seedPassword;

    public LocalDataSeeder(IUserRepository userRepository,
                           ITopicRepository topicRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedTeacherUser();
        seedTopics();
    }

    private void seedTeacherUser() {
        if (userRepository.findUserByEmail(seedEmail).isPresent()) {
            logger.info("Seed user already exists: {}", seedEmail);
            return;
        }

        User teacher = new User();
        teacher.setFirstName("Teacher");
        teacher.setLastName("Default");
        teacher.setEmail(seedEmail);
        teacher.setPassword(passwordEncoder.encode(seedPassword));
        teacher.setRole(ERole.TEACHER);
        userRepository.save(teacher);
        logger.info("Created seed teacher user: {}", seedEmail);
    }

    private void seedTopics() {
        if (topicRepository.count() > 0) {
            logger.info("Topics already exist, skipping seed");
            return;
        }

        for (String topicName : DEFAULT_TOPICS) {
            Topic topic = new Topic();
            topic.setName(topicName);
            topicRepository.save(topic);
        }
        logger.info("Seeded {} default topics", DEFAULT_TOPICS.size());
    }
}
