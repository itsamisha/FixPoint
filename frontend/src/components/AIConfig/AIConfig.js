import React, { useState, useEffect } from 'react';
import './AIConfig.css';

const AIConfig = () => {
  const [config, setConfig] = useState({
    geminiApiKey: '',
    openaiApiKey: '',
    aiProvider: 'gemini'
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    // Check if AI is already configured
    checkAIConfiguration();
  }, []);

  const checkAIConfiguration = async () => {
    try {
      const response = await fetch('/api/ai/capabilities');
      if (response.ok) {
        const data = await response.json();
        setIsConfigured(data.imageAnalysis || data.chatResponse);
      }
    } catch (error) {
      console.warn('Could not check AI configuration:', error);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const response = await fetch('/api/ai/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setIsConfigured(true);
        setShowConfig(false);
        alert('AI configuration saved successfully!');
      } else {
        alert('Failed to save AI configuration');
      }
    } catch (error) {
      console.error('Error saving AI configuration:', error);
      alert('Error saving AI configuration');
    }
  };

  return (
    <div className="ai-config-container">
      <div className="ai-status">
        <span className={`ai-indicator ${isConfigured ? 'configured' : 'not-configured'}`}>
          🤖 AI {isConfigured ? 'Enhanced' : 'Basic Mode'}
        </span>
        <button 
          className="config-button"
          onClick={() => setShowConfig(!showConfig)}
        >
          ⚙️ Configure AI
        </button>
      </div>

      {showConfig && (
        <div className="ai-config-modal">
          <div className="ai-config-content">
            <h3>🚀 AI Configuration - Unlock Full Potential!</h3>
            
            <div className="ai-benefits">
              <h4>✨ What You'll Get with AI:</h4>
              <ul>
                <li>🤖 <strong>Smart Chatbot Responses</strong> - Detailed, contextual help</li>
                <li>📸 <strong>Automatic Image Descriptions</strong> - AI analyzes your photos</li>
                <li>🎯 <strong>Smart Categorization</strong> - Issues auto-categorized perfectly</li>
                <li>🌍 <strong>Bengali Translation</strong> - Automatic language support</li>
              </ul>
            </div>

            <div className="ai-provider-selection">
              <h4>🔧 Choose Your AI Provider:</h4>
              
              <div className="provider-option">
                <label>
                  <input
                    type="radio"
                    name="aiProvider"
                    value="gemini"
                    checked={config.aiProvider === 'gemini'}
                    onChange={(e) => setConfig({...config, aiProvider: e.target.value})}
                  />
                  <strong>🟢 Google Gemini (Recommended - FREE)</strong>
                </label>
                <div className="provider-details">
                  <p>✅ Free tier: 15 requests/minute, 1500 requests/day</p>
                  <p>✅ No billing required for basic usage</p>
                  <p>✅ Latest AI technology with vision capabilities</p>
                  <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                    Get Free Gemini API Key →
                  </a>
                </div>
                {config.aiProvider === 'gemini' && (
                  <input
                    type="password"
                    placeholder="Enter Gemini API Key"
                    value={config.geminiApiKey}
                    onChange={(e) => setConfig({...config, geminiApiKey: e.target.value})}
                    className="api-key-input"
                  />
                )}
              </div>

              <div className="provider-option">
                <label>
                  <input
                    type="radio"
                    name="aiProvider"
                    value="openai"
                    checked={config.aiProvider === 'openai'}
                    onChange={(e) => setConfig({...config, aiProvider: e.target.value})}
                  />
                  <strong>🔵 OpenAI (Paid)</strong>
                </label>
                <div className="provider-details">
                  <p>⚠️ Paid service with usage quotas</p>
                  <p>✅ High quality responses</p>
                  <p>⚠️ Can exceed quota (as you may have experienced)</p>
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                    Get OpenAI API Key →
                  </a>
                </div>
                {config.aiProvider === 'openai' && (
                  <input
                    type="password"
                    placeholder="Enter OpenAI API Key"
                    value={config.openaiApiKey}
                    onChange={(e) => setConfig({...config, openaiApiKey: e.target.value})}
                    className="api-key-input"
                  />
                )}
              </div>
            </div>

            <div className="config-actions">
              <button 
                className="save-config-btn"
                onClick={handleSaveConfig}
                disabled={!config.geminiApiKey && !config.openaiApiKey}
              >
                💾 Save AI Configuration
              </button>
              <button 
                className="cancel-config-btn"
                onClick={() => setShowConfig(false)}
              >
                ❌ Cancel
              </button>
            </div>

            <div className="fallback-notice">
              <p>💡 <strong>Don't have an API key?</strong> No worries! The system will still work with smart fallback responses that are specifically designed for civic engagement.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConfig;
