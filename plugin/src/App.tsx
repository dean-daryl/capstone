import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Group,
  Text,
  Button,
  ActionIcon,
  Stack,
  Paper,
  Loader,
  Center,
  Modal,
  Anchor,
  Divider,
  ScrollArea,
} from '@mantine/core';
import {
  IconHistory,
  IconLogout,
  IconFileText,
  IconExternalLink,
} from '@tabler/icons-react';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { ChatHistory } from './components/ChatHistory';
import { ActionButtons } from './components/ActionButtons';
import { SourceCard } from './components/SourceCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://89.167.119.247';

const isChromeExtension = typeof chrome !== 'undefined' && !!chrome.storage?.local;

function storageGet(key: string): Promise<string | null> {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => resolve(result[key] ?? null));
    });
  }
  return Promise.resolve(localStorage.getItem(key));
}

function storageRemove(key: string): void {
  if (isChromeExtension) {
    chrome.storage.local.remove([key]);
  } else {
    localStorage.removeItem(key);
  }
}

interface SourceChunk {
  documentId: string;
  filename: string;
  chunkText: string;
  score: number;
  documentUrl?: string;
}

interface RagResponse {
  answer: string;
  sources: SourceChunk[];
}

interface QueryHistoryItem {
  id: string;
  text: string;
  response: string;
  source: string;
  createdAt: string;
}

function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function ragQuery(question: string, token: string | null): Promise<RagResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/rag/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ question, type: 'rag', source: 'plugin' }),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || 'Query failed');
  return data.data as RagResponse;
}

async function translateText(text: string, token: string): Promise<string> {
  const res = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ text, srcLang: 'eng_Latn', tgtLang: 'kin_Latn' }),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || 'Translation failed');
  return data.data.translated_text;
}

async function simplifyText(text: string, token: string): Promise<string> {
  const res = await fetch(`${API_BASE}/simplify`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || 'Simplification failed');
  return data.data.simplifiedText;
}

async function fetchQueryHistory(token: string): Promise<QueryHistoryItem[]> {
  const res = await fetch(`${API_BASE}/rag/queries`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!data.status) return [];
  return data.data as QueryHistoryItem[];
}

