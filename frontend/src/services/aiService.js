// AI Service for communication with backend AI endpoints
class AIService {
  constructor() {
    const isProduction = window.location.hostname === 'itsamisha.github.io';
    this.baseUrl = isProduction 
      ? 'https://fixpoint-ajtz.onrender.com'
      : (process.env.REACT_APP_API_URL || 'http://localhost:8080');
  }

  // Generate description from image
  async generateDescription(image, category = null) {
    try {
      const formData = new FormData();
      if (image instanceof File) {
        formData.append('image', image);
      }
      if (category) {
        formData.append('category', category);
      }

      const response = await fetch(`${this.baseUrl}/api/ai/analyze-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.description || 'Unable to generate description';
    } catch (error) {
      console.error('Error generating description:', error);
      throw error;
    }
  }

  // Enhanced image analysis with context
  async analyzeImageEnhanced(image, category, context = {}) {
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('category', category);
      
      // Add context information
      if (context.location) {
        formData.append('location', context.location);
      }
      if (context.description) {
        formData.append('existingDescription', context.description);
      }

      const response = await fetch(`${this.baseUrl}/api/ai/analyze-image-enhanced`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in enhanced image analysis:', error);
      throw error;
    }
  }

  // Translate text to Bengali
  async translateToBengali(text) {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('targetLanguage', 'bangla');

      const response = await fetch(`${this.baseUrl}/api/ai/translate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('Error translating text:', error);
      throw error;
    }
  }

  // Smart issue categorization
  async categorizeIssue(description, image = null, location = null) {
    try {
      const formData = new FormData();
      formData.append('description', description);
      
      if (image) {
        formData.append('image', image);
      }
      
      if (location) {
        formData.append('location', location);
      }

      const response = await fetch(`${this.baseUrl}/api/ai/categorize-issue`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Categorization response:', data);
      return data;
    } catch (error) {
      console.error('Error categorizing issue:', error);
      throw error;
    }
  }

  // Get AI capabilities
  async getCapabilities() {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/capabilities`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching AI capabilities:', error);
      return {
        imageAnalysis: false,
        translation: false,
        categorization: false,
        error: error.message
      };
    }
  }

  // Check if AI services are available
  async checkAvailability() {
    try {
      const capabilities = await this.getCapabilities();
      return {
        available: !capabilities.error,
        capabilities: capabilities
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }
}

export const aiService = new AIService();
export default aiService;
