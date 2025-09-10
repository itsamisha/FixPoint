import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const NotificationTestPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.content || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const testProgressNotification = async (percentage) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/test-progress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Progress Update',
          message: `Progress updated to ${percentage}%`,
          progressPercentage: percentage,
          type: 'PROGRESS_UPDATE'
        })
      });

      if (response.ok) {
        toast.success(`Test progress notification sent (${percentage}%)`);
        setTimeout(fetchNotifications, 1000); // Refresh after 1 second
      } else {
        toast.error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Error sending test notification');
    } finally {
      setIsLoading(false);
    }
  };

  const testCommentNotification = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/test-comment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'New Comment',
          message: 'Someone commented on your report',
          type: 'NEW_COMMENT'
        })
      });

      if (response.ok) {
        toast.success('Test comment notification sent');
        setTimeout(fetchNotifications, 1000);
      } else {
        toast.error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Error sending test notification');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/clear-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('All notifications cleared');
        setNotifications([]);
      } else {
        toast.error('Failed to clear notifications');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Error clearing notifications');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Notification System Test</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Test Notifications</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button 
            onClick={() => testProgressNotification(25)} 
            disabled={isLoading}
            style={{
              padding: '10px 15px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test 25% Progress
          </button>
          <button 
            onClick={() => testProgressNotification(50)} 
            disabled={isLoading}
            style={{
              padding: '10px 15px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test 50% Progress
          </button>
          <button 
            onClick={() => testProgressNotification(100)} 
            disabled={isLoading}
            style={{
              padding: '10px 15px',
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test 100% Complete
          </button>
          <button 
            onClick={testCommentNotification} 
            disabled={isLoading}
            style={{
              padding: '10px 15px',
              background: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test Comment
          </button>
        </div>
        
        <button 
          onClick={clearAllNotifications}
          style={{
            padding: '10px 15px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear All Notifications
        </button>
      </div>

      <div>
        <h3>Recent Notifications ({notifications.length})</h3>
        {notifications.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No notifications found</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.slice(0, 10).map(notification => (
              <div 
                key={notification.id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: notification.isRead ? '#f8f9fa' : '#e3f2fd'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                      {notification.title}
                    </h4>
                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                      {notification.message}
                    </p>
                    {notification.progressPercentage !== null && (
                      <div style={{ margin: '10px 0' }}>
                        <small style={{ color: '#666' }}>
                          Progress: {notification.progressPercentage}%
                        </small>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#e9ecef',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          marginTop: '4px'
                        }}>
                          <div style={{
                            width: `${notification.progressPercentage}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #28a745, #20c997)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    )}
                    <small style={{ color: '#999' }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div style={{ marginLeft: '10px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      background: notification.isRead ? '#6c757d' : '#007bff',
                      color: 'white'
                    }}>
                      {notification.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationTestPage;
