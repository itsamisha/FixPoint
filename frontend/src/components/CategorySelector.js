import React, { useState, useEffect } from 'react';
import { categorizationService, ISSUE_CATEGORIES } from '../services/categorizationService';
import { Zap, AlertTriangle, CheckCircle, Info, Loader } from 'lucide-react';
import './CategorySelector.css';

const CategorySelector = ({ 
  description = '', 
  imageFile = null, 
  location = null,
  selectedCategory = null,
  selectedPriority = null,
  onCategoryChange = () => {},
  onPriorityChange = () => {},
  autoAnalyze = true
}) => {
  const [categorization, setCategorization] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Auto-analyze when description changes
  useEffect(() => {
    if (autoAnalyze && description && description.length > 10) {
      analyzeIssue();
    }
  }, [description, imageFile, location, autoAnalyze]);

  const analyzeIssue = async () => {
    if (!description || description.length < 5) return;

    setIsAnalyzing(true);
    try {
      const result = await categorizationService.categorizeIssue(description, imageFile, location);
      setCategorization(result);
      
      // Always auto-apply AI suggestions
      if (result.category && onCategoryChange) {
        onCategoryChange(result.category);
      }
      if (result.priority && onPriorityChange) {
        onPriorityChange(result.priority.value);
      }
    } catch (error) {
      console.error('Error analyzing issue:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCategorySelect = (category) => {
    onCategoryChange(category);
    setCategorization(prev => prev ? { ...prev, category } : null);
  };

  const handlePrioritySelect = (priority) => {
    onPriorityChange(priority);
    setCategorization(prev => prev ? { 
      ...prev, 
      priority: { value: priority, color: getPriorityColor(priority) }
    } : null);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B', 
      high: '#EF4444',
      urgent: '#DC2626'
    };
    return colors[priority] || '#6B7280';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: <Info size={16} />,
      medium: <AlertTriangle size={16} />,
      high: <AlertTriangle size={16} />,
      urgent: <Zap size={16} />
    };
    return icons[priority] || <Info size={16} />;
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    if (confidence >= 0.4) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#10B981';
    if (confidence >= 0.6) return '#F59E0B';
    if (confidence >= 0.4) return '#EF4444';
    return '#6B7280';
  };

  return (
    <div className="category-selector">
      {/* Modern Header with Gradient */}
      <div className="category-header">
        <div className="header-content">
          <div className="header-icon">
            <Zap size={24} />
          </div>
          <div className="header-text">
            <h3 className="header-title">Smart Issue Categorization</h3>
            <p className="header-subtitle">AI-powered analysis for accurate categorization</p>
          </div>
        </div>
        <button
          onClick={analyzeIssue}
          disabled={isAnalyzing || !description}
          className={`analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
        >
          {isAnalyzing ? (
            <>
              <Loader size={16} className="animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Zap size={16} />
              <span>Analyze</span>
            </>
          )}
        </button>
      </div>

      {/* AI Analysis Results with Enhanced Design */}
      {categorization && (
        <div className="ai-analysis-result">
          <div className="analysis-header">
            <div className="analysis-status">
              <CheckCircle size={20} className="text-emerald-500" />
              <span className="status-text">AI Analysis Complete</span>
            </div>
            <div 
              className="confidence-badge"
              style={{ backgroundColor: getConfidenceColor(categorization.confidence) }}
            >
              {getConfidenceText(categorization.confidence)}
            </div>
          </div>

          {/* Enhanced Suggested Category and Priority */}
          <div className="suggestions-grid">
            {/* Suggested Category Card */}
            <div className="suggestion-card category-card">
              <div className="card-header">
                <span className="card-label">Suggested Category</span>
              </div>
              <div 
                className="suggestion-content selected-suggestion"
                style={{ 
                  borderColor: categorization.category.color,
                  backgroundColor: `${categorization.category.color}15`
                }}
                onClick={() => handleCategorySelect(categorization.category)}
              >
                <div className="suggestion-icon" style={{ color: categorization.category.color }}>
                  {categorization.category.icon}
                </div>
                <div className="suggestion-details">
                  <div className="suggestion-name">{categorization.category.name}</div>
                  <div className="suggestion-desc">{categorization.category.description}</div>
                </div>
                <div className="selection-indicator">
                  <CheckCircle size={18} style={{ color: categorization.category.color }} />
                </div>
              </div>
            </div>

            {/* Suggested Priority Card */}
            <div className="suggestion-card priority-card">
              <div className="card-header">
                <span className="card-label">Suggested Priority</span>
              </div>
              <div 
                className="suggestion-content selected-suggestion"
                style={{ 
                  borderColor: categorization.priority.color,
                  backgroundColor: `${categorization.priority.color}15`
                }}
                onClick={() => handlePrioritySelect(categorization.priority.value)}
              >
                <div className="suggestion-icon" style={{ color: categorization.priority.color }}>
                  {getPriorityIcon(categorization.priority.value)}
                </div>
                <div className="suggestion-details">
                  <div className="suggestion-name capitalize">{categorization.priority.value}</div>
                  <div className="suggestion-desc">Priority Level</div>
                </div>
                <div className="selection-indicator">
                  <CheckCircle size={18} style={{ color: categorization.priority.color }} />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tags Section */}
          {categorization.suggestedTags.length > 0 && (
            <div className="tags-section">
              <label className="section-label">Detected Keywords:</label>
              <div className="tags-container">
                {categorization.suggestedTags.map((tag, index) => (
                  <span key={index} className="tag-chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Reasoning */}
          <div className="reasoning-section">
            <div className="reasoning-content">
              <Info size={14} className="reasoning-icon" />
              <span className="reasoning-text">{categorization.reasoning}</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Manual Category Selection */}
      <div className="manual-selection">
        <div className="section-header">
          <h4 className="section-title">
            {categorization ? '🎯 Override Category' : '📋 Select Category'}
          </h4>
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="toggle-btn"
          >
            {showAllCategories ? 'Show Less' : 'Show All Categories'}
          </button>
        </div>

        <div className="categories-grid">
          {Object.values(ISSUE_CATEGORIES)
            .slice(0, showAllCategories ? undefined : 6)
            .map((category) => (
              <div
                key={category.id}
                className={`category-option ${(selectedCategory?.id === category.id || categorization?.category?.id === category.id) ? 'selected' : ''}`}
                style={{ 
                  '--category-color': category.color,
                  borderColor: (selectedCategory?.id === category.id || categorization?.category?.id === category.id) ? category.color : undefined,
                  backgroundColor: (selectedCategory?.id === category.id || categorization?.category?.id === category.id) ? `${category.color}10` : undefined
                }}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="category-icon" style={{ color: category.color }}>
                  {category.icon}
                </div>
                <div className="category-info">
                  <div className="category-name">{category.name}</div>
                  <div className="category-desc">{category.description}</div>
                </div>
                {selectedCategory?.id === category.id && (
                  <div className="selected-indicator">
                    <CheckCircle size={16} style={{ color: category.color }} />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Enhanced Priority Selection */}
      <div className="priority-selection">
        <h4 className="section-title">⚡ Priority Level</h4>
        <div className="priority-grid">
          {['low', 'medium', 'high', 'urgent'].map((priority) => (
            <button
              key={priority}
              onClick={() => handlePrioritySelect(priority)}
              className={`priority-option ${(categorization?.priority.value === priority || selectedPriority === priority) ? 'selected' : ''}`}
              style={{ 
                '--priority-color': getPriorityColor(priority),
                borderColor: (categorization?.priority.value === priority || selectedPriority === priority) ? getPriorityColor(priority) : undefined,
                backgroundColor: (categorization?.priority.value === priority || selectedPriority === priority) ? `${getPriorityColor(priority)}15` : undefined
              }}
            >
              <div className="priority-icon" style={{ color: getPriorityColor(priority) }}>
                {getPriorityIcon(priority)}
              </div>
              <span className="priority-name">{priority}</span>
              {(categorization?.priority.value === priority || selectedPriority === priority) && (
                <CheckCircle size={14} style={{ color: getPriorityColor(priority) }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Help Section */}
      <div className="help-section">
        <div className="help-content">
          <div className="help-icon">💡</div>
          <div className="help-text">
            <strong>Smart Tip:</strong> Our AI analyzes your description, image, and location to suggest the most appropriate category and priority. You can always override these suggestions manually for complete control.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
