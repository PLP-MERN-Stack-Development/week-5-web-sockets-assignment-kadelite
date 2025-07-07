import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { toast } from 'react-toastify';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  Forum as ForumIcon,
} from '@mui/icons-material';

// Components
import MessageList from '../components/MessageList';
import UserList from '../components/UserList';
import RoomList from '../components/RoomList';
import TypingIndicator from '../components/TypingIndicator';

const Chat = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const {
    isConnected,
    messages,
    users,
    typingUsers,
    activeRoom,
    rooms,
    privateChats,
    unreadCounts,
    changeRoom,
    startPrivateChat,
    sendMessageToRoom,
    setTyping,
    searchMessages,
  } = useChat();
  
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [file, setFile] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Handle typing indicator
  useEffect(() => {
    if (messageText && !isTyping) {
      setIsTyping(true);
      setTyping(true);
    }
    
    if (typingTimeout) clearTimeout(typingTimeout);
    
    setTypingTimeout(
      setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          setTyping(false);
        }
      }, 2000)
    );
    
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [messageText, isTyping, setTyping]);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setFile({
        name: selectedFile.name,
        type: selectedFile.type,
        data: event.target.result,
      });
      toast.info(`File attached: ${selectedFile.name}`);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  // Handle message send
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageText.trim() && !file) return;
    
    sendMessageToRoom(messageText, file);
    setMessageText('');
    setFile(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle search
  const handleSearch = () => {
    searchMessages(searchText);
  };
  
  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Sidebar content
  const sidebarContent = (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={user?.avatar} alt={user?.username} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {user?.username}
        </Typography>
        {isMobile && (
          <IconButton 
            sx={{ ml: 'auto' }} 
            onClick={handleDrawerToggle}
            edge="end"
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        <ForumIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
        Rooms
      </Typography>
      
      <RoomList 
        rooms={rooms} 
        activeRoom={activeRoom} 
        unreadCounts={unreadCounts} 
        onRoomChange={changeRoom} 
      />
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        <PeopleIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
        Online Users ({users.length})
      </Typography>
      
      <UserList 
        users={users} 
        currentUser={user} 
        onStartPrivateChat={startPrivateChat} 
      />
      
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Button 
          variant="outlined" 
          color="error" 
          fullWidth 
          startIcon={<LogoutIcon />} 
          onClick={logout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
  
  if (!isAuthenticated) {
    return <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%' }} />;
  }
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar for desktop */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{ width: 280, flexShrink: 0 }}
        >
          <Paper
            sx={{
              height: '100%',
              width: 280,
              boxSizing: 'border-box',
              borderRadius: 0,
            }}
          >
            {sidebarContent}
          </Paper>
        </Box>
      )}
      
      {/* Drawer for mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* App bar */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {activeRoom === 'global' ? 'Global Chat' : 
               rooms.find(r => r.id === activeRoom)?.name || 
               `Chat with ${privateChats[activeRoom]?.username}`}
            </Typography>
            
            <Tooltip title="Search messages">
              <IconButton color="inherit" onClick={() => setSearchOpen(!searchOpen)}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
            
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={logout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
          
          {searchOpen && (
            <Box sx={{ p: 1, bgcolor: 'background.paper' }}>
              <TextField
                fullWidth
                placeholder="Search messages..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch}>
                        <SearchIcon />
                      </IconButton>
                      <IconButton onClick={() => setSearchOpen(false)}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                size="small"
                autoFocus
              />
            </Box>
          )}
        </AppBar>
        
        {/* Messages area */}
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: 'auto',
            bgcolor: 'background.default',
          }}
        >
          <MessageList currentUser={user} />
        </Box>
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <Box sx={{ px: 2, py: 0.5, bgcolor: 'background.paper' }}>
            <TypingIndicator users={typingUsers} />
          </Box>
        )}
        
        {/* Message input */}
        <Paper
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          <IconButton
            color="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <AttachFileIcon />
          </IconButton>
          
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            variant="outlined"
            size="small"
            autoComplete="off"
          />
          
          <IconButton
            color="primary"
            type="submit"
            disabled={!messageText.trim() && !file}
          >
            <SendIcon />
          </IconButton>
        </Paper>
        
        {/* File preview */}
        {file && (
          <Paper
            sx={{
              p: 1,
              m: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>
              {file.name}
            </Typography>
            
            <IconButton size="small" onClick={() => setFile(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Chat;