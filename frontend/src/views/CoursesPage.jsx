import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Button,
  SimpleGrid,
  Badge,
  Modal,
  TextInput,
  Stack,
  Center,
  Loader,
  ActionIcon,
} from '@mantine/core';
import {
  IconBook,
  IconPlus,
  IconTrash,
  IconFileText,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import { getCourses, createCourse, deleteCourse } from '../api/courseService';

function CoursesPage() {
  const { role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', cohort: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const canManage = role === 'TEACHER' || role === 'ADMIN';

  const fetchCourses = () => {
    setLoading(true);
    getCourses()
      .then((res) => {
        if (res?.data) setCourses(res.data);
      })
      .catch(() => notifications.show({ message: 'Failed to load courses', color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      notifications.show({ message: 'Name and code are required', color: 'red' });
      return;
    }
    setCreating(true);
    try {
      await createCourse(formData);
      notifications.show({ message: 'Course created successfully', color: 'green' });
      setShowCreateModal(false);
      setFormData({ name: '', code: '', cohort: '' });
      fetchCourses();
    } catch {
      notifications.show({ message: 'Failed to create course', color: 'red' });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id);
      notifications.show({ message: 'Course deleted successfully', color: 'green' });
      setDeleteConfirmId(null);
      fetchCourses();
    } catch {
      notifications.show({ message: 'Failed to delete course', color: 'red' });
    }
  };

  return (
    <Container fluid p="lg">
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconBook size={24} color="var(--mantine-color-indigo-6)" />
          <Title order={2}>Courses</Title>
        </Group>
        {canManage && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Course
          </Button>
        )}
      </Group>

      <Card shadow="sm" padding="lg" withBorder>
        {loading ? (
          <Center py="xl">
            <Loader color="indigo" />
          </Center>
        ) : courses.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <IconBook size={40} color="var(--mantine-color-gray-4)" />
              <Text c="dimmed">No courses available yet.</Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {courses.map((course) => (
              <Card
                key={course.id}
                component={Link}
                to={`/dashboard/courses/${course.id}`}
                withBorder
                padding="md"
                radius="md"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  position: 'relative',
                  transition: 'box-shadow 150ms ease',
                  '&:hover': { boxShadow: 'var(--mantine-shadow-md)' },
                }}
              >
                <Group justify="space-between" mb="xs">
                  <Text fw={600}>{course.name}</Text>
                  <Badge
                    variant="light"
                    color="indigo"
                    size="sm"
                    leftSection={<IconFileText size={12} />}
                  >
                    {course.documentCount ?? 0}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  Code: {course.code}
                </Text>
                {course.cohort && (
                  <Text size="sm" c="dimmed">
                    Cohort: {course.cohort}
                  </Text>
                )}
                {course.facilitatorName && (
                  <Text size="xs" c="dimmed" mt="xs">
                    By {course.facilitatorName}
                  </Text>
                )}
                {canManage && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    style={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteConfirmId(course.id);
                    }}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                )}
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Card>

      {/* Create Course Modal */}
      <Modal
        opened={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={<Title order={3}>Create Course</Title>}
        centered
      >
        <form onSubmit={handleCreate}>
          <Stack gap="sm">
            <TextInput
              label="Course Name"
              placeholder="e.g. Introduction to CS"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextInput
              label="Course Code"
              placeholder="e.g. CS101"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <TextInput
              label="Cohort"
              placeholder="e.g. 2026"
              value={formData.cohort}
              onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
            />
            <Group grow mt="xs">
              <Button variant="default" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={creating}>
                Create
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title={<Title order={4}>Delete Course</Title>}
        centered
        size="sm"
      >
        <Text c="dimmed" mb="md">
          This will permanently delete the course and all its documents. This action cannot be undone.
        </Text>
        <Group grow>
          <Button variant="default" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={() => handleDelete(deleteConfirmId)}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default CoursesPage;
