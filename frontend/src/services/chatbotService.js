class ChatbotService {
  constructor() {
    this.baseURL = 'http://localhost:8080/api/public';
  }

  async sendMessage(message, context = '') {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Sending message with token:', token ? 'Token present' : 'No token');
      
      const response = await fetch(`${this.baseURL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          message: message,
          context: context || JSON.stringify({
            timestamp: new Date().toISOString(),
            platform: 'FixPoint Web App',
            userQuery: message
          })
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 500) {
          throw new Error('Server error. The chatbot service may be temporarily unavailable.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      return {
        success: true,
        response: data.response || data.message || 'I received your message!',
        responseTime: data.responseTime
      };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  async getChatHistory(limit = 10) {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${this.baseURL}/chatbot/history?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        console.warn('Could not load chat history:', response.status);
        return { success: false, conversations: [] };
      }

      const data = await response.json();
      return {
        success: true,
        conversations: data.conversations || data || []
      };
    } catch (error) {
      console.warn('Error loading chat history:', error);
      return { success: false, conversations: [] };
    }
  }

  async getStatus() {
    try {
      const response = await fetch(`${this.baseURL}/chatbot/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { available: false, error: 'Service unavailable' };
      }

      const data = await response.json();
      return {
        available: data.available !== false,
        aiEnabled: data.aiEnabled || false,
        version: data.version || '1.0'
      };
    } catch (error) {
      console.warn('Could not check chatbot status:', error);
      return { available: false, error: error.message };
    }
  }
}

export default new ChatbotService();
