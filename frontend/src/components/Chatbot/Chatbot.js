import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";
import chatbotService from "../../services/chatbotService";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm FixPoint AI - your practical assistant. I provide direct, step-by-step help for civic reporting, education, career guidance, technology support, and everyday problems. Ask me specific questions and I'll give you clear, actionable answers!",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [aiCapabilities, setAiCapabilities] = useState({
    available: false,
    aiEnabled: false,
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check chatbot service status on mount
  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const status = await chatbotService.getStatus();
      setAiCapabilities(status);
      setIsOnline(status.available);
    } catch (error) {
      console.warn("Could not check chatbot status:", error);
      setIsOnline(false);
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const addMessage = (text, isBot = false) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      text,
      isBot,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message immediately
    addMessage(userMessage, false);
    setIsLoading(true);

    try {
      // Create context for the AI
      const context = JSON.stringify({
        timestamp: new Date().toISOString(),
        platform: "FixPoint Web App",
        previousMessages: messages.slice(-3), // Last 3 messages for context
        userQuery: userMessage,
      });

      const response = await chatbotService.sendMessage(userMessage, context);

      if (response.success) {
        addMessage(response.response, true);
      } else {
        addMessage(
          "I apologize, but I'm having trouble processing your request right now. Please try again or contact support if the issue persists.",
          true
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      let errorMessage = "I'm currently experiencing technical difficulties. ";

      if (error.message.includes("Authentication")) {
        errorMessage += "Please make sure you're logged in and try again.";
      } else if (error.message.includes("Server error")) {
        errorMessage +=
          "Our AI service is temporarily unavailable. I'll try to help with basic information.";
      } else {
        errorMessage += "Please try again in a moment.";
      }

      addMessage(errorMessage, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getQuickActions = () => [
    {
      text: "📝 How to report an issue",
      action: () => {
        addMessage("📝 How to report an issue", false);
        addMessage(
          `
🚀 **Reporting Civic Issues - Step by Step Guide:**

**1. 📍 Location First**
• Use GPS or manually enter your address
• Be as specific as possible (street name, landmarks)

**2. 🎯 Choose Category**
• Infrastructure: Roads, bridges, utilities
• Environment: Waste, pollution, drainage
• Safety: Lighting, traffic, security
• Healthcare: Medical facilities, sanitation
• Education: Schools, libraries
• Transportation: Public transport issues

**3. 📝 Write Clear Description**
• What exactly is the problem?
• When did you notice it?
• How does it affect you/community?

**4. 📸 Add Photos**
• Multiple angles if possible
• Show the full context
• Include reference objects for scale

**5. 🎯 Set Priority**
• Critical: Safety hazards, emergencies
• High: Affects many people daily
• Medium: Important but not urgent
• Low: Minor improvements

**6. ✅ Submit & Track**
• Get your issue ID for tracking
• Share with neighbors for support
• Follow up on progress

Need help with any specific step? Just ask! 🤝
        `,
          true
        );
      },
    },
    {
      text: "🎯 Help with categories",
      action: () => {
        addMessage("🎯 Help with categories", false);
        addMessage(
          `
🗂️ **FixPoint Categories - Choose the Right One:**

**🏗️ Infrastructure**
• Roads, potholes, sidewalks
• Bridges, overpasses
• Water pipes, gas lines
• Buildings, construction issues

**🌱 Environment**
• Garbage collection
• Water pollution, drainage
• Air quality, noise pollution
• Parks, green spaces

**🚨 Safety**
• Street lighting
• Traffic signals, signs
• Crime, security concerns
• Fire safety, emergency access

**🏥 Healthcare**
• Hospital services
• Public health facilities
• Sanitation, hygiene
• Disease prevention

**🎓 Education**
• School facilities
• Libraries, study spaces
• Educational programs
• Student safety

**🚌 Transportation**
• Bus stops, routes
• Road conditions
• Traffic management
• Parking issues

**🏛️ Government**
• Public services
• Official procedures
• Permits, documentation

**👥 Social**
• Community programs
• Cultural events
• Social welfare

**❓ Other**
• Everything else

Still unsure? Describe your issue and I'll suggest the best category! 🎯
        `,
          true
        );
      },
    },
    {
      text: "� Career & Job Help",
      action: () => {
        addMessage("� Career & Job Help", false);
        addMessage(
          `
� **Career Development & Job Search Support:**

**� Resume & CV Assistance**
• Professional formatting tips
• Content optimization strategies
• Skills highlighting techniques
• Industry-specific customization

**🎯 Interview Preparation**
• Common questions and answers
• Behavioral interview techniques
• Technical interview prep
• Confidence building tips

**💡 Job Search Strategies**
• Where to find opportunities
• Network building techniques
• Application best practices
• Follow-up strategies

**� Career Planning**
• Skill development paths
• Industry trend analysis
• Education and certification guidance
• Goal setting and achievement

**🇧🇩 Bangladesh Job Market**
• Local industry insights
• Salary expectations
• Professional networking tips
• Government job opportunities

What specific career challenge can I help you with today? 💪
        `,
          true
        );
      },
    },
    {
      text: "🎓 Study & Learning Help",
      action: () => {
        addMessage("🎓 Study & Learning Help", false);
        addMessage(
          `
📚 **Educational Support & Learning Assistance:**

**� Study Strategies**
• Effective note-taking methods
• Memory and retention techniques
• Time management for students
• Exam preparation strategies

**📖 Subject Help**
• Math and science concepts
• Language and literature guidance
• History and social studies
• Technical subjects support

**� Research Assistance**
• Information gathering techniques
• Source evaluation and citations
• Project planning and organization
• Presentation skills

**💻 Digital Learning**
• Online course recommendations
• Educational technology tools
• Skill development platforms
• Certificate programs

**🎯 Academic Planning**
• Course selection guidance
• University application help
• Scholarship opportunities
• Career pathway planning

**🇧🇩 Bangladesh Education**
• Local educational institutions
• Government programs and schemes
• Skill development initiatives
• Professional training opportunities

What subject or learning goal would you like help with? 🤓
        `,
          true
        );
      },
    },
    {
      text: "💻 Tech Support",
      action: () => {
        addMessage("💻 Tech Support", false);
        addMessage(
          `
🛠️ **Technology Help & Digital Solutions:**

**� Computer Issues**
• Hardware troubleshooting
• Software installation and setup
• Performance optimization
• Virus and security protection

**📱 Mobile & Apps**
• Smartphone problems
• App recommendations and usage
• Settings and configuration
• Data management and backup

**🌐 Internet & Connectivity**
• Wi-Fi and network issues
• Browser problems and optimization
• Online safety and privacy
• Digital communication tools

**� Digital Skills**
• Computer literacy basics
• Office software training
• Email and social media guidance
• Online banking and e-commerce

**� Specific Software**
• Microsoft Office suite
• Google Workspace tools
• Design and creativity apps
• Programming and development

**🇧🇩 Local Tech Services**
• ISP recommendations
• Computer repair services
• Software availability in Bangladesh
• Government digital services

What tech challenge can I help you solve today? 🔧
        `,
          true
        );
      },
    },
    {
      text: "🌍 Ask Me Anything",
      action: () => {
        addMessage("🌍 Ask me anything!", false);
        addMessage(
          `
🤖 **I'm Here for All Your Questions!**

Beyond civic issues, I can help with:

**📚 Education & Learning**
• Study tips, homework help, research guidance
• Subject explanations and concept clarification
• University and course recommendations

**💼 Career & Professional**
• Job search strategies, resume writing
• Interview preparation, skill development
• Business and entrepreneurship advice

**💰 Financial & Legal**
• Budgeting and savings tips
• Investment basics and financial planning
• General legal information and rights

**🏥 Health & Wellness**
• General health information and wellness tips
• Stress management and mental health resources
• Fitness and lifestyle guidance

**🔧 Technology & Digital**
• Computer and software troubleshooting
• App recommendations and digital literacy
• Online safety and privacy tips

**🇧🇩 Bangladesh-Specific**
• Government services and procedures
• Cultural information and local resources
• Travel and transportation guidance

**🌱 Personal Development**
• Goal setting and motivation
• Time management and productivity
• Habit formation and self-improvement

Just ask me anything - I'm here to help! What's on your mind? �
        `,
          true
        );
      },
    },
  ];

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div
        className={`chatbot-toggle ${isOpen ? "open" : ""}`}
        onClick={toggleChatbot}
        title="FixPoint AI Assistant - Direct Help for Civic Issues, Education, Career & Technology"
      >
        {isOpen ? "✕" : "�"}
        {!isOnline && <div className="offline-indicator">!</div>}
        <div className="chatbot-label">AI Intelligence</div>
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <h3>� FixPoint AI Intelligence</h3>
              <div className="chatbot-status">
                <span
                  className={`status-indicator ${
                    isOnline ? "online" : "offline"
                  }`}
                ></span>
                {isOnline
                  ? aiCapabilities.aiEnabled
                    ? "Advanced AI Active"
                    : "Smart Mode"
                  : "Offline"}
              </div>
            </div>
            <button className="chatbot-close" onClick={toggleChatbot}>
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isBot ? "bot" : "user"}`}
              >
                <div className="message-content">
                  <div className="message-text">
                    {message.text.split("\n").map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < message.text.split("\n").length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="message-timestamp">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && !isLoading && (
            <div className="quick-actions">
              <h4>🚀 Quick Help:</h4>
              <div className="quick-actions-grid">
                {getQuickActions().map((action, index) => (
                  <button
                    key={index}
                    className="quick-action-btn"
                    onClick={action.action}
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <div className="input-container">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isOnline
                    ? "Ask me a specific question - I'll give you direct, step-by-step help..."
                    : "Chatbot is offline"
                }
                className="chatbot-input"
                rows="1"
                disabled={!isOnline || isLoading}
              />
              <button
                type="submit"
                className="send-button"
                disabled={!inputMessage.trim() || !isOnline || isLoading}
              >
                {isLoading ? "⏳" : "📤"}
              </button>
            </div>
          </form>

          {!isOnline && (
            <div className="offline-notice">
              ⚠️ Chatbot service is currently offline. Please try again later.
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;
