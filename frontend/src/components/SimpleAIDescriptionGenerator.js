import React from 'react';
import { Sparkles, Languages, RotateCcw } from "lucide-react";

const SimpleAIDescriptionGenerator = ({
  selectedImage,
  isAnalyzing,
  onAnalyze,
  onTranslateToBangla,
  onTranslateToEnglish,
  onRestoreOriginal,
  isTranslating,
  currentDescription,
  originalDescription
}) => {
  if (!selectedImage) return null;

  return (
    <div className="simple-ai-tools">
      {/* AI Generate Button */}
      <div className="ai-generate-section">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="btn btn-ai"
        >
          <Sparkles size={20} className="mr-2" />
          {isAnalyzing ? "Analyzing & Auto-Applying..." : "🤖 Generate AI Description"}
        </button>
        <p className="ai-help-text">
          AI will analyze your image and automatically fill the description, category, and priority
        </p>
      </div>

      {/* Translation Tools */}
      {currentDescription && (
        <div className="translation-tools-simple">
          <div className="translation-header">
            <Languages size={16} />
            <span>Translation Options</span>
          </div>
          <div className="translation-buttons">
            <button
              type="button"
              onClick={onTranslateToBangla}
              disabled={isTranslating}
              className="btn btn-translation btn-sm"
            >
              {isTranslating ? "Translating..." : "🇧🇩 বাংলায় অনুবাদ"}
            </button>
            <button
              type="button"
              onClick={onTranslateToEnglish}
              disabled={isTranslating}
              className="btn btn-translation btn-sm"
            >
              {isTranslating ? "Translating..." : "🇺🇸 Translate to English"}
            </button>
            {originalDescription && (
              <button
                type="button"
                onClick={onRestoreOriginal}
                className="btn btn-restore btn-sm"
              >
                <RotateCcw size={14} />
                Restore Original
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleAIDescriptionGenerator;
