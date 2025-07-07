import { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ThumbUp as LikeIcon,
  Favorite as HeartIcon,
  EmojiEmotions as SmileIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';

const MessageList = ({ currentUser }) => {
  const {
    messages,
    activeRoom,
    filteredMessages,
    isSearching,
    privateChats,
    messageReactions,
    readReceipts,
    addReaction,
    markAsRead,
  } = useChat();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Filter messages for current room
  const filteredRoomMessages = isSearching
    ? filteredMessages
    : messages.filter(msg => {
        if (activeRoom.includes('-')) {
          // Private chat
          return msg.isPrivate && (
            (msg.senderId === currentUser?.id && msg.receiverId === privateChats[activeRoom]?.userId) ||
            (msg.senderId === privateChats[activeRoom]?.userId && msg.receiverId === currentUser?.id)
          );
        } else {
          // Public room
          return msg.roomId === activeRoom || (!msg.roomId && activeRoom === 'global');
        }
      });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isSearching) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredRoomMessages, isSearching]);
  
  // Mark messages as read
  useEffect(() => {
    filteredRoomMessages.forEach(msg => {
      if (msg.senderId !== currentUser?.id && !readReceipts[msg.id]) {
        markAsRead(msg.id);
      }
    });
  }, [filteredRoomMessages, currentUser, readReceipts, markAsRead]);
  
  // Handle message menu open
  const handleMenuOpen = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };
  
  // Handle message menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };
  
  // Handle reaction
  const handleReaction = (reaction) => {
    if (selectedMessage) {
      addReaction(selectedMessage.id, reaction);
      handleMenuClose();
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Render file attachment
  const renderFileAttachment = (file) => {
    if (!file) return null;
    
    if (file.type.startsWith('image/')) {
      return (
        <Box sx={{ mt: 1, maxWidth: '100%' }}>
          <img 
            src={file.data} 
            alt="Attachment" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '200px', 
              borderRadius: '8px' 
            }} 
          />
        </Box>
      );
    }
    
    return (
      <Box 
        sx={{ 
          mt: 1, 
          p: 1, 
          bgcolor: 'background.paper', 
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          maxWidth: 'fit-content'
        }}
      >
        <Typography variant="body2">
          📎 {file.name}
        </Typography>
      </Box>
    );
  };
  
  // Render message reactions
  const renderReactions = (messageId) => {
    const reactions = messageReactions[messageId];
    if (!reactions || Object.keys(reactions).length === 0) return null;
    
    return (
      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
        {Object.entries(reactions).map(([reaction, count]) => (
          <Badge key={reaction} badgeContent={count} color="primary" sx={{ mr: 1 }}>
            {reaction === 'like' ? (
              <LikeIcon fontSize="small" color="primary" />
            ) : reaction === 'heart' ? (
              <HeartIcon fontSize="small" color="error" />
            ) : (
              <SmileIcon fontSize="small" color="warning" />
            )}
          </Badge>
        ))}
      </Box>
    );
  };
  
  // Render read receipt
  const renderReadReceipt = (message) => {
    if (message.senderId !== currentUser?.id) return null;
    
    return readReceipts[message.id] ? (
      <Tooltip title="Read">
        <DoneAllIcon fontSize="small" color="primary" sx={{ ml: 0.5, fontSize: 16 }} />
      </Tooltip>
    ) : (
      <Tooltip title="Sent">
        <CheckIcon fontSize="small" color="action" sx={{ ml: 0.5, fontSize: 16 }} />
      </Tooltip>
    );
  };
  
  // Group messages by date
  const groupedMessages = filteredRoomMessages.reduce((groups, message) => {
    if (!message.timestamp) return groups;
    
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <Box key={date}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {date === new Date().toLocaleDateString() ? 'Today' : date}
            </Typography>
          </Divider>
          
          {dateMessages.map((message) => {
            const isOwnMessage = message.senderId === currentUser?.id;
            
            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  mb: 2,
                  className: 'message-animation',
                }}
              >
                {!isOwnMessage && (
                  <Avatar
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`}
                    alt={message.sender}
                    sx={{ mr: 1, width: 36, height: 36 }}
                  />
                )}
                
                <Box
                  sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                  }}
                >
                  {!isOwnMessage && (
                    <Typography variant="subtitle2" color="text.secondary">
                      {message.sender}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isOwnMessage ? 'primary.dark' : 'background.paper',
                        color: isOwnMessage ? 'white' : 'text.primary',
                        position: 'relative',
                      }}
                    >
                      {message.system ? (
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {message.message}
                        </Typography>
                      ) : (
                        <>
                          <Typography variant="body1">
                            {message.message?.text || message.message}
                          </Typography>
                          
                          {renderFileAttachment(message.message?.file || message.file)}
                          
                          <Typography 
                            variant="caption" 
                            color={isOwnMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
                            sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}
                          >
                            {formatTime(message.timestamp)}
                            {renderReadReceipt(message)}
                          </Typography>
                        </>
                      )}
                    </Paper>
                    
                    {!message.system && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, message)}
                        sx={{ ml: 0.5 }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  {renderReactions(message.id)}
                </Box>
              </Box>
            );
          })}
        </Box>
      ))}
      
      <div ref={messagesEndRef} />
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleReaction('like')}>
          <LikeIcon fontSize="small" sx={{ mr: 1 }} /> Like
        </MenuItem>
        <MenuItem onClick={() => handleReaction('heart')}>
          <HeartIcon fontSize="small" sx={{ mr: 1 }} /> Heart
        </MenuItem>
        <MenuItem onClick={() => handleReaction('smile')}>
          <SmileIcon fontSize="small" sx={{ mr: 1 }} /> Smile
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MessageList;