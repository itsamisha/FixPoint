import React from 'react';
import { Sparkles, Edit3, MapPin, Calendar, Tag, AlertTriangle } from "lucide-react";

const EnhancedAIDescriptionGenerator = ({
  selectedImage,
  isAnalyzingImage,
  aiGeneratedDescription,
  showAiDescription,
  onAnalyze,
  useAIDescription: applyAIDescription, // Rename to avoid ESLint hook rules
  editAIDescription,
  onTranslateToBangla,
  onTranslateToEnglish,
  onRestoreOriginal,
  isTranslating,
  currentDescription,
  originalDescription,
  formData, // New prop to get form data
  locationAddress,
  selectedLocation
}) => {
  if (!selectedImage) return null;

  // Handler to apply AI description
  const handleUseAIDescription = () => {
    const formattedDescription = formatAIDescription(aiGeneratedDescription);
    applyAIDescription(formattedDescription);
  };

  // Enhanced AI analysis with location and form context
  const analyzeWithLocationContext = () => {
    const contextData = {
      location: locationAddress || (selectedLocation ? `${selectedLocation.lat}, ${selectedLocation.lng}` : ''),
      category: formData?.category || '',
      priority: formData?.priority || '',
      title: formData?.title || '',
      coordinates: selectedLocation ? `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}` : ''
    };
    
    onAnalyze(contextData);
  };

  // Format the AI description with better organization
  const formatAIDescription = (description) => {
    if (!description) return description;
    
    // Add location context if available
    let formattedDescription = description;
    
    if (locationAddress && !description.toLowerCase().includes(locationAddress.toLowerCase())) {
      formattedDescription = `Location: ${locationAddress}\n\n${description}`;
    }
    
    return formattedDescription;
  };

  return (
    <>
      {/* AI Generate Button with Enhanced Context */}
      <div className="ai-generate-section enhanced">
        <button
          type="button"
          onClick={analyzeWithLocationContext}
          disabled={isAnalyzingImage}
          className="btn btn-ai enhanced"
        >
          <Sparkles size={20} className="mr-2" />
          {isAnalyzingImage ? "Analyzing with Location Context..." : "Generate Smart AI Description"}
        </button>
        
        <div className="ai-help-enhanced">
          <p className="ai-help-text">
            AI will analyze your image and create a professional description using:
          </p>
          <div className="context-items">
            {locationAddress && (
              <div className="context-item">
                <MapPin size={14} />
                <span>Location: {locationAddress}</span>
              </div>
            )}
            {formData?.category && (
              <div className="context-item">
                <Tag size={14} />
                <span>Category: {formData.category.replace('_', ' ')}</span>
              </div>
            )}
            {formData?.priority && (
              <div className="context-item">
                <AlertTriangle size={14} />
                <span>Priority: {formData.priority}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Translation Tools for Any Description */}
      {(onTranslateToBangla || onTranslateToEnglish || onRestoreOriginal) && currentDescription && (
        <div className="translation-tools">
          <div className="translation-tools-header">
            <span>🌐 Description Translation</span>
          </div>
          <div className="translation-buttons">
            {onTranslateToBangla && (
              <button
                type="button"
                onClick={onTranslateToBangla}
                disabled={isTranslating}
                className="btn btn-translation btn-sm"
              >
                {isTranslating ? "Translating..." : "বাংলায় অনুবাদ করুন"}
              </button>
            )}
            {onTranslateToEnglish && (
              <button
                type="button"
                onClick={onTranslateToEnglish}
                disabled={isTranslating}
                className="btn btn-translation btn-sm"
              >
                {isTranslating ? "Translating..." : "Translate to English"}
              </button>
            )}
            {onRestoreOriginal && originalDescription && (
              <button
                type="button"
                onClick={onRestoreOriginal}
                className="btn btn-restore btn-sm"
              >
                🔄 Restore Original
              </button>
            )}
          </div>
        </div>
      )}

      {/* Enhanced AI Generated Description Preview */}
      {showAiDescription && aiGeneratedDescription && (
        <div className="ai-description-preview enhanced">
          <div className="ai-badge enhanced">
            <Sparkles size={16} />
            AI Generated Smart Description
          </div>
          
          {/* Context Information */}
          <div className="ai-context-info">
            <h4>Generated using:</h4>
            <div className="context-grid">
              {locationAddress && (
                <div className="context-detail">
                  <MapPin size={12} />
                  <span>{locationAddress}</span>
                </div>
              )}
              {selectedLocation && (
                <div className="context-detail">
                  <Calendar size={12} />
                  <span>Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</span>
                </div>
              )}
              {formData?.category && (
                <div className="context-detail">
                  <Tag size={12} />
                  <span>{formData.category.replace('_', ' ')}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* AI Description Content */}
          <div className="ai-description-content enhanced">
            {formatAIDescription(aiGeneratedDescription)}
          </div>
          
          {/* Translation Section */}
          {(onTranslateToBangla || onTranslateToEnglish || onRestoreOriginal) && (
            <div className="translation-section">
              <div className="translation-header">
                <span>🌐 Language Options</span>
              </div>
              <div className="translation-buttons">
                {onTranslateToBangla && (
                  <button
                    type="button"
                    onClick={onTranslateToBangla}
                    disabled={isTranslating}
                    className="btn btn-translation btn-sm"
                  >
                    {isTranslating ? "Translating..." : "বাংলায় অনুবাদ করুন"}
                  </button>
                )}
                {onTranslateToEnglish && (
                  <button
                    type="button"
                    onClick={onTranslateToEnglish}
                    disabled={isTranslating}
                    className="btn btn-translation btn-sm"
                  >
                    {isTranslating ? "Translating..." : "Translate to English"}
                  </button>
                )}
                {onRestoreOriginal && originalDescription && (
                  <button
                    type="button"
                    onClick={onRestoreOriginal}
                    className="btn btn-restore btn-sm"
                  >
                    Restore Original
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Enhanced Actions */}
          <div className="ai-description-actions enhanced">
            <button
              type="button"
              onClick={handleUseAIDescription}
              className="btn btn-primary btn-sm"
            >
              <Sparkles size={14} />
              Use Smart Description
            </button>
            <button
              type="button"
              onClick={() => editAIDescription(formatAIDescription(aiGeneratedDescription))}
              className="btn btn-secondary btn-sm"
            >
              <Edit3 size={14} />
              Edit & Customize
            </button>
          </div>
          
          {/* Tips for better descriptions */}
          <div className="ai-tips">
            <p><strong>💡 Pro Tip:</strong> The AI has analyzed your image along with location and category context to create a comprehensive description. You can edit it to add more specific details!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedAIDescriptionGenerator;
