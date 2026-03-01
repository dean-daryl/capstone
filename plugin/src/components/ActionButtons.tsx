import React from "react";
import { Loader2, Languages, Sparkles } from "lucide-react";

interface ActionButtonsProps {
  onTranslate: () => void;
  onSimplify: () => void;
  isTranslating: boolean;
  isSimplifying: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onTranslate,
  onSimplify,
  isTranslating,
  isSimplifying,
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onTranslate}
        disabled={isTranslating}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors"
      >
        {isTranslating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Languages className="w-3.5 h-3.5" />
        )}
        Translate to Kinyarwanda
      </button>
      <button
        onClick={onSimplify}
        disabled={isSimplifying}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors"
      >
        {isSimplifying ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        Simplify
      </button>
    </div>
  );
};
