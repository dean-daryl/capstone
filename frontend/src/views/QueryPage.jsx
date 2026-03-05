import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  TextInput,
  Button,
  Card,
  Group,
  Stack,
  Alert,
  Badge,
  Paper,
  Loader,
  Anchor,
  Box,
} from '@mantine/core';
import {
  IconSend,
  IconFileText,
  IconExternalLink,
  IconEye,
  IconLanguage,
  IconSparkles,
} from '@tabler/icons-react';
import { queryDocuments, translateText, simplifyText } from '../api/ragService';
import { createRecentActivity } from '../api/recentActivityService';
import { useAuth } from '../context/AuthContext';

const QueryPage = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState('');
  const [isSimplifying, setIsSimplifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setTranslatedText('');
    setSimplifiedText('');

    try {
      const response = await queryDocuments(question);
      setResult(response.data);
      if (user?.id && response.data?.answer) {
        createRecentActivity(user.id, question, response.data.answer);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to query documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!result?.answer) return;
    setIsTranslating(true);
    try {
      const response = await translateText(result.answer);
      setTranslatedText(response.data.translated_text);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSimplify = async () => {
    if (!result?.answer) return;
    setIsSimplifying(true);
    try {
      const response = await simplifyText(result.answer);
      setSimplifiedText(response.data.simplifiedText);
    } catch (err) {
      console.error('Simplify error:', err);
    } finally {
      setIsSimplifying(false);
    }
  };

  return (
    <Container size="md" p="lg">
      <Stack gap="lg">
        <div>
          <Title order={2}>Ask AI</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Ask questions about your uploaded documents
          </Text>
        </div>

        <form onSubmit={handleSubmit}>
          <Group gap="sm" align="flex-end">
            <TextInput
              flex={1}
              placeholder="Ask a question about your documents..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              size="md"
            />
            <Button
              type="submit"
              size="md"
              loading={loading}
              disabled={!question.trim()}
              leftSection={!loading && <IconSend size={18} />}
            >
              Ask
            </Button>
          </Group>
        </form>

        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        {result && (
          <Stack gap="md">
            <Card shadow="sm" padding="lg" withBorder>
              <Title order={4} mb="sm">
                Answer
              </Title>
              <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {result.answer}
              </Text>

              <Group gap="sm" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                <Button
                  variant="light"
                  color="indigo"
                  size="sm"
                  onClick={handleTranslate}
                  loading={isTranslating}
                  leftSection={<IconLanguage size={16} />}
                >
                  Translate to Kinyarwanda
                </Button>
                <Button
                  variant="light"
                  color="blue"
                  size="sm"
                  onClick={handleSimplify}
                  loading={isSimplifying}
                  leftSection={<IconSparkles size={16} />}
                >
                  Simplify
                </Button>
              </Group>

              {translatedText && (
                <Paper
                  mt="md"
                  p="md"
                  radius="md"
                  bg="var(--mantine-color-indigo-0)"
                  style={{ border: '1px solid var(--mantine-color-indigo-2)' }}
                >
                  <Text size="xs" fw={600} tt="uppercase" c="indigo" mb="xs">
                    Kinyarwanda
                  </Text>
                  <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {translatedText}
                  </Text>
                </Paper>
              )}

              {simplifiedText && (
                <Paper
                  mt="md"
                  p="md"
                  radius="md"
                  bg="var(--mantine-color-blue-0)"
                  style={{ border: '1px solid var(--mantine-color-blue-2)' }}
                >
                  <Text size="xs" fw={600} tt="uppercase" c="blue" mb="xs">
                    Simplified
                  </Text>
                  <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {simplifiedText}
                  </Text>
                </Paper>
              )}
            </Card>

            {result.sources && result.sources.length > 0 && (
              <Card shadow="sm" padding="lg" withBorder>
                <Title order={4} mb="md">
                  Sources
                </Title>
                <Stack gap="sm">
                  {result.sources.map((source, index) => (
                    <Paper
                      key={index}
                      p="md"
                      radius="md"
                      withBorder
                    >
                      <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                          <IconFileText size={16} color="var(--mantine-color-indigo-6)" />
                          <Text size="sm" fw={500}>
                            {source.filename}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          {source.documentUrl && (
                            <Anchor
                              href={source.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="xs"
                              c="indigo"
                            >
                              <Group gap={4}>
                                <IconExternalLink size={12} /> Open
                              </Group>
                            </Anchor>
                          )}
                          {source.documentId && (
                            <Anchor
                              component={Link}
                              to={`/dashboard/documents/${source.documentId}`}
                              size="xs"
                              c="blue"
                            >
                              <Group gap={4}>
                                <IconEye size={12} /> View
                              </Group>
                            </Anchor>
                          )}
                        </Group>
                      </Group>
                      <Text size="sm" c="dimmed" lineClamp={3}>
                        {source.chunkText}
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              </Card>
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default QueryPage;
