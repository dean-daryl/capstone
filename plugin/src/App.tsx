import React, { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Header } from "./components/Header";
import { TimestampModal } from "./components/TimestampModal";
import { SourceCard } from "./components/SourceCard";
import { Card, CardContent } from "../src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { Loader2, FileText } from "lucide-react";
import { cn } from "../src/lib/util";

const OLLAMA_BASE_URL = "http://localhost:11434";
const OLLAMA_MODEL = "qwen2.5:3b";

async function ollamaChat(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
  });
  const data = await res.json();
  return data.message.content;
}

interface SourceChunk {
  documentId: string;
  filename: string;
  chunkText: string;
  score: number;
}

interface RagResponse {
  answer: string;
  sources: SourceChunk[];
}

async function ragQuery(question: string): Promise<RagResponse> {
  const res = await fetch("http://localhost:8080/rag/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const data = await res.json();
  return data as RagResponse;
}

const App: React.FC = () => {
  const [text, setResult] = useState("");
  const [simplifiedText, setResultSimple] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoSource, setVideoSource] = useState("");
  const [_imagePath, setImagePath] = useState("")
  const [activeTab, setActiveTab] = useState<"simplify" | "search">("simplify");
  const [ragAnswer, setRagAnswer] = useState("");
  const [ragSources, setRagSources] = useState<SourceChunk[]>([]);
  const [isRagLoading, setIsRagLoading] = useState(false);
  const [ragError, setRagError] = useState("");
  const [selectedSource, setSelectedSource] = useState<SourceChunk | null>(null);

  const GROK_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
  const markdownToPlainText = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove ** for bold text
      .replace(/^\s*\*\s+/gm, '- ')    // Replace markdown bullets (*) with dashes (-)
      .replace(/(\s*- )/g, '\n$1')     // Add a newline before lines starting with a dash
      .replace(/(\n|^)(\d+\.\s)/g, '\n$2'); // Add a newline before numbered points
  };
  
  
  useEffect(() => {
    chrome.runtime.onMessage.addListener((message) => {
        if (message.url) {
          setImagePath(message.url);
          (async() => {
            setIsLoading(true);
            try {
              const response = await ollamaChat(
                `The user is looking at an image from this URL: ${message.url}. Explain what this image likely contains in simple terms as a teacher would do. Translate it into very basic English suitable for someone below B1 proficiency level. Only provide the answer without additional context or introductory phrases.`
              );
              setResultSimple(markdownToPlainText(response));
              (async() => {
                 await fetch(`http://localhost:8080/technology?text=${encodeURIComponent(response)}`, {method: 'POST'})

                 await fetch(`http://localhost:8080/recent-activity`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    "title":`${encodeURIComponent(response)}`
                  },
                  body: JSON.stringify({
                    userId: "565f4ee2-0729-450c-9bf5-5b382fe82ea6", 
                    conversationType:"IMAGE",
                    conversation: {
                      "prompt 1": message.url, 
                      "response 1": response, 
                    }
                  })
        });
                })()
              
             
            } catch (error) {
              console.error("Error:", error);
            }
            finally {
              setIsLoading(false);
            }
          })()
        }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id as number;

      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: () => {
            const title = window.getSelection()?.toString();
            return title;
          },
        },
        (injectionResults) => {
          if (chrome.runtime.lastError) {
            console.error("Script injection failed:", chrome.runtime.lastError.message);
            return;
          }

          if (injectionResults && injectionResults.length > 0) {
            const pageTitle = injectionResults[0].result as string;
            setResult(pageTitle);
          }
        }
      );
    });

    async function getOllamaChatCompletion() {
      setIsLoading(true);
      try {
        const response = await ollamaChat(
          `Explain the meaning of "${text}" in simple terms. Translate it into basic English suitable for someone below A2 proficiency level. Only provide the answer without additional context or introductory phrases.`
        );
        setResultSimple(response);
        await fetch(`http://localhost:8080/technology?text=${encodeURIComponent(text)}`, {
          method: 'POST',
        });

          await fetch(`http://localhost:8080/recent-activity`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             "title":`${encodeURIComponent(text)}`
           },
           body: JSON.stringify({
             userId: "565f4ee2-0729-450c-9bf5-5b382fe82ea6", 
             conversationType:"TEXT",
             conversation: {
               "prompt 1": text, 
               "response 1": response, 
             }
           })
 });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id as number;

      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: () => {
            const videos = window.document.getElementsByTagName("video");
            const videoElement = videos[0];
            const title = window.getSelection()?.toString();
            if (videoElement && (!title || title.length < 1)) {
              return { src: videoElement.src, duration: videoElement.duration, currentSrc: videoElement.currentSrc};
            }
            return null;
          },
        },
        (injectionResults) => {
          if (chrome.runtime.lastError) {
            console.error("Script injection failed:", chrome.runtime.lastError.message);
            return;
          }

          if (injectionResults && injectionResults.length > 0) {
            const videoData = injectionResults[0].result;
            if (videoData && text.length < 1) {
              setVideoDuration(videoData.duration);
              setVideoSource(videoData.currentSrc);
              console.log(videoSource);
              setShowModal(true);
            }
          }
        }
      );
    });

    async function performRagSearch() {
      setIsRagLoading(true);
      setRagError("");
      try {
        const result = await ragQuery(text);
        setRagAnswer(result.answer);
        setRagSources(result.sources ?? []);
      } catch (error) {
        console.error("RAG error:", error);
        setRagError("Failed to search documents. Is the backend running?");
      } finally {
        setIsRagLoading(false);
      }
    }

    if (text.trim().length > 3) {
      getOllamaChatCompletion();
      performRagSearch();
    }
  }, [text]);

  const handleConfirmTimestamps = (start: number, end: number) => {
    transcribeSelectedRange(start, end);
  };

  async function transcribeSelectedRange(startTime: number, endTime: number) {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id as number;
        chrome.scripting.executeScript(
          {
            target: { tabId },
            func: (startTime, endTime) => {
              const videoElement = document.getElementsByTagName("video")[0];

              if (videoElement) {
                videoElement.currentTime = startTime;
                videoElement.play();
                const checkTime = () => {
                  if (videoElement.currentTime >= endTime) {
                    videoElement.pause();
                    videoElement.removeEventListener("timeupdate", checkTime);
                  }
                };
                videoElement.addEventListener("timeupdate", checkTime);
              }
            },
            args: [startTime, endTime],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error("Script injection failed:", chrome.runtime.lastError.message);
            } else {
              captureTabAudio(startTime, endTime);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error accessing display media:", error);
    }
  }

  function captureTabAudio(startTime: number, endTime: number) {
    setIsLoading(true);
    chrome.tabCapture.capture({ audio: true }, (stream) => {
      if (chrome.runtime.lastError || !stream) {
        console.error("Failed to capture tab:", chrome.runtime.lastError);
        setIsLoading(false);
        return;
      }

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const destination = audioContext.createMediaStreamDestination();

      source.connect(destination);
      source.connect(audioContext.destination);

      const mediaRecorder = new MediaRecorder(destination.stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), (endTime - startTime) * 1000);
    });
  }

  async function transcribeAudio(audioBlob: Blob) {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.wav");
      formData.append("model", "whisper-large-v3");
      formData.append("prompt", "Specify context or spelling");
      formData.append("temperature", "0");
      formData.append("response_format", "json");

      const response = await fetch("https://api.groq.com/openai/v1/audio/translations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROK_API_KEY}`,
        },
        body: formData,
      });

      const transcriptionResult = await response.json();
      if (transcriptionResult.text) {
        const simplifiedResponse = await ollamaChat(
          `Explain the meaning of "${transcriptionResult.text}" in simple terms. Translate it into basic English suitable for someone below A2 proficiency level. Only provide the answer without additional context or introductory phrases. Note that its video transcription where accents can often be misleading try to be creative in case of any ambiguity. Feel free to correct mistakes in the transcription. For example technology names or any other jargon. Eliminate any unnecessary words like Here's an explanation and stuff.`
        );
        setResultSimple(simplifiedResponse);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

          const tabUrl = tabs[0].url as string;
          const match = tabUrl.match(/[?&]v=([^&]+)/);
          const videoId = match ? match[1] : null;

          (async() => {
            await fetch(`http://localhost:8080/technology?text=${encodeURIComponent(simplifiedResponse)}`, {method: 'POST'})

            await fetch(`http://localhost:8080/recent-activity`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  "title":`${transcriptionResult.text}`
                },
                body: JSON.stringify({
                  userId: "565f4ee2-0729-450c-9bf5-5b382fe82ea6",
                  conversationType:"VIDEO",
                  conversation: {
                    "prompt 1": `<iframe
                                  src="https://www.youtube.com/embed/${videoId}"
                                  width="560"
                                  height="315"
                                  frameborder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowfullscreen
                                ></iframe>`,
                    "response 1": simplifiedResponse,
                  }
                })
              });
            
          })()
        });

        
       
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-[500px] h-fit bg-background text-foreground">
      <Header />
      
      <main className="p-4 space-y-4">
        <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as "simplify" | "search")}>
          <Tabs.List className="flex border-b mb-4">
            <Tabs.Trigger
              value="simplify"
              className="flex-1 py-2 text-sm font-medium text-center transition-colors data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 text-muted-foreground hover:text-foreground"
            >
              Simplify
            </Tabs.Trigger>
            <Tabs.Trigger
              value="search"
              className="flex-1 py-2 text-sm font-medium text-center transition-colors data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 text-muted-foreground hover:text-foreground"
            >
              Search Documents
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="simplify">
            <Card className={cn(
              "transition-all duration-300",
              isLoading ? "opacity-50" : "opacity-100"
            )}>
              <CardContent className="pt-6">
                {simplifiedText ? (
                  <p className="text-[15px] leading-relaxed">{simplifiedText}</p>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Processing...</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Select text or a video segment to simplify
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="search">
            <Card className={cn(
              "transition-all duration-300",
              isRagLoading ? "opacity-50" : "opacity-100"
            )}>
              <CardContent className="pt-6">
                {isRagLoading ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Searching documents...</p>
                  </div>
                ) : ragError ? (
                  <p className="text-sm text-red-500">{ragError}</p>
                ) : ragAnswer ? (
                  <div className="space-y-4">
                    <p className="text-[15px] leading-relaxed">{ragAnswer}</p>
                    {ragSources.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sources</p>
                        <div className="flex flex-wrap gap-2">
                          {ragSources.map((source, i) => (
                            <SourceCard
                              key={`${source.documentId}-${i}`}
                              filename={source.filename}
                              score={source.score}
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
                      Select text to search your uploaded documents
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Tabs.Content>
        </Tabs.Root>
      </main>

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
        </DialogContent>
      </Dialog>

      {showModal && (
        <TimestampModal
          onConfirm={handleConfirmTimestamps}
          onClose={() => setShowModal(false)}
          videoDuration={videoDuration ?? 0}
        />
      )}
    </div>
  );
};

export default App;