import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const chatButtonStyle = {
  position: "fixed",
  right: "32px",
  bottom: "32px",
  zIndex: 1200,
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "56px",
  height: "56px",
  fontSize: "28px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showChat, setShowChat] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleChatClick = () => {
    setShowChat((prev) => !prev);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            FixPoint
          </Link>
          <ul className="navbar-nav">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/map">Map View</Link>
            </li>
            {user && (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/report">Report Issue</Link>
                </li>
              </>
            )}
          </ul>
          <div className="navbar-actions">
            {user ? (
              <>
                <div className="user-welcome">
                  <span>👋 Welcome, {user.fullName || user.username}!</span>
                </div>
                <button onClick={handleLogout} className="btn btn-outline">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      {/* Render chat button and chat window outside nav for fixed positioning */}
      {user &&
        ReactDOM.createPortal(
          <>
            {showChat && (
              <div
                style={{
                  position: "fixed",
                  right: "32px",
                  bottom: "100px",
                  zIndex: 1100,
                }}
              >
                <div
                  style={{
                    width: 350,
                    height: 500,
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
                    overflow: "hidden",
                  }}
                >
                  <React.Suspense fallback={<div>Loading chat...</div>}>
                    {React.createElement(require("./Chat").default, {
                      onClose: handleChatClick,
                    })}
                  </React.Suspense>
                </div>
              </div>
            )}
            <button
              style={chatButtonStyle}
              onClick={handleChatClick}
              title="Chat"
            >
              💬
            </button>
          </>,
          document.body
        )}
    </>
  );
};

export default Navbar;
