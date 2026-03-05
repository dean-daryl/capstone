import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Button,
  Table,
  Badge,
  Center,
  Loader,
  Stack,
  ActionIcon,
  Modal,
  Anchor,
  FileButton,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconUpload,
  IconTrash,
  IconEye,
  IconFileText,
  IconBook,
  IconRefresh,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import { getCourseById, deleteCourse, getCourseDocuments } from '../api/courseService';
import { uploadDocument, deleteDocument, getDocumentViewUrl, reprocessDocument } from '../api/ragService';

function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [course, setCourse] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const canManage = role === 'TEACHER' || role === 'ADMIN';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseRes, docsRes] = await Promise.all([
        getCourseById(id),
        getCourseDocuments(id),
      ]);
      if (courseRes?.data) setCourse(courseRes.data);
      if (docsRes?.data) setDocuments(docsRes.data);
    } catch {
      notifications.show({ message: 'Failed to load course', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const hasProcessing = documents.some(
      (d) => d.status === 'UPLOADING' || d.status === 'PROCESSING'
    );
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      try {
        const docsRes = await getCourseDocuments(id);
        if (docsRes?.data) setDocuments(docsRes.data);
      } catch {
        // Silently ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, id]);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(file, id);
      notifications.show({ message: 'Document uploaded — processing in background', color: 'green' });
      const docsRes = await getCourseDocuments(id);
      if (docsRes?.data) setDocuments(docsRes.data);
    } catch {
      notifications.show({ message: 'Failed to upload document', color: 'red' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await deleteDocument(docId);
      notifications.show({ message: 'Document deleted', color: 'green' });
      setDeleteConfirm(null);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      notifications.show({ message: 'Failed to delete document', color: 'red' });
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(id);
      notifications.show({ message: 'Course deleted', color: 'green' });
      navigate('/dashboard/courses');
    } catch {
      notifications.show({ message: 'Failed to delete course', color: 'red' });
    }
  };

  const handleReprocess = async (docId) => {
    try {
      await reprocessDocument(docId);
      notifications.show({ message: 'Reprocessing started', color: 'green' });
      const docsRes = await getCourseDocuments(id);
      if (docsRes?.data) setDocuments(docsRes.data);
    } catch {
      notifications.show({ message: 'Failed to reprocess document', color: 'red' });
    }
  };

  const handleViewDocument = async (docId) => {
    try {
      const res = await getDocumentViewUrl(docId);
      if (res?.data?.url) {
        window.open(res.data.url, '_blank');
      }
    } catch {
      notifications.show({ message: 'Failed to get document URL', color: 'red' });
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'PROCESSING': case 'UPLOADING': return 'yellow';
      case 'FAILED': return 'red';
      default: return 'gray';
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <Center py={100}>
        <Loader color="indigo" />
      </Center>
    );
  }

  if (!course) {
    return (
      <Center py={100}>
        <Stack align="center" gap="xs">
          <Text c="dimmed">Course not found.</Text>
          <Anchor onClick={() => navigate('/dashboard/courses')} c="indigo">
            Back to courses
          </Anchor>
        </Stack>
      </Center>
    );
  }

  return (
    <Container fluid p="lg">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/dashboard/courses')}
            mb="xs"
            px={0}
          >
            Back to courses
          </Button>
          <Group gap="sm">
            <IconBook size={24} color="var(--mantine-color-indigo-6)" />
            <div>
              <Title order={2}>{course.name}</Title>
              <Group gap="md" mt={4}>
                <Text size="sm" c="dimmed">Code: {course.code}</Text>
                {course.cohort && <Text size="sm" c="dimmed">Cohort: {course.cohort}</Text>}
                {course.facilitatorName && <Text size="sm" c="dimmed">Facilitator: {course.facilitatorName}</Text>}
              </Group>
            </div>
          </Group>
        </div>
        {canManage && (
          <Button
            variant="subtle"
            color="red"
            size="sm"
            leftSection={<IconTrash size={16} />}
            onClick={() => setDeleteConfirm('course')}
          >
            Delete Course
          </Button>
        )}
      </Group>

      {/* Upload Section */}
      {canManage && (
        <Card shadow="sm" padding="md" withBorder mb="lg">
          <Group>
            <FileButton onChange={handleUpload} accept=".pdf,.txt,.docx,.pptx">
              {(props) => (
                <Button
                  {...props}
                  leftSection={<IconUpload size={16} />}
                  loading={uploading}
                >
                  Upload Document
                </Button>
              )}
            </FileButton>
            <Text size="sm" c="dimmed">Supported: PDF, TXT, DOCX, PPTX</Text>
          </Group>
        </Card>
      )}

      {/* Documents Table */}
      <Card shadow="sm" padding={0} withBorder>
        <Group p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
          <IconFileText size={20} color="var(--mantine-color-indigo-6)" />
          <Title order={4}>Documents ({documents.length})</Title>
        </Group>

        {documents.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <IconFileText size={36} color="var(--mantine-color-gray-4)" />
              <Text c="dimmed">No documents uploaded yet.</Text>
            </Stack>
          </Center>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Filename</Table.Th>
                <Table.Th>Size</Table.Th>
                <Table.Th>Chunks</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {documents.map((doc) => (
                <Table.Tr key={doc.id}>
                  <Table.Td>
                    <Text size="sm">{doc.filename}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{formatSize(doc.fileSizeBytes)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{doc.chunkCount ?? '—'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="indigo"
                        onClick={() => handleViewDocument(doc.id)}
                        title="View"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      {canManage && doc.status === 'FAILED' && (
                        <ActionIcon
                          variant="subtle"
                          color="yellow"
                          onClick={() => handleReprocess(doc.id)}
                          title="Reprocess"
                        >
                          <IconRefresh size={16} />
                        </ActionIcon>
                      )}
                      {canManage && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => setDeleteConfirm(doc.id)}
                          title="Delete"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={
          <Title order={4}>
            {deleteConfirm === 'course' ? 'Delete Course' : 'Delete Document'}
          </Title>
        }
        centered
        size="sm"
      >
        <Text c="dimmed" mb="md">
          {deleteConfirm === 'course'
            ? 'This will permanently delete the course and all its documents. This action cannot be undone.'
            : 'This will permanently delete this document. This action cannot be undone.'}
        </Text>
        <Group grow>
          <Button variant="default" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() =>
              deleteConfirm === 'course'
                ? handleDeleteCourse()
                : handleDeleteDocument(deleteConfirm)
            }
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default CourseDetailPage;
