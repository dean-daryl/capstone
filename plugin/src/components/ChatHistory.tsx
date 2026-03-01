import React from "react";
import { MessageSquare, ChevronDown, ChevronRight } from "lucide-react";

interface QueryHistoryItem {
  id: string;
  text: string;
  response: string;
  source: string;
  createdAt: string;
}

interface ChatHistoryProps {
  history: QueryHistoryItem[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ history }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        No previous queries
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1">
      {history.map((item) => {
        const isExpanded = expandedId === item.id;
        return (
          <div key={item.id} className="border rounded-md">
            <button
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-purple-600" />
              <span className="text-xs leading-snug flex-1 truncate">
                {item.text}
              </span>
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
              )}
            </button>
            {isExpanded && (
              <div className="px-3 pb-2 text-xs text-muted-foreground leading-relaxed border-t bg-muted/30">
                <p className="pt-2 whitespace-pre-wrap">{item.response}</p>
                <p className="mt-1 text-[10px] opacity-60">
                  {new Date(item.createdAt).toLocaleDateString()} via {item.source}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
