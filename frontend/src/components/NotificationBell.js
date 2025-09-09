import React, { useState, useEffect, useCallback } from 'react';
import NotificationCenter from './NotificationCenter';
import useWebSocket from '../hooks/useWebSocket';
import api from '../services/api';
import './NotificationBell.css';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Handle real-time notifications
  const handleNotificationReceived = useCallback((notification) => {
    console.log('New notification received:', notification);
    
    // Increment unread count
    setUnreadCount(prev => prev + 1);
    
    // Trigger bounce animation
    setHasNewNotification(true);
    setTimeout(() => setHasNewNotification(false), 600);
    
    // Show a toast notification (optional)
    showToastNotification(notification);
  }, []);

  // Initialize WebSocket connection
  const { isConnected, connectionError } = useWebSocket(handleNotificationReceived);

  useEffect(() => {
    fetchUnreadCount();
    // Set up periodic checking for unread count (backup for WebSocket)
    const interval = setInterval(fetchUnreadCount, 60000); // Check every minute as backup
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, user not logged in');
        return;
      }

      console.log('Fetching unread count with token:', token.substring(0, 20) + '...');
      const response = await api.get('/api/notifications/unread/count');
      console.log('Unread count response:', response.data);
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      if (error.response?.status === 404) {
        // Notification feature not available, set count to 0
        console.log('Notification feature not available');
        setUnreadCount(0);
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        // Authentication issue, user might need to re-login
        console.log('Authentication issue for notifications');
        setUnreadCount(0);
      } else if (error.response?.status === 500) {
        console.error('Server error for notifications:', error.response.data);
        setUnreadCount(0);
      } else {
        console.error('Error fetching unread count:', error);
        setUnreadCount(0);
      }
    }
  };

  const showToastNotification = (notification) => {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <strong>${notification.title}</strong>
        <p>${notification.message}</p>
      </div>
    `;
    
    // Add styles
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 300px;
      animation: slideInRight 0.3s ease-out;
    `;
    
    // Add animation keyframes to document if not already present
    if (!document.querySelector('#toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .notification-toast .toast-content strong {
          display: block;
          margin-bottom: 4px;
          color: #333;
          font-size: 14px;
        }
        .notification-toast .toast-content p {
          margin: 0;
          color: #666;
          font-size: 13px;
          line-height: 1.4;
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 4000);
  };

  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
  };

  const closeNotificationCenter = () => {
    setIsOpen(false);
    // Refresh unread count when closing
    fetchUnreadCount();
  };

  return (
    <>
      <div 
        className={`notification-bell ${hasNewNotification ? 'has-new-notification' : ''}`} 
        onClick={toggleNotificationCenter}
        title={`${unreadCount} unread notifications${!isConnected ? ' (offline)' : ''}`}
      >
        <div className="bell-icon">
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          {!isConnected && (
            <span className="connection-status offline" title="Disconnected from real-time updates">
              ⚠️
            </span>
          )}
        </div>
      </div>
      
      <NotificationCenter 
        isOpen={isOpen} 
        onClose={closeNotificationCenter}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
};

export default NotificationBell;
