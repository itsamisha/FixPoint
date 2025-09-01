import React from 'react';
import { Sparkles, Edit3 } from "lucide-react";

const AIDescriptionGenerator = ({
  selectedImage,
  isAnalyzingImage,
  aiGeneratedDescription,
  showAiDescription,
  onAnalyze,
  useAIDescription,
  editAIDescription
}) => {
  if (!selectedImage) return null;

  return (
    <>
      {/* AI Generate Button */}
      <div className="ai-generate-section">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzingImage}
          className="btn btn-ai"
        >
          <Sparkles size={20} className="mr-2" />
          {isAnalyzingImage ? "Analyzing Image..." : "Generate AI Description"}
        </button>
        <p className="ai-help-text">
          Let AI analyze your image and generate a professional description
        </p>
      </div>

      {/* AI Generated Description Preview */}
      {showAiDescription && aiGeneratedDescription && (
        <div className="ai-description-preview">
          <div className="ai-badge">
            <Sparkles size={16} />
            AI Generated Description
          </div>
          <div className="ai-description-content">
            {aiGeneratedDescription}
          </div>
          <div className="ai-description-actions">
            <button
              type="button"
              onClick={useAIDescription}
              className="btn btn-primary btn-sm"
            >
              Use This Description
            </button>
            <button
              type="button"
              onClick={editAIDescription}
              className="btn btn-secondary btn-sm"
            >
              <Edit3 size={16} className="mr-1" />
              Edit & Use
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIDescriptionGenerator;
