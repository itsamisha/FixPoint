import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../../services/api";
import "./NotificationCenter.css";

const NotificationCenter = ({ isOpen, onClose, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
      // Prevent body scrolling when notification center is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scrolling when notification center is closed
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Update parent component when unread count changes
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotifications([]);
        return;
      }

      const response = await api.get("/api/notifications");
      setNotifications(response.data.content || []);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("Notification feature not available");
        setNotifications([]);
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        console.log("Authentication issue for notifications");
        setNotifications([]);
      } else {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await api.get("/api/notifications/unread/count");
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("Notification feature not available");
        setUnreadCount(0);
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        console.log("Authentication issue for notifications");
        setUnreadCount(0);
      } else {
        console.error("Error fetching unread count:", error);
        setUnreadCount(0);
      }
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "PROGRESS_UPDATE":
        return "📊";
      case "NEW_COMMENT":
        return "💬";
      case "COMMENT_REPLY":
        return "↩️";
      case "NEW_CHAT_MESSAGE":
        return "📩";
      case "REPORT_ASSIGNED":
        return "👤";
      case "REPORT_STATUS_CHANGE":
        return "🔄";
      case "REPORT_RESOLVED":
        return "✅";
      default:
        return "🔔";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate to the action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    onClose();
  };

  if (!isOpen) return null;

  const notificationCenterContent = (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center-positioned">
        <div
          className="notification-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button className="mark-all-read-btn" onClick={markAllAsRead}>
                  Mark all as read
                </button>
              )}
              <button className="close-btn" onClick={onClose}>
                ×
              </button>
            </div>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="loading">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.isRead ? "unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    {notification.progressPercentage !== null && (
                      <div className="progress-info">
                        Progress: {notification.progressPercentage}%
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${notification.progressPercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <div className="notification-time">
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render the notification center directly to document.body
  return createPortal(notificationCenterContent, document.body);
};

export default NotificationCenter;