async function saveRecentActivity(
  token: string,
  userId: string,
  question: string,
  answer: string
): Promise<void> {
  try {
    await fetch(`${API_BASE}/recent-activity/`, {
      method: 'POST',
      headers: { ...authHeaders(token), title: question.slice(0, 100) },
      body: JSON.stringify({
        userId,
        conversationType: 'TEXT',
        conversation: { question, answer },
      }),
    });
  } catch (err) {
    console.error('Failed to save recent activity:', err);
  }
}

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const [selectedText, setSelectedText] = useState('');
  const [ragAnswer, setRagAnswer] = useState('');
  const [ragSources, setRagSources] = useState<SourceChunk[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryError, setQueryError] = useState('');

  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState('');
  const [isSimplifying, setIsSimplifying] = useState(false);

  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [selectedSource, setSelectedSource] = useState<SourceChunk | null>(null);

  useEffect(() => {
    storageGet('authToken').then((t) => {
      if (t) setToken(t);
    });
    storageGet('userId').then((id) => {
      if (id) setUserId(id);
    });
  }, []);

  useEffect(() => {
    if (token) {
      fetchQueryHistory(token).then(setQueryHistory).catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.tabs?.query) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: () => window.getSelection()?.toString() || '',
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error('Script injection failed:', chrome.runtime.lastError.message);
            return;
          }
          if (results?.[0]?.result) {
            setSelectedText(results[0].result as string);
          }
        }
      );
    });
  }, []);

  useEffect(() => {
    if (selectedText.trim().length <= 3) return;

    setIsQuerying(true);
    setQueryError('');
    setRagAnswer('');
    setRagSources([]);
    setTranslatedText('');
    setSimplifiedText('');

    ragQuery(selectedText, token)
      .then((result) => {
        setRagAnswer(result.answer);
        setRagSources(result.sources ?? []);
        if (token && userId) {
          saveRecentActivity(token, userId, selectedText, result.answer);
          fetchQueryHistory(token).then(setQueryHistory).catch(console.error);
        }
      })
      .catch((err) => {
        console.error('RAG error:', err);
        setQueryError('Failed to search documents. Is the backend running?');
      })
      .finally(() => setIsQuerying(false));
  }, [selectedText]);

  const handleTranslate = async () => {
    if (!token || !ragAnswer) return;
    setIsTranslating(true);
    try {
      const result = await translateText(ragAnswer, token);
      setTranslatedText(result);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSimplify = async () => {
    if (!token || !ragAnswer) return;
    setIsSimplifying(true);
    try {
      const result = await simplifyText(ragAnswer, token);
      setSimplifiedText(result);
    } catch (err) {
      console.error('Simplify error:', err);
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleLogout = () => {
    storageRemove('authToken');
    storageRemove('userId');
    setToken(null);
    setUserId(null);
    setQueryHistory([]);
    setShowLogin(false);
  };

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    setShowLogin(false);
  };

  return (
    <Box w={500} style={{ minHeight: 'fit-content' }}>
      {/* Header */}
      <Group
        justify="space-between"
        p="sm"
        style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
      >
        <Header />
        <Group gap="xs">
          {token ? (
            <>
              <ActionIcon
                variant={showHistory ? 'light' : 'subtle'}
                color={showHistory ? 'indigo' : 'gray'}
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                title="Chat history"
              >
                <IconHistory size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={handleLogout}
                title="Log out"
              >
                <IconLogout size={16} />
              </ActionIcon>
            </>
          ) : (
            <Button
              size="xs"
              variant={showLogin ? 'light' : 'filled'}
              onClick={() => setShowLogin(!showLogin)}
            >
              Log in
            </Button>
          )}
        </Group>
      </Group>

      <Stack p="sm" gap="sm">
        {/* Login form */}
        {showLogin && !token && (
          <Card withBorder padding="sm">
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </Card>
        )}

        {/* Chat history */}
        {showHistory && token && queryHistory.length > 0 && (
          <div>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb="xs">
              Recent Queries
            </Text>
            <ChatHistory history={queryHistory} />
          </div>
        )}

        {/* RAG Answer */}
        <Card
          withBorder
          padding="sm"
          style={{
            opacity: isQuerying ? 0.5 : 1,
            transition: 'opacity 200ms',
          }}
        >
          {isQuerying ? (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <Loader size="md" color="indigo" />
                <Text size="sm" c="dimmed">
                  Searching documents...
                </Text>
              </Stack>
            </Center>
          ) : queryError ? (
            <Text size="sm" c="red">
              {queryError}
            </Text>
          ) : ragAnswer ? (
            <Stack gap="sm">
              <Text size="sm" style={{ lineHeight: 1.7 }}>
                {ragAnswer}
              </Text>

              {token && (
                <ActionButtons
                  onTranslate={handleTranslate}
                  onSimplify={handleSimplify}
                  isTranslating={isTranslating}
                  isSimplifying={isSimplifying}
                />
              )}

              {simplifiedText && (
                <Paper
                  p="sm"
                  radius="md"
                  bg="var(--mantine-color-blue-0)"
                  style={{ borderTop: '1px solid var(--mantine-color-blue-2)' }}
                >
                  <Text size="xs" fw={600} tt="uppercase" c="blue" mb={4}>
                    Simplified
                  </Text>
                  <Text size="sm" style={{ lineHeight: 1.6 }}>
                    {simplifiedText}
                  </Text>
                </Paper>
              )}

              {translatedText && (
                <Paper
                  p="sm"
                  radius="md"
                  bg="var(--mantine-color-indigo-0)"
                  style={{ borderTop: '1px solid var(--mantine-color-indigo-2)' }}
                >
                  <Text size="xs" fw={600} tt="uppercase" c="indigo" mb={4}>
                    Kinyarwanda
                  </Text>
                  <Text size="sm" style={{ lineHeight: 1.6 }}>
                    {translatedText}
                  </Text>
                </Paper>
              )}

              {ragSources.length > 0 && (
                <div>
                  <Divider mb="xs" />
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb="xs">
                    Sources
                  </Text>
                  <Group gap="xs">
                    {ragSources.map((source, i) => (
                      <SourceCard
                        key={`${source.documentId}-${i}`}
                        filename={source.filename}
                        score={source.score}
                        documentUrl={source.documentUrl}
                        onClick={() => setSelectedSource(source)}
                      />
                    ))}
                  </Group>
                </div>
              )}
            </Stack>
          ) : (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <IconFileText size={32} color="var(--mantine-color-gray-4)" />
                <Text size="sm" c="dimmed" ta="center">
                  Select text on any page to search your documents
                </Text>
                {!token && (
                  <Text size="xs" c="dimmed">
                    Log in to translate, simplify, and view history
                  </Text>
                )}
              </Stack>
            </Center>
          )}
        </Card>
      </Stack>

      {/* Source detail modal */}
      <Modal
        opened={!!selectedSource}
        onClose={() => setSelectedSource(null)}
        title={
          <Group gap="xs">
            <IconFileText size={16} />
            <Text fw={600}>{selectedSource?.filename}</Text>
          </Group>
        }
        size="md"
        centered
      >
        <Text size="xs" c="dimmed" mb="sm">
          Relevance: {selectedSource ? Math.round(selectedSource.score * 100) : 0}%
        </Text>
        <ScrollArea mah={300}>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {selectedSource?.chunkText}
          </Text>
        </ScrollArea>
        {selectedSource?.documentUrl && (
          <Anchor
            href={selectedSource.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            c="indigo"
            mt="md"
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <IconExternalLink size={14} />
            Open full document
          </Anchor>
        )}
      </Modal>
    </Box>
  );
};

export default App;
