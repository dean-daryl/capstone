import React from "react";
import { FileText } from "lucide-react";

interface SourceCardProps {
  filename: string;
  score: number;
  onClick: () => void;
}

export const SourceCard: React.FC<SourceCardProps> = ({ filename, score, onClick }) => {
  const percentage = Math.round(score * 100);

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors cursor-pointer border border-purple-200"
    >
      <FileText className="w-3 h-3" />
      <span className="truncate max-w-[120px]">{filename}</span>
      <span className="text-purple-500">{percentage}%</span>
    </button>
  );
};
