import React from "react";
import { FileText, ExternalLink } from "lucide-react";

interface SourceCardProps {
  filename: string;
  score: number;
  documentUrl?: string;
  onClick: () => void;
}

export const SourceCard: React.FC<SourceCardProps> = ({ filename, score, documentUrl, onClick }) => {
  const percentage = Math.round(score * 100);

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
      <FileText className="w-3 h-3 flex-shrink-0" />
      <span className="truncate max-w-[100px]">{filename}</span>
      <span className="text-purple-500">{percentage}%</span>
      {documentUrl && (
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="flex-shrink-0 text-purple-600 hover:text-purple-800"
          title="Open document"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};
