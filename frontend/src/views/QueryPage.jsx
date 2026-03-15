import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Textarea,
  Button,
  Card,
  Group,
  Stack,
  Alert,
  Paper,
  Loader,
  Anchor,
  Box,
  ActionIcon,
  Tooltip,
  CopyButton,
} from '@mantine/core';
import {
  IconSend,
  IconFileText,
  IconExternalLink,
  IconEye,
  IconLanguage,
  IconSparkles,
  IconThumbUp,
  IconThumbDown,
  IconThumbUpFilled,
  IconThumbDownFilled,
  IconCopy,
  IconCheck,
} from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { queryDocuments, translateText, simplifyText, submitSatisfaction } from '../api/ragService';
import { createRecentActivity } from '../api/recentActivityService';
import { useAuth } from '../context/AuthContext';

const PLACEHOLDERS = [
  'Explain the concept of derivatives in simple terms...',
  'What is the difference between velocity and acceleration?',
  'Summarize the key points from the uploaded lecture notes...',
  'Solve: If f(x) = 3x² + 2x - 1, find f\'(2)',
  'Translate this concept into simpler English for me...',
  'What are the main themes discussed in Chapter 3?',
  'How does photosynthesis work step by step?',
];

const QueryPage = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const currentQuestion = question;
    setQuestion('');
    setLoading(true);
    setError(null);

    const newEntry = {
      question: currentQuestion,
      result: null,
      translatedText: '',
      simplifiedText: '',
      isTranslating: false,
      isSimplifying: false,
      satisfaction: null,
    };

    setConversations((prev) => [...prev, newEntry]);
    const entryIndex = conversations.length;

    try {
      const response = await queryDocuments(currentQuestion);
      setConversations((prev) => {
        const updated = [...prev];
        updated[entryIndex] = { ...updated[entryIndex], result: response.data };
        return updated;
      });
      if (user?.id && response.data?.answer) {
        createRecentActivity(user.id, currentQuestion, response.data.answer);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to query documents. Please try again.');
      setConversations((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const updateEntry = (index, updates) => {
    setConversations((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  const handleTranslate = async (index) => {
    const entry = conversations[index];
    if (!entry.result?.answer) return;
    updateEntry(index, { isTranslating: true });
    try {
      const response = await translateText(entry.result.answer);
      updateEntry(index, { translatedText: response.data.translated_text, isTranslating: false });
    } catch (err) {
      console.error('Translation error:', err);
      updateEntry(index, { isTranslating: false });
    }
  };

  const handleSimplify = async (index) => {
    const entry = conversations[index];
    if (!entry.result?.answer) return;
    updateEntry(index, { isSimplifying: true });
    try {
      const response = await simplifyText(entry.result.answer);
      updateEntry(index, { simplifiedText: response.data.simplifiedText, isSimplifying: false });
    } catch (err) {
      console.error('Simplify error:', err);
      updateEntry(index, { isSimplifying: false });
    }
  };

  const handleSatisfaction = async (index, value) => {
    const entry = conversations[index];
    const newValue = entry.satisfaction === value ? null : value;
    updateEntry(index, { satisfaction: newValue });
    if (entry.result?.queryId && newValue !== null) {
      try {
        await submitSatisfaction(entry.result.queryId, newValue);
      } catch (err) {
        console.error('Feedback error:', err);
      }
    }
  };

  const MarkdownContent = ({ content }) => (
    <Box
      className="markdown-content"
      style={{
        lineHeight: 1.7,
        '& p': { marginBottom: '0.5em' },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </Box>
  );

  return (
    <Container size="md" p={{ base: 'sm', sm: 'lg' }}>
      <Stack gap="lg">
        <div>
          <Title order={2}>Ask AI</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Ask questions about your uploaded documents
          </Text>
        </div>

        {conversations.map((entry, index) => (
          <Stack gap="sm" key={index}>
            <Paper
              p="md"
              radius="md"
              bg="var(--mantine-color-indigo-0)"
              style={{ border: '1px solid var(--mantine-color-indigo-2)', alignSelf: 'flex-end' }}
            >
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {entry.question}
              </Text>
            </Paper>

            {entry.result ? (
              <Card shadow="sm" padding={{ base: 'sm', sm: 'lg' }} withBorder>
                <Group justify="space-between" mb="sm">
                  <Title order={4}>Answer</Title>
                  <Group gap={4}>
                    <CopyButton value={entry.result.answer} timeout={2000}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied' : 'Copy answer'} withArrow>
                          <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy} size="sm">
                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                    <Tooltip label="Helpful" withArrow>
                      <ActionIcon
                        variant="subtle"
                        color={entry.satisfaction === 1 ? 'green' : 'gray'}
                        onClick={() => handleSatisfaction(index, 1)}
                        size="sm"
                      >
                        {entry.satisfaction === 1 ? <IconThumbUpFilled size={16} /> : <IconThumbUp size={16} />}
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Not helpful" withArrow>
                      <ActionIcon
                        variant="subtle"
                        color={entry.satisfaction === -1 ? 'red' : 'gray'}
                        onClick={() => handleSatisfaction(index, -1)}
                        size="sm"
                      >
                        {entry.satisfaction === -1 ? <IconThumbDownFilled size={16} /> : <IconThumbDown size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>

                <MarkdownContent content={entry.result.answer} />

                <Group gap="sm" mt="md" pt="md" wrap="wrap" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                  <Button
                    variant="light"
                    color="indigo"
                    size="xs"
                    onClick={() => handleTranslate(index)}
                    loading={entry.isTranslating}
                    leftSection={<IconLanguage size={14} />}
                  >
                    Translate to Kinyarwanda
                  </Button>
                  <Button
                    variant="light"
                    color="blue"
                    size="xs"
                    onClick={() => handleSimplify(index)}
                    loading={entry.isSimplifying}
                    leftSection={<IconSparkles size={14} />}
                  >
                    Simplify
                  </Button>
                </Group>

                {entry.translatedText && (
                  <Paper
                    mt="md"
                    p="md"
                    radius="md"
                    bg="var(--mantine-color-indigo-0)"
                    style={{ border: '1px solid var(--mantine-color-indigo-2)' }}
                  >
                    <Group justify="space-between" mb="xs">
                      <Text size="xs" fw={600} tt="uppercase" c="indigo">
                        Kinyarwanda
                      </Text>
                      <CopyButton value={entry.translatedText} timeout={2000}>
                        {({ copied, copy }) => (
                          <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy} size="xs">
                            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          </ActionIcon>
                        )}
                      </CopyButton>
                    </Group>
                    <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                      {entry.translatedText}
                    </Text>
                  </Paper>
                )}

                {entry.simplifiedText && (
                  <Paper
                    mt="md"
                    p="md"
                    radius="md"
                    bg="var(--mantine-color-blue-0)"
                    style={{ border: '1px solid var(--mantine-color-blue-2)' }}
                  >
                    <Group justify="space-between" mb="xs">
                      <Text size="xs" fw={600} tt="uppercase" c="blue">
                        Simplified
                      </Text>
                      <CopyButton value={entry.simplifiedText} timeout={2000}>
                        {({ copied, copy }) => (
                          <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy} size="xs">
                            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          </ActionIcon>
                        )}
                      </CopyButton>
                    </Group>
                    <MarkdownContent content={entry.simplifiedText} />
                  </Paper>
                )}

                {entry.result.sources && entry.result.sources.length > 0 && (
                  <Box mt="md">
                    <Text size="sm" fw={600} mb="xs" c="dimmed">
                      Sources
                    </Text>
                    <Stack gap="xs">
                      {entry.result.sources.map((source, si) => (
                        <Paper key={si} p="sm" radius="md" withBorder>
                          <Group justify="space-between" mb={4} wrap="wrap">
                            <Group gap="xs">
                              <IconFileText size={14} color="var(--mantine-color-indigo-6)" />
                              <Text size="xs" fw={500}>
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
                          <Text size="xs" c="dimmed" lineClamp={2}>
                            {source.chunkText}
                          </Text>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Card>
            ) : (
              loading && index === conversations.length - 1 && (
                <Card shadow="sm" padding="lg" withBorder>
                  <Group gap="sm">
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed">Thinking...</Text>
                  </Group>
                </Card>
              )
            )}
          </Stack>
        ))}

        <div ref={bottomRef} />

        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          style={{ position: 'sticky', bottom: 0, zIndex: 10 }}
          bg="var(--mantine-color-body)"
          pt="sm"
          pb="md"
        >
          <Group gap="sm" align="flex-end">
            <Textarea
              flex={1}
              placeholder={PLACEHOLDERS[placeholderIndex]}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              size="md"
              minRows={1}
              maxRows={5}
              autosize
              styles={{
                input: { paddingRight: 50 },
              }}
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
          <Text size="xs" c="dimmed" mt={4} ta="center">
            Press Enter to send, Shift+Enter for a new line
          </Text>
        </Box>
      </Stack>
    </Container>
  );
};

export default QueryPage;
