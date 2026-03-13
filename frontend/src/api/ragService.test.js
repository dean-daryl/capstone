import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from './apiClient';
import {
  queryDocuments,
  getDocuments,
  getDocumentById,
  deleteDocument,
  translateText,
  simplifyText,
} from './ragService.js';

describe('ragService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queryDocuments sends question to /rag/query', async () => {
    apiClient.post.mockResolvedValue({ data: { answer: 'response' } });

    const result = await queryDocuments('What is AI?');

    expect(apiClient.post).toHaveBeenCalledWith('/rag/query', { question: 'What is AI?' });
    expect(result).toEqual({ answer: 'response' });
  });

  it('getDocuments calls GET /rag/documents', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [] } });

    const result = await getDocuments();

    expect(apiClient.get).toHaveBeenCalledWith('/rag/documents');
  });

  it('getDocumentById calls correct endpoint', async () => {
    apiClient.get.mockResolvedValue({ data: { data: { id: '123' } } });

    await getDocumentById('123');

    expect(apiClient.get).toHaveBeenCalledWith('/rag/documents/123');
  });

  it('deleteDocument calls DELETE endpoint', async () => {
    apiClient.delete.mockResolvedValue({ data: { status: true } });

    await deleteDocument('abc');

    expect(apiClient.delete).toHaveBeenCalledWith('/rag/documents/abc');
  });

  it('translateText sends correct payload', async () => {
    apiClient.post.mockResolvedValue({ data: { translated_text: 'Muraho' } });

    await translateText('Hello');

    expect(apiClient.post).toHaveBeenCalledWith('/translate', {
      text: 'Hello',
      srcLang: 'eng_Latn',
      tgtLang: 'kin_Latn',
    });
  });

  it('simplifyText sends correct payload', async () => {
    apiClient.post.mockResolvedValue({ data: { simplified: 'Simple text' } });

    await simplifyText('Complex text');

    expect(apiClient.post).toHaveBeenCalledWith('/simplify', { text: 'Complex text' });
  });
});
