// src/pages/ChatPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Spinner } from '../components/common/Loading';
import toast from 'react-hot-toast';
import { FiSend, FiMessageCircle, FiUser } from 'react-icons/fi';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const withUserId = searchParams.get('with');
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Load conversations
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await chatAPI.getConversations();
        setConversations(data.conversations);
      } catch {
        console.error('Failed to load conversations');
      } finally {
        setLoadingConvos(false);
      }
    };
    load();
  }, []);

  // If 'with' query param exists, open that chat
  useEffect(() => {
    if (withUserId) openChat(withUserId);
  }, [withUserId]); // eslint-disable-line

  // Open chat with a specific user
  const openChat = async (userId, otherUserData = null) => {
    setLoadingMessages(true);
    try {
      const { data } = await chatAPI.getHistory(userId);
      setMessages(data.messages);
      setActiveRoom(data.room);

      // Find user info from existing conversations or use passed data
      const existingConvo = conversations.find((c) => c.otherUser?._id === userId);
      setActiveUser(otherUserData || existingConvo?.otherUser || { _id: userId });

      // Join the socket room
      if (socket) socket.emit('join_room', data.room);
    } catch {
      toast.error('Failed to open chat');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Listen for incoming messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message) => {
      if (message.room === activeRoom) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.find((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
      // Refresh conversations list
      chatAPI.getConversations().then(({ data }) => setConversations(data.conversations));
    };

    const handleTyping = ({ userId }) => {
      if (userId !== user._id) setIsTyping(true);
    };
    const handleStopTyping = ({ userId }) => {
      if (userId !== user._id) setIsTyping(false);
    };

    socket.on('receive_message', handleReceive);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [socket, activeRoom, user._id]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !activeRoom) return;
    socket.emit('typing', { room: activeRoom, userId: user._id });
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      socket.emit('stop_typing', { room: activeRoom, userId: user._id });
    }, 2000);
    setTypingTimeout(timeout);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;
    setSending(true);

    const content = newMessage.trim();
    setNewMessage('');

    try {
      // Emit via socket for real-time delivery
      if (socket) {
        socket.emit('send_message', {
          senderId: user._id,
          receiverId: activeUser._id,
          content,
        });
      } else {
        // Fallback: REST API
        const { data } = await chatAPI.sendMessage({ receiverId: activeUser._id, content });
        setMessages((prev) => [...prev, data.message]);
      }
    } catch {
      toast.error('Failed to send message');
      setNewMessage(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen py-6">
      <div className="section">
        <h1 className="text-2xl font-bold text-white mb-6">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-200px)]">

          {/* ── Conversations Sidebar ── */}
          <div className="lg:col-span-1 card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/8">
              <h2 className="text-sm font-semibold text-slate-300">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvos ? (
                <div className="flex items-center justify-center py-10"><Spinner /></div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <FiMessageCircle size={28} className="mx-auto mb-2 text-slate-600" />
                  <p className="text-slate-400 text-sm">No conversations yet</p>
                  <p className="text-slate-500 text-xs mt-1">Hire a service to start chatting</p>
                </div>
              ) : (
                conversations.map((convo) => (
                  <button key={convo.room}
                    onClick={() => openChat(convo.otherUser?._id, convo.otherUser)}
                    className={`w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-white/5 hover:bg-white/5
                      ${activeRoom === convo.room ? 'bg-brand-500/10 border-l-2 border-l-brand-500' : ''}`}>
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {convo.otherUser?.profileImage ? (
                        <img src={convo.otherUser.profileImage} alt={convo.otherUser.name}
                          className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
                          <span className="text-brand-400 font-semibold">{convo.otherUser?.name?.[0]}</span>
                        </div>
                      )}
                      {isUserOnline(convo.otherUser?._id) && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-surface-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white text-sm font-medium truncate">{convo.otherUser?.name}</span>
                        <span className="text-slate-500 text-xs shrink-0">
                          {formatTime(convo.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs truncate mt-0.5">{convo.lastMessage?.content}</p>
                    </div>
                    {convo.unreadCount > 0 && (
                      <span className="shrink-0 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {convo.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Chat Window ── */}
          <div className="lg:col-span-2 card flex flex-col overflow-hidden">
            {!activeUser ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <FiMessageCircle size={40} className="opacity-20" />
                <p className="font-medium">Select a conversation</p>
                <p className="text-sm text-slate-500">Or hire a service to start chatting</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
                  <div className="relative">
                    {activeUser?.profileImage ? (
                      <img src={activeUser.profileImage} alt={activeUser.name}
                        className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center">
                        <FiUser size={16} className="text-brand-400" />
                      </div>
                    )}
                    {isUserOnline(activeUser?._id) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-surface-800" />
                    )}
                  </div>
                  <div>
                    <Link to={`/profile/${activeUser?._id}`}
                      className="text-white font-medium text-sm hover:text-brand-400 transition-colors">
                      {activeUser?.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {isUserOnline(activeUser?._id) ? (
                        <span className="text-emerald-400">● Online</span>
                      ) : 'Offline'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full"><Spinner /></div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                      No messages yet. Say hello! 👋
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                      return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl ${
                            isMe
                              ? 'bg-brand-500 text-white rounded-br-sm'
                              : 'bg-surface-700 text-slate-200 rounded-bl-sm'
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-brand-200' : 'text-slate-500'}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-surface-700 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="flex items-center gap-3 p-4 border-t border-white/8">
                  <input ref={inputRef} type="text" value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                    placeholder="Type a message..."
                    className="input flex-1 py-2.5"
                  />
                  <button type="submit" disabled={!newMessage.trim() || sending}
                    className="btn-primary px-4 py-2.5 disabled:opacity-50">
                    {sending ? <Spinner size="sm" /> : <FiSend size={16} />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
