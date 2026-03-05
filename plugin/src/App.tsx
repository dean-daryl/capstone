import React, { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { LoginForm } from "./components/LoginForm";
import { ChatHistory } from "./components/ChatHistory";
import { ActionButtons } from "./components/ActionButtons";
import { SourceCard } from "./components/SourceCard";
import { Card, CardContent } from "./components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { Loader2, FileText, ExternalLink, LogOut, History } from "lucide-react";
import { cn } from "./lib/util";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://89.167.119.247";

// Chrome extension storage helpers with localStorage fallback
const isChromeExtension = typeof chrome !== "undefined" && !!chrome.storage?.local;

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
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function ragQuery(question: string, token: string | null): Promise<RagResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/rag/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      question,
      type: "rag",
      source: "plugin",
    }),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || "Query failed");
  return data.data as RagResponse;
}

async function translateText(text: string, token: string): Promise<string> {
  const res = await fetch(`${API_BASE}/translate`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      text,
      srcLang: "eng_Latn",
      tgtLang: "kin_Latn",
    }),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || "Translation failed");
  return data.data.translated_text;
}

async function simplifyText(text: string, token: string): Promise<string> {
  const res = await fetch(`${API_BASE}/simplify`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || "Simplification failed");
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

async function saveRecentActivity(token: string, userId: string, question: string, answer: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/recent-activity/`, {
      method: "POST",
      headers: { ...authHeaders(token), title: question.slice(0, 100) },
      body: JSON.stringify({
        userId,
        conversationType: "TEXT",
        conversation: { question, answer },
      }),
    });
  } catch (err) {
    console.error("Failed to save recent activity:", err);
  }
}

const App: React.FC = () => {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // Query state
  const [selectedText, setSelectedText] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [ragSources, setRagSources] = useState<SourceChunk[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryError, setQueryError] = useState("");

  // Action state
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState("");
  const [isSimplifying, setIsSimplifying] = useState(false);

  // History state
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Source detail modal
  const [selectedSource, setSelectedSource] = useState<SourceChunk | null>(null);

  // Load token and userId from storage on mount
  useEffect(() => {
    storageGet("authToken").then((t) => {
      if (t) setToken(t);
    });
    storageGet("userId").then((id) => {
      if (id) setUserId(id);
    });
  }, []);

  // Fetch history when token becomes available
  useEffect(() => {
    if (token) {
      fetchQueryHistory(token).then(setQueryHistory).catch(console.error);
    }
  }, [token]);

  // Capture selected text from active tab (only in Chrome extension context)
  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.tabs?.query) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: () => window.getSelection()?.toString() || "",
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error("Script injection failed:", chrome.runtime.lastError.message);
            return;
          }
          if (results?.[0]?.result) {
            setSelectedText(results[0].result as string);
          }
        }
      );
    });
  }, []);

  // Perform RAG query when selected text is available
  useEffect(() => {
    if (selectedText.trim().length <= 3) return;

    setIsQuerying(true);
    setQueryError("");
    setRagAnswer("");
    setRagSources([]);
    setTranslatedText("");
    setSimplifiedText("");

    ragQuery(selectedText, token)
      .then((result) => {
        setRagAnswer(result.answer);
        setRagSources(result.sources ?? []);
        // Save recent activity and refresh history
        if (token && userId) {
          saveRecentActivity(token, userId, selectedText, result.answer);
          fetchQueryHistory(token).then(setQueryHistory).catch(console.error);
        }
      })
      .catch((err) => {
        console.error("RAG error:", err);
        setQueryError("Failed to search documents. Is the backend running?");
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
      console.error("Translation error:", err);
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
      console.error("Simplify error:", err);
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleLogout = () => {
    storageRemove("authToken");
    storageRemove("userId");
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
    <div className="w-[500px] h-fit bg-background text-foreground">
      {/* Header with auth controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <Header />
        <div className="flex items-center gap-2">
          {token ? (
            <>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  showHistory ? "bg-purple-100 text-purple-700" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Chat history"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLogin(!showLogin)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
            >
              Log in
            </button>
          )}
        </div>
      </div>

      <main className="p-4 space-y-4">
        {/* Login form */}
        {showLogin && !token && (
          <Card>
            <CardContent className="pt-4">
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            </CardContent>
          </Card>
        )}

        {/* Chat history */}
        {showHistory && token && queryHistory.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Recent Queries
            </p>
            <ChatHistory history={queryHistory} />
          </div>
        )}

        {/* RAG Answer */}
        <Card className={cn(
          "transition-all duration-300",
          isQuerying ? "opacity-50" : "opacity-100"
        )}>
          <CardContent className="pt-4">
            {isQuerying ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Searching documents...</p>
              </div>
            ) : queryError ? (
              <p className="text-sm text-red-500">{queryError}</p>
            ) : ragAnswer ? (
              <div className="space-y-4">
                {/* Answer */}
                <p className="text-[15px] leading-relaxed">{ragAnswer}</p>

                {/* Action buttons (translate & simplify) */}
                {token && (
                  <ActionButtons
                    onTranslate={handleTranslate}
                    onSimplify={handleSimplify}
                    isTranslating={isTranslating}
                    isSimplifying={isSimplifying}
                  />
                )}

                {/* Simplified text */}
                {simplifiedText && (
                  <div className="space-y-1 border-t pt-3">
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      Simplified
                    </p>
                    <p className="text-sm leading-relaxed">{simplifiedText}</p>
                  </div>
                )}

                {/* Kinyarwanda translation */}
                {translatedText && (
                  <div className="space-y-1 border-t pt-3">
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                      Kinyarwanda
                    </p>
                    <p className="text-sm leading-relaxed">{translatedText}</p>
                  </div>
                )}

                {/* Sources */}
                {ragSources.length > 0 && (
                  <div className="space-y-2 border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ragSources.map((source, i) => (
                        <SourceCard
                          key={`${source.documentId}-${i}`}
                          filename={source.filename}
                          score={source.score}
                          documentUrl={source.documentUrl}
                          onClick={() => setSelectedSource(source)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8">
                <FileText className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Select text on any page to search your documents
                </p>
                {!token && (
                  <p className="text-xs text-muted-foreground">
                    Log in to translate, simplify, and view history
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Source detail modal */}
      <Dialog open={!!selectedSource} onOpenChange={(open) => { if (!open) setSelectedSource(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {selectedSource?.filename}
            </DialogTitle>
            <DialogDescription>
              Relevance: {selectedSource ? Math.round(selectedSource.score * 100) : 0}%
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {selectedSource?.chunkText}
            </p>
          </div>
          {selectedSource?.documentUrl && (
            <div className="pt-4 border-t">
              <a
                href={selectedSource.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Open full document
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default App;
