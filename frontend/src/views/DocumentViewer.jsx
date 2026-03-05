import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Group,
  Button,
  Center,
  Loader,
  Text,
  Stack,
  Box,
} from '@mantine/core';
import { IconArrowLeft, IconDownload, IconAlertCircle } from '@tabler/icons-react';
import { getDocumentViewUrl } from '../api/ragService';

const DocumentViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await getDocumentViewUrl(id);
        setUrl(response.data.url);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load document.');
      } finally {
        setLoading(false);
      }
    };
    fetchUrl();
  }, [id]);

  if (loading) {
    return (
      <Center h="100vh">
        <Group gap="sm">
          <Loader size="sm" color="indigo" />
          <Text c="dimmed">Loading document...</Text>
        </Group>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="sm">
          <IconAlertCircle size={40} color="var(--mantine-color-red-6)" />
          <Text>{error}</Text>
          <Button variant="light" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Group
        justify="space-between"
        px="md"
        py="sm"
        style={{ borderBottom: '1px solid var(--mantine-color-gray-2)', flexShrink: 0 }}
      >
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button
          component="a"
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          variant="light"
          leftSection={<IconDownload size={16} />}
          size="sm"
        >
          Download
        </Button>
      </Group>
      <iframe
        src={url}
        title="Document Viewer"
        style={{ flex: 1, width: '100%', border: 0 }}
      />
    </Box>
  );
};

export default DocumentViewer;
