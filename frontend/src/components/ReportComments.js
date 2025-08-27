// Example: e:\Competition\Hackathon\Fixpoint_javafest\FixPoint\frontend\src\components\ReportComments.js
import React, { useEffect, useState } from "react";
import { reportService } from "../services/reportService";

const ReportComments = ({ reportId }) => {
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
    setLoading(true);
    try {
      await reportService.addComment(reportId, commentText);
      setCommentText("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-8">
      <div className="card-header">
        <h2 className="card-title">Comments</h2>
      </div>
      <div className="card-body space-y-4">
        {Array.isArray(comments) && comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          Array.isArray(comments) &&
          comments.map((comment) => (
            <div key={comment.id} className="border-b pb-2">
              <div className="font-semibold">
                {comment.user?.fullName || comment.user?.username || "Unknown"}
              </div>
              <div className="text-sm text-gray-700">{comment.content}</div>
              <div className="text-xs text-gray-400">
                {comment.createdAt
                  ? new Date(comment.createdAt).toLocaleString()
                  : ""}
              </div>
            </div>
          ))
        )}
        <form onSubmit={handleAddComment} className="flex gap-2 mt-4">
          <input
            type="text"
            className="form-input flex-1"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportComments;
