// Example: e:\Competition\Hackathon\Fixpoint_javafest\FixPoint\frontend\src\components\ReportComments.js
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { reportService } from "../services/reportService";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

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
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      hoverColor: "hover:bg-blue-200",
    },
    {
      type: "LOVE",
      emoji: "❤️",
      color: "text-red-500",
      bgColor: "bg-red-100",
      hoverColor: "hover:bg-red-200",
    },
    {
      type: "HAHA",
      emoji: "😂",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
      hoverColor: "hover:bg-yellow-200",
    },
    {
      type: "WOW",
      emoji: "😮",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      hoverColor: "hover:bg-purple-200",
    },
    {
      type: "SAD",
      emoji: "😢",
      color: "text-blue-400",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
    },
    {
      type: "ANGRY",
      emoji: "😠",
      color: "text-red-600",
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-100",
    },
  ];

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
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

  const getReactionColor = (type) => {
    const reaction = reactionTypes.find((r) => r.type === type);
    return reaction ? reaction.color : "text-blue-500";
  };

  const getReactionBgColor = (type) => {
    const reaction = reactionTypes.find((r) => r.type === type);
    return reaction ? reaction.bgColor : "bg-blue-100";
  };

  const getReactionHoverColor = (type) => {
    const reaction = reactionTypes.find((r) => r.type === type);
    return reaction ? reaction.hoverColor : "hover:bg-blue-200";
  };

  const getUserName = (user) => {
    return user?.fullName || user?.username || "Unknown";
  };

  const ReactionMenu = ({ commentData, commentId, onClose }) => (
    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-1 flex items-center space-x-1 z-10">
      {reactionTypes.map(({ type, emoji, color, bgColor, hoverColor }) => {
        const isActive = commentData.userReaction === type;
        const count = commentData.reactionCounts?.[type] || 0;

        return (
          <button
            key={type}
            onClick={() => {
              handleReaction(type, commentId);
              onClose();
            }}
            className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
              isActive
                ? `${bgColor} shadow-sm`
                : `text-gray-400 ${hoverColor} hover:shadow-sm`
            }`}
            title={`${type} ${count > 0 ? `(${count})` : ""}`}
          >
            <span className="text-lg">{emoji}</span>
          </button>
        );
      })}
    </div>
  );

  const ReactionDisplay = ({ commentData }) => {
    const totalReactions = Object.values(
      commentData.reactionCounts || {}
    ).reduce((sum, count) => sum + count, 0);

    if (totalReactions === 0) return null;

    return (
      <div className="flex items-center space-x-1 mt-2">
        {reactionTypes.map(({ type, emoji }) => {
          const count = commentData.reactionCounts?.[type] || 0;
          if (count === 0) return null;

          return (
            <span key={type} className="text-sm">
              {emoji} {count}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      {/* Main Comment */}
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            👤
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="relative group"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl px-4 py-3 inline-block max-w-full shadow-sm">
              <div className="font-semibold text-sm text-gray-900 mb-2">
                {getUserName(comment.user)}
              </div>
              <div className="text-sm text-gray-800">{comment.content}</div>
            </div>

            {/* Hover Reaction Menu */}
            {showReactions && (
              <ReactionMenu
                commentData={comment}
                commentId={comment.id}
                onClose={() => setShowReactions(false)}
              />
            )}
          </div>

          {/* Reaction Display */}
          <ReactionDisplay commentData={comment} />

          {/* Action Bar */}
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="hover:text-gray-700 font-medium"
            >
              Reply
            </button>

            <span>{formatTimeAgo(comment.createdAt)}</span>
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-3">
              <form onSubmit={handleAddReply} className="flex space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !replyText.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "Posting..." : "Reply"}
                </button>
              </form>
            </div>
          )}

          {/* Show Replies Button */}
          {comment.replyCount > 0 && (
            <button
              onClick={toggleReplies}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showReplies
                ? "Hide"
                : `View ${comment.replyCount} ${
                    comment.replyCount === 1 ? "reply" : "replies"
                  }`}
            </button>
          )}

          {/* Replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  reportId={reportId}
                  onCommentUpdate={onCommentUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReplyItem = ({ reply, reportId, onCommentUpdate }) => {
  const { user } = useAuth();
  const [showReactions, setShowReactions] = useState(false);

  const reactionTypes = [
    {
      type: "LIKE",
      emoji: "👍",
      bgColor: "bg-blue-100",
      hoverColor: "hover:bg-blue-200",
    },
    {
      type: "LOVE",
      emoji: "❤️",
      bgColor: "bg-red-100",
      hoverColor: "hover:bg-red-200",
    },
    {
      type: "HAHA",
      emoji: "😂",
      bgColor: "bg-yellow-100",
      hoverColor: "hover:bg-yellow-200",
    },
    {
      type: "WOW",
      emoji: "😮",
      bgColor: "bg-purple-100",
      hoverColor: "hover:bg-purple-200",
    },
    {
      type: "SAD",
      emoji: "😢",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
    },
    {
      type: "ANGRY",
      emoji: "😠",
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-100",
    },
  ];

  const handleReaction = async (reactionType, commentId) => {
    if (!user) {
      toast.error("Please log in to react to comments");
      return;
    }

    try {
      await reportService.toggleReaction(reportId, commentId, reactionType);
      onCommentUpdate();
    } catch (error) {
      console.error("Error toggling reaction:", error);
      toast.error("Failed to update reaction");
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  const getUserName = (user) => {
    return user?.fullName || user?.username || "Unknown";
  };

  const ReactionMenu = ({ commentData, commentId, onClose }) => (
    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-1 flex items-center space-x-1 z-10">
      {reactionTypes.map(({ type, emoji, bgColor, hoverColor }) => {
        const isActive = commentData.userReaction === type;
        const count = commentData.reactionCounts?.[type] || 0;

        return (
          <button
            key={type}
            onClick={() => {
              handleReaction(type, commentId);
              onClose();
            }}
            className={`p-1.5 rounded-full transition-all duration-200 transform hover:scale-110 ${
              isActive
                ? `${bgColor} shadow-sm`
                : `text-gray-400 ${hoverColor} hover:shadow-sm`
            }`}
            title={`${type} ${count > 0 ? `(${count})` : ""}`}
          >
            <span className="text-sm">{emoji}</span>
          </button>
        );
      })}
    </div>
  );

  const ReactionDisplay = ({ commentData }) => {
    const totalReactions = Object.values(
      commentData.reactionCounts || {}
    ).reduce((sum, count) => sum + count, 0);

    if (totalReactions === 0) return null;

    return (
      <div className="flex items-center space-x-1 mt-1">
        {reactionTypes.map(({ type, emoji }) => {
          const count = commentData.reactionCounts?.[type] || 0;
          if (count === 0) return null;

          return (
            <span key={type} className="text-xs">
              {emoji} {count}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex space-x-3 ml-4">
      <div className="flex-shrink-0">
        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
          👤
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="relative group"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-2xl px-3 py-2 inline-block max-w-full shadow-sm">
            <div className="font-semibold text-xs text-gray-900 mb-1">
              {getUserName(reply.user)}
            </div>
            <div className="text-xs text-gray-800">{reply.content}</div>
          </div>

          {/* Hover Reaction Menu */}
          {showReactions && (
            <ReactionMenu
              commentData={reply}
              commentId={reply.id}
              onClose={() => setShowReactions(false)}
            />
          )}
        </div>

        {/* Reaction Display */}
        <ReactionDisplay commentData={reply} />

        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
          <span>{formatTimeAgo(reply.createdAt)}</span>
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
    return user?.fullName || user?.username || "Unknown";
  };

  return (
    <div className="card mt-8">
      <div className="card-header">
        <h2 className="card-title flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Comments ({comments.length})
        </h2>
      </div>
      <div className="card-body">
        {/* Add Comment Form */}
        <div className="mb-6">
          <form onSubmit={handleAddComment} className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                👤
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl px-4 py-3">
                <div className="font-semibold text-sm text-gray-900 mb-2">
                  {getUserName(user)}
                </div>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-transparent border-none outline-none text-sm resize-none"
                  rows="3"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex-shrink-0 flex items-end">
              <button
                type="submit"
                disabled={loading || !commentText.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Comments List */}
        <div className="space-y-0">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                reportId={reportId}
                onCommentUpdate={fetchComments}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportComments;
