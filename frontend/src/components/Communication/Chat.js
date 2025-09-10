import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";

const Chat = ({ onClose }) => {
  const {
    users,
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    isConnected,
  } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* User List Sidebar */}
      <div
        style={{
          width: 120,
          background: "#f5f5f5",
          borderRight: "1px solid #eee",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: 8,
            fontWeight: "bold",
            borderBottom: "1px solid #ddd",
          }}
        >
          Users
        </div>
        {users.map((u) => (
          <div
            key={u.id}
            style={{
              padding: 8,
              cursor: "pointer",
              background: selectedUser?.id === u.id ? "#e3f2fd" : "transparent",
              borderBottom: "1px solid #eee",
              fontWeight: selectedUser?.id === u.id ? "bold" : "normal",
            }}
            onClick={() => setSelectedUser(u)}
          >
            {u.fullName || u.username}
          </div>
        ))}
      </div>
      {/* Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: 8,
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f7f7f7",
          }}
        >
          <span>
            {selectedUser
              ? selectedUser.fullName || selectedUser.username
              : "Select a user"}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✖
          </button>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 12,
            background: "#fafbfc",
          }}
        >
          {selectedUser ? (
            messages.map((msg, idx) => {
              const isMine = msg.sender.id === user.id;
              return (
                <div
                  key={idx}
                  style={{
                    textAlign: isMine ? "right" : "left",
                    margin: "8px 0",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      background: isMine ? "#1976d2" : "#e0e0e0",
                      color: isMine ? "#fff" : "#222",
                      borderRadius: 16,
                      padding: "8px 14px",
                      maxWidth: 180,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
              Select a user to start chatting
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        {selectedUser && (
          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              borderTop: "1px solid #eee",
              padding: 8,
              background: "#fff",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 16,
                padding: 8,
                borderRadius: 8,
                background: "#f5f5f5",
              }}
            />
            <button
              type="submit"
              style={{
                marginLeft: 8,
                background: isConnected ? "#1976d2" : "#aaa",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                fontWeight: "bold",
                cursor: isConnected ? "pointer" : "not-allowed",
              }}
              disabled={!isConnected}
            >
              Send
            </button>
          </form>
        )}
        {!isConnected && (
          <div
            style={{
              color: "#d32f2f",
              textAlign: "center",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            Connecting to chat server...
          </div>
        )}
      </div>
    </div>
  );
};
export default Chat;
