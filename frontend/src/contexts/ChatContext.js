import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import { getApiBaseUrl } from '../utils/apiConfig';

// Use backend URL for WebSocket connection
const WS_URL = `${getApiBaseUrl()}/ws-chat`;
const API_USERS = "/api/chat/users";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);
  const selectedUserRef = useRef(null);

  // Keep selectedUserRef in sync
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Fetch user list
  useEffect(() => {
    if (user) {
      let cancelled = false;
      api
        .get(API_USERS)
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.users)
            ? res.data.users
            : [];
          if (!cancelled && user) {
            setUsers(list.filter((u) => u.id !== user.id));
          }
        })
        .catch((err) => {
          if (!cancelled) {
            console.error("Failed to fetch chat users:", err);
            setUsers([]);
          }
        });
      return () => {
        cancelled = true;
      };
    } else {
      setUsers([]);
    }
  }, [user]);

  // Connect to WebSocket only once
  useEffect(() => {
    if (!user) return;
    
    let isCancelled = false;
    
    try {
      const socket = new SockJS(WS_URL);
      const client = Stomp.over(() => socket);
      
      // Disable console debug logs
      client.debug = () => {};
      
      setIsConnected(false);
      
      client.connect(
        {},
        () => {
          if (isCancelled) return;
          setIsConnected(true);
          client.subscribe(`/user/${user.username}/queue/messages`, (msg) => {
            const body = JSON.parse(msg.body);
            // Only add message if it is between the logged-in user and the selected user (using ref)
            setMessages((prev) => {
              const selUser = selectedUserRef.current;
              if (!selUser) return prev;
              const isBetween =
                (body.sender.id === user.id && body.receiver.id === selUser.id) ||
                (body.sender.id === selUser.id && body.receiver.id === user.id);
              if (isBetween) {
                return [...prev, body];
              }
              return prev;
            });
          });
        },
        (err) => {
          if (isCancelled) return;
          setIsConnected(false);
          console.warn("WebSocket connection failed (this is normal if chat is not needed):", err.message || err);
        }
      );
      
      stompClientRef.current = client;
      
      return () => {
        isCancelled = true;
        if (client && client.connected) {
          client.disconnect();
        }
        setIsConnected(false);
      };
    } catch (error) {
      console.warn("Failed to initialize WebSocket connection:", error.message);
      setIsConnected(false);
    }
  }, [user]);

  // Fetch chat history when selected user changes
  useEffect(() => {
    if (selectedUser) {
      api
        .get(`/api/chat/history?userId=${selectedUser.id}`)
        .then((res) => {
          setMessages(res.data);
        })
        .catch((err) => {
          setMessages([]);
          const backendMsg =
            err?.response?.data?.message || err?.response?.data || err.message;
          console.error("Failed to fetch chat history:", backendMsg);
          alert("Failed to load chat history. Backend says: " + backendMsg);
        });
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  const sendMessage = (content) => {
    if (
      !content.trim() ||
      !selectedUser ||
      !isConnected ||
      !stompClientRef.current
    )
      return;
    try {
      const msg = {
        content,
        receiver: { id: selectedUser.id },
        type: "TEXT",
        sender: { id: user.id },
      };
      // Optimistically add the message to the chat
      setMessages((prev) => [
        ...prev,
        { ...msg, sender: { id: user.id }, receiver: { id: selectedUser.id } },
      ]);
      stompClientRef.current.send("/app/chat.send", {}, JSON.stringify(msg));
    } catch (err) {
      alert("Unable to send message: STOMP connection not ready.");
      console.error("Send message error:", err);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        users,
        messages,
        selectedUser,
        setSelectedUser,
        sendMessage,
        isConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
