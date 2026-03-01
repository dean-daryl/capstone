import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, FileText, ExternalLink, Eye, Loader2, Languages, Sparkles } from 'lucide-react';
import { queryDocuments, translateText, simplifyText } from '../api/ragService';

const QueryPage = () => {
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
      setTranslatedText(response.data.translatedText);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Ask AI</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ask questions about your uploaded documents
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Ask
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Answer</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {result.answer}
              </p>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 disabled:opacity-50 transition-colors"
                >
                  {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                  Translate to Kinyarwanda
                </button>
                <button
                  onClick={handleSimplify}
                  disabled={isSimplifying}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
                >
                  {isSimplifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Simplify
                </button>
              </div>

              {translatedText && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg">
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">Kinyarwanda</p>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{translatedText}</p>
                </div>
              )}

              {simplifiedText && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Simplified</p>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{simplifiedText}</p>
                </div>
              )}
            </div>

            {result.sources && result.sources.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sources</h2>
                <div className="space-y-3">
                  {result.sources.map((source, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {source.filename}
                        </span>
                        <div className="flex items-center gap-2 ml-auto">
                          {source.documentUrl && (
                            <a
                              href={source.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> Open
                            </a>
                          )}
                          {source.documentId && (
                            <Link
                              to={`/dashboard/documents/${source.documentId}`}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> View
                            </Link>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {source.chunkText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryPage;
