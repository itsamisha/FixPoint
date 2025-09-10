import { useEffect, useState } from "react";
import {
  MessageCircle,
  Heart,
  ThumbsUp,
  Smile,
  Send,
  Reply,
  MoreHorizontal,
} from "lucide-react";
import { reportService } from "../../services/reportService";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import "./ReportComments.css";

const CommentItem = ({ comment, reportId, onCommentUpdate }) => {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const reactionTypes = [
    {
      type: "LIKE",
      emoji: "👍",
      icon: ThumbsUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      activeBgColor: "bg-blue-100",
    },
    {
      type: "LOVE",
      emoji: "❤️",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-100",
      activeBgColor: "bg-red-100",
    },
    {
      type: "HAHA",
      emoji: "😂",
      icon: Smile,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      hoverColor: "hover:bg-yellow-100",
      activeBgColor: "bg-yellow-100",
    },
    {
      type: "WOW",
      emoji: "😮",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
      activeBgColor: "bg-purple-100",
    },
    {
      type: "SAD",
      emoji: "😢",
      color: "text-blue-500",
      bgColor: "bg-blue-25",
      hoverColor: "hover:bg-blue-50",
      activeBgColor: "bg-blue-50",
    },
    {
      type: "ANGRY",
      emoji: "😠",
      color: "text-red-700",
      bgColor: "bg-red-25",
      hoverColor: "hover:bg-red-50",
      activeBgColor: "bg-red-50",
    },
  ];

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleReaction = async (reactionType, commentId) => {
    if (!user) {
      toast.error("Please log in to react to comments");
      return;
    }

    try {
      await reportService.toggleReaction(reportId, commentId, reactionType);
      onCommentUpdate(); // Refresh comments
    } catch (error) {
      console.error("Error toggling reaction:", error);
      toast.error("Failed to update reaction");
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      await reportService.addReply(reportId, comment.id, replyText);
      setReplyText("");
      setShowReplyInput(false);
      fetchReplies();
      onCommentUpdate(); // Refresh main comments
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await reportService.getReplies(reportId, comment.id);
      setReplies(response.data);
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const toggleReplies = () => {
    if (!showReplies && comment.replyCount > 0) {
      fetchReplies();
    }
    setShowReplies(!showReplies);
  };

  const getUserName = (user) => {
    return user?.fullName || user?.username || "Anonymous User";
  };

  const getUserInitials = (user) => {
    const name = getUserName(user);
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (user) => {
    const colors = [
      "#3B82F6, #1E40AF", // blue
      "#8B5CF6, #7C3AED", // purple
      "#10B981, #059669", // green
      "#EF4444, #DC2626", // red
      "#F59E0B, #D97706", // yellow
      "#6366F1, #4F46E5", // indigo
      "#EC4899, #DB2777", // pink
      "#14B8A6, #0D9488", // teal
    ];
    const username = user?.username || user?.fullName || "default";
    const index = username.length % colors.length;
    return colors[index];
  };

  const ReactionMenu = ({ commentData, commentId, onClose }) => {
    if (!commentData) return null;

    return (
      <div className="reaction-menu">
        {reactionTypes.map(({ type, emoji, activeBgColor, hoverColor }) => {
          const isActive = commentData.userReaction === type;
          const count = commentData.reactionCounts?.[type] || 0;

          return (
            <button
              key={type}
              onClick={() => {
                handleReaction(type, commentId);
                onClose();
              }}
              className={`reaction-btn ${isActive ? "active" : ""}`}
              title={`${type} ${count > 0 ? `(${count})` : ""}`}
            >
              <span>{emoji}</span>
              {count > 0 && isActive && (
                <span className="reaction-counter">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const ReactionDisplay = ({ commentData }) => {
    if (!commentData || !commentData.reactionCounts) return null;

    const totalReactions = Object.values(
      commentData.reactionCounts || {}
    ).reduce((sum, count) => sum + count, 0);

    // Show placeholder when no reactions but always keep the space
    if (totalReactions === 0) {
      return (
        <div className="reactions-display">
          <div className="reactions-placeholder">
            <span className="reactions-placeholder-text">
              Be the first to react!
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="reactions-display">
        <div className="reactions-container">
          {reactionTypes.map(({ type, emoji }) => {
            const count = commentData.reactionCounts?.[type] || 0;
            if (count === 0) return null;

            return (
              <span key={type} className="reaction-item">
                <span className="reaction-emoji">{emoji}</span>
                <span className="reaction-count">{count}</span>
              </span>
            );
          })}
        </div>
        <span className="reactions-total">
          {totalReactions} {totalReactions === 1 ? "reaction" : "reactions"}
        </span>
      </div>
    );
  };

  return (
    <div className="comment-item">
      {/* Main Comment */}
      <div className="comment-main">
        <div
          className="comment-avatar"
          style={{
            background: `linear-gradient(135deg, ${getAvatarColor(
              comment.user
            )})`,
          }}
        >
          {getUserInitials(comment.user)}
        </div>
        <div className="comment-content">
          <div className="comment-bubble">
            <div className="comment-header">
              <div className="comment-user-info">
                <div className="comment-username">
                  {getUserName(comment.user)}
                </div>
                <div className="contributor-badge">Contributor</div>
              </div>
              <div className="comment-timestamp">
                {formatTimeAgo(comment.createdAt)}
              </div>
            </div>
            <div className="comment-text">{comment.content}</div>
          </div>

          {/* Reaction Display - Always visible */}
          <ReactionDisplay commentData={comment} />

          {/* Reaction Menu - Positioned relative to action bar */}
          {showReactions && (
            <div className="reaction-menu-container">
              <ReactionMenu
                commentData={comment}
                commentId={comment.id}
                onClose={() => setShowReactions(false)}
              />
            </div>
          )}

          {/* Action Bar */}
          <div className="comment-actions">
            <div className="action-buttons">
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="action-btn reply-btn"
              >
                <Reply size={16} />
                <span>Reply</span>
              </button>

              <button
                onClick={() => setShowReactions(!showReactions)}
                className="action-btn reaction-btn-trigger"
              >
                <Heart size={16} />
                <span>React</span>
              </button>

              {comment.replyCount > 0 && (
                <button
                  onClick={toggleReplies}
                  className="action-btn show-replies-btn"
                >
                  <span>
                    {showReplies
                      ? "Hide replies"
                      : `${comment.replyCount} ${
                          comment.replyCount === 1 ? "reply" : "replies"
                        }`}
                  </span>
                  <div
                    className={`pulse-dot ${showReplies ? "rotate-180" : ""}`}
                  ></div>
                </button>
              )}
            </div>

            <div className="comment-meta">
              <div className="comment-id">#{comment.id}</div>
            </div>
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="reply-input-container">
              <div className="reply-input-card">
                <form onSubmit={handleAddReply} className="reply-form">
                  <div className="reply-form-row">
                    <div
                      className="reply-avatar"
                      style={{
                        background: `linear-gradient(135deg, ${getAvatarColor(
                          user
                        )})`,
                      }}
                    >
                      {getUserInitials(user)}
                    </div>
                    <div className="reply-input-wrapper">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a thoughtful reply..."
                        className="reply-input"
                        disabled={loading}
                        autoFocus
                      />
                      <div className="reply-form-footer">
                        <div className="reply-char-counter">
                          {replyText.length > 0 && (
                            <span>{replyText.length}/200 characters</span>
                          )}
                        </div>
                        <div className="reply-buttons">
                          <button
                            type="button"
                            onClick={() => setShowReplyInput(false)}
                            className="reply-cancel-btn"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading || !replyText.trim()}
                            className="reply-submit-btn"
                          >
                            <Send size={16} />
                            <span>{loading ? "Sending..." : "Reply"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Replies */}
          {showReplies && replies.length > 0 && (
            <div className="replies-container">
              {replies.map((reply, index) => (
                <div
                  key={reply.id}
                  className="slide-in-from-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ReplyItem
                    reply={reply}
                    reportId={reportId}
                    onCommentUpdate={onCommentUpdate}
                    onReplyUpdate={fetchReplies}
                    getUserInitials={getUserInitials}
                    getAvatarColor={getAvatarColor}
                    getUserName={getUserName}
                    formatTimeAgo={formatTimeAgo}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReplyItem = ({
  reply,
  reportId,
  onCommentUpdate,
  onReplyUpdate,
  getUserInitials,
  getAvatarColor,
  getUserName,
  formatTimeAgo,
}) => {
  const { user } = useAuth();
  const [showReactions, setShowReactions] = useState(false);

  const reactionTypes = [
    {
      type: "LIKE",
      emoji: "👍",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      activeBgColor: "bg-blue-100",
    },
    {
      type: "LOVE",
      emoji: "❤️",
      color: "text-red-600",
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-100",
      activeBgColor: "bg-red-100",
    },
    {
      type: "HAHA",
      emoji: "😂",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      hoverColor: "hover:bg-yellow-100",
      activeBgColor: "bg-yellow-100",
    },
  ];

  const handleReaction = async (reactionType, replyId) => {
    if (!user) {
      toast.error("Please log in to react to replies");
      return;
    }

    try {
      await reportService.toggleReaction(reportId, replyId, reactionType);
      // Refresh both replies and main comments
      if (onReplyUpdate) onReplyUpdate();
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error("Error toggling reaction:", error);
      toast.error("Failed to update reaction");
    }
  };

  const ReactionMenu = ({ replyData, replyId, onClose }) => {
    if (!replyData) return null;

    return (
      <div className="reaction-menu">
        {reactionTypes.map(({ type, emoji, activeBgColor, hoverColor }) => {
          const isActive = replyData.userReaction === type;
          const count = replyData.reactionCounts?.[type] || 0;

          return (
            <button
              key={type}
              onClick={() => {
                handleReaction(type, replyId);
                onClose();
              }}
              className={`reaction-btn ${isActive ? "active" : ""}`}
              title={`${type} ${count > 0 ? `(${count})` : ""}`}
            >
              <span>{emoji}</span>
              {count > 0 && isActive && (
                <span className="reaction-counter">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const ReactionDisplay = ({ replyData }) => {
    if (!replyData || !replyData.reactionCounts) return null;

    const totalReactions = Object.values(replyData.reactionCounts || {}).reduce(
      (sum, count) => sum + count,
      0
    );

    // Show placeholder when no reactions
    if (totalReactions === 0) {
      return (
        <div className="reactions-display">
          <div className="reactions-placeholder">
            <span className="reactions-placeholder-text">
              React to this reply
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="reactions-display">
        <div className="reactions-container">
          {reactionTypes.map(({ type, emoji }) => {
            const count = replyData.reactionCounts?.[type] || 0;
            if (count === 0) return null;

            return (
              <span key={type} className="reaction-item">
                <span className="reaction-emoji">{emoji}</span>
                <span className="reaction-count">{count}</span>
              </span>
            );
          })}
        </div>
        <span className="reactions-total">
          {totalReactions} {totalReactions === 1 ? "reaction" : "reactions"}
        </span>
      </div>
    );
  };

  return (
    <div className="reply-item">
      <div className="comment-main">
        <div
          className="reply-avatar"
          style={{
            background: `linear-gradient(135deg, ${getAvatarColor(
              reply.user
            )})`,
          }}
        >
          {getUserInitials(reply.user)}
        </div>
        <div className="comment-content">
          <div className="comment-bubble">
            <div className="comment-header">
              <div className="comment-username">{getUserName(reply.user)}</div>
              <div className="comment-timestamp">
                {formatTimeAgo(reply.createdAt)}
              </div>
            </div>
            <div className="comment-text">{reply.content}</div>
          </div>

          {/* Reaction Display - Always visible */}
          <ReactionDisplay replyData={reply} />

          {/* Reply Action Bar */}
          <div className="reply-actions">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="action-btn reaction-btn-trigger"
            >
              <Heart size={14} />
              <span>React</span>
            </button>
          </div>

          {/* Reaction Menu - Positioned relative to action bar */}
          {showReactions && (
            <div className="reaction-menu-container">
              <ReactionMenu
                replyData={reply}
                replyId={reply.id}
                onClose={() => setShowReactions(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportComments = ({ reportId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const fetchComments = async () => {
    try {
      const response = await reportService.getComments(reportId);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user) {
      toast.error("Please log in to comment");
      return;
    }

    setLoading(true);
    try {
      await reportService.addComment(reportId, commentText);
      setCommentText("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (user) => {
    return user?.fullName || user?.username || "Anonymous User";
  };

  const getUserInitials = (user) => {
    const name = getUserName(user);
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (user) => {
    const colors = [
      "#3B82F6, #1E40AF", // blue
      "#8B5CF6, #7C3AED", // purple
      "#10B981, #059669", // green
      "#EF4444, #DC2626", // red
      "#F59E0B, #D97706", // yellow
      "#6366F1, #4F46E5", // indigo
      "#EC4899, #DB2777", // pink
      "#14B8A6, #0D9488", // teal
    ];
    const username = user?.username || user?.fullName || "default";
    const index = username.length % colors.length;
    return colors[index];
  };

  return (
    <div className="comments-container">
      <div className="comments-header">
        <h2 className="comments-title">
          <div className="comments-icon">
            <MessageCircle size={24} color="white" />
          </div>
          <span>Discussion</span>
          <span className="comments-count">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>
        </h2>
      </div>
      <div className="comments-body">
        {/* Add Comment Form */}
        <div className="comment-form-container">
          <div className="comment-form-card">
            <h3 className="comment-form-title">Share your thoughts</h3>
            <form onSubmit={handleAddComment} className="comment-form">
              <div className="comment-form-row">
                <div
                  className="comment-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${getAvatarColor(
                      user
                    )})`,
                  }}
                >
                  {getUserInitials(user)}
                </div>
                <div className="comment-input-container">
                  <div className="comment-input-wrapper">
                    <div className="comment-user-name">{getUserName(user)}</div>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="What's on your mind? Share your insights, feedback, or questions..."
                      className="comment-textarea"
                      disabled={loading}
                    />
                  </div>
                  <div className="comment-form-footer">
                    <div
                      className={`character-counter ${
                        commentText.length > 500 ? "warning" : ""
                      }`}
                    >
                      {commentText.length > 0 && (
                        <span>{commentText.length}/500 characters</span>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        !commentText.trim() ||
                        commentText.length > 500
                      }
                      className="comment-submit-btn"
                    >
                      <Send size={20} />
                      <span>{loading ? "Publishing..." : "Post Comment"}</span>
                      {loading && <div className="loading-spinner"></div>}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Comments List */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <div className="empty-state-main-icon">
                  <MessageCircle size={48} color="white" />
                </div>
                <div className="floating-dot"></div>
                <div className="floating-dot"></div>
                <div className="floating-dot"></div>
              </div>
              <h3 className="empty-state-title">Start the conversation!</h3>
              <p className="empty-state-description">
                Be the first to share your thoughts, insights, or questions
                about this report. Your voice matters!
              </p>
              <div className="empty-state-dots">
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
              </div>
            </div>
          ) : (
            comments.map((comment, index) => (
              <div
                key={comment.id}
                className="fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CommentItem
                  comment={comment}
                  reportId={reportId}
                  onCommentUpdate={fetchComments}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportComments;
