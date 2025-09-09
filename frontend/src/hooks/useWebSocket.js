import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { getApiBaseUrl } from '../utils/apiConfig';

// Get the API base URL
const API_BASE_URL = getApiBaseUrl();

const useWebSocket = (onNotificationReceived) => {
  const stompClient = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.id) {
      console.log('No token or user ID found, skipping WebSocket connection');
      return;
    }

    const connect = () => {
      try {
        // Create WebSocket connection - use API_BASE_URL for backend
        console.log('🔌 Attempting WebSocket connection to:', `${API_BASE_URL}/ws`);
        const socket = new SockJS(`${API_BASE_URL}/ws`);
        stompClient.current = Stomp.over(socket);

        // Disable debug logging in production
        stompClient.current.debug = (str) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('STOMP: ' + str);
          }
        };

        // Connect to WebSocket
        stompClient.current.connect(
          {
            Authorization: `Bearer ${token}`
          },
          (frame) => {
            console.log('✅ Connected to WebSocket:', frame);
            setIsConnected(true);
            setConnectionError(null);

            // Subscribe to user-specific notifications
            const subscription = stompClient.current.subscribe(
              `/user/${user.id}/notifications`,
              (message) => {
                try {
                  const notification = JSON.parse(message.body);
                  console.log('Received notification:', notification);
                  
                  if (onNotificationReceived) {
                    onNotificationReceived(notification);
                  }
                  
                  // Show browser notification if permission granted
                  showBrowserNotification(notification);
                } catch (error) {
                  console.error('Error parsing notification message:', error);
                }
              }
            );

            // Subscribe to general notifications (for admins)
            if (user.role === 'ADMIN') {
              stompClient.current.subscribe(
                '/topic/notifications',
                (message) => {
                  try {
                    const notification = JSON.parse(message.body);
                    console.log('Received admin notification:', notification);
                    
                    if (onNotificationReceived) {
                      onNotificationReceived(notification);
                    }
                    
                    showBrowserNotification(notification);
                  } catch (error) {
                    console.error('Error parsing admin notification message:', error);
                  }
                }
              );
            }

            console.log('Subscribed to notification channels');
          },
          (error) => {
            console.error('❌ WebSocket connection error:', error);
            setIsConnected(false);
            setConnectionError(error);
            
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
              console.log('Attempting to reconnect WebSocket...');
              connect();
            }, 5000);
          }
        );
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        setConnectionError(error);
      }
    };

    const showBrowserNotification = (notification) => {
      // Request notification permission if not already granted
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id,
            requireInteraction: false
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.id,
                requireInteraction: false
              });
            }
          });
        }
      }
    };

    // Initialize connection
    connect();

    // Cleanup function
    return () => {
      if (stompClient.current && stompClient.current.connected) {
        console.log('Disconnecting from WebSocket...');
        stompClient.current.disconnect();
      }
      setIsConnected(false);
    };
  }, [onNotificationReceived]);

  const sendMessage = (destination, message) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send(destination, {}, JSON.stringify(message));
      return true;
    } else {
      console.error('WebSocket not connected');
      return false;
    }
  };

  return {
    isConnected,
    connectionError,
    sendMessage
  };
};

export default useWebSocket;
