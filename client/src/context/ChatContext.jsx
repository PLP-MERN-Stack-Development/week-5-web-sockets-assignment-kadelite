import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { socket, useSocket } from '../socket/socket';
import { toast } from 'react-toastify';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { 
    isConnected, 
    messages, 
    users, 
    typingUsers, 
    connect, 
    disconnect, 
    sendMessage, 
    sendPrivateMessage, 
    setTyping 
  } = useSocket();
  
  const [activeRoom, setActiveRoom] = useState('global');
  const [rooms, setRooms] = useState([
    { id: 'global', name: 'Global Chat', type: 'public' },
    { id: 'tech', name: 'Tech Talk', type: 'public' },
    { id: 'random', name: 'Random', type: 'public' },
  ]);
  const [privateChats, setPrivateChats] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [messageReactions, setMessageReactions] = useState({});
  const [readReceipts, setReadReceipts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Handle room change
  const changeRoom = (roomId) => {
    if (roomId !== activeRoom) {
      socket.emit('join_room', roomId);
      setActiveRoom(roomId);
      
      // Reset unread count for this room
      setUnreadCounts(prev => ({
        ...prev,
        [roomId]: 0
      }));
    }
  };
  
  // Start private chat with a user
  const startPrivateChat = (userId, username) => {
    // Create a unique room ID for private chat
    const privateRoomId = [user.id, userId].sort().join('-');
    
    // Add to private chats if not exists
    if (!privateChats[privateRoomId]) {
      setPrivateChats(prev => ({
        ...prev,
        [privateRoomId]: {
          userId,
          username,
          messages: [],
        }
      }));
    }
    
    // Change to this private room
    setActiveRoom(privateRoomId);
    
    // Reset unread count
    setUnreadCounts(prev => ({
      ...prev,
      [privateRoomId]: 0
    }));
    
    return privateRoomId;
  };
  
  // Send a message to current room
  const sendMessageToRoom = (messageText, file = null) => {
    if (!messageText.trim() && !file) return;
    
    const isPrivate = !rooms.find(room => room.id === activeRoom);
    
    if (isPrivate) {
      // Extract the other user's ID from the room ID
      const [id1, id2] = activeRoom.split('-');
      const otherUserId = id1 === user.id ? id2 : id1;
      
      // Send private message
      sendPrivateMessage(otherUserId, {
        text: messageText,
        file: file ? {
          name: file.name,
          type: file.type,
          data: file.data,
        } : null,
        roomId: activeRoom,
      });
    } else {
      // Send room message
      sendMessage({
        text: messageText,
        roomId: activeRoom,
        file: file ? {
          name: file.name,
          type: file.type,
          data: file.data,
        } : null,
      });
    }
  };
  
  // Add reaction to a message
  const addReaction = (messageId, reaction) => {
    socket.emit('add_reaction', { messageId, reaction });
  };
  
  // Mark message as read
  const markAsRead = (messageId) => {
    socket.emit('mark_as_read', { messageId });
  };
  
  // Search messages
  const searchMessages = (query) => {
    setSearchQuery(query);
    setIsSearching(!!query);
    
    if (!query) {
      setFilteredMessages([]);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = messages.filter(msg => 
      msg.message?.text?.toLowerCase().includes(lowerQuery)
    );
    
    setFilteredMessages(filtered);
  };
  
  // Play notification sound
  const playNotificationSound = useCallback(() => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => console.error('Error playing notification:', err));
  }, []);
  
  // Show browser notification
  const showBrowserNotification = useCallback((title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/chat-icon.png'
      });
    }
  }, []);
  
  // Handle new message notifications
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Don't notify for own messages
      if (lastMessage.senderId === user?.id) return;
      
      // Update unread count if message is not in active room
      if (lastMessage.roomId !== activeRoom) {
        setUnreadCounts(prev => ({
          ...prev,
          [lastMessage.roomId]: (prev[lastMessage.roomId] || 0) + 1
        }));
        
        // Play sound for new message
        playNotificationSound();
        
        // Show browser notification
        showBrowserNotification(
          `New message from ${lastMessage.sender}`,
          lastMessage.message?.text || 'New message received'
        );
      } else {
        // Mark as read if in current room
        markAsRead(lastMessage.id);
      }
    }
  }, [messages, activeRoom, user, playNotificationSound, showBrowserNotification]);
  
  // Connect socket when user is authenticated
  useEffect(() => {
    if (user) {
      connect(user.username);
      return () => disconnect();
    }
  }, [user, connect, disconnect]);
  
  const value = {
    isConnected,
    messages,
    users,
    typingUsers,
    activeRoom,
    rooms,
    privateChats,
    unreadCounts,
    messageReactions,
    readReceipts,
    searchQuery,
    filteredMessages,
    isSearching,
    changeRoom,
    startPrivateChat,
    sendMessageToRoom,
    setTyping,
    addReaction,
    markAsRead,
    searchMessages,
  };
  
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;