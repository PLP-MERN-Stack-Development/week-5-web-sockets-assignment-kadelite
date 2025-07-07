import { useState } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  Badge,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// Styled badge for online status
const OnlineBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const UserList = ({ users, currentUser, onStartPrivateChat }) => {
  // Filter out current user from the list
  const filteredUsers = users.filter(user => user.id !== currentUser?.id);
  
  return (
    <List sx={{ 
      width: '100%', 
      maxHeight: 300, 
      overflowY: 'auto',
      bgcolor: 'background.paper',
      borderRadius: 1,
    }}>
      {filteredUsers.length === 0 ? (
        <ListItem>
          <ListItemText 
            primary="No other users online" 
            primaryTypographyProps={{ 
              variant: 'body2', 
              color: 'text.secondary',
              align: 'center',
            }} 
          />
        </ListItem>
      ) : (
        filteredUsers.map((user) => (
          <ListItem 
            key={user.id} 
            disablePadding
            secondaryAction={
              <FiberManualRecordIcon 
                sx={{ 
                  color: '#44b700', 
                  fontSize: 12,
                  opacity: 0.8,
                }} 
              />
            }
          >
            <ListItemButton 
              onClick={() => onStartPrivateChat(user.id, user.username)}
              sx={{ borderRadius: 1 }}
            >
              <ListItemAvatar>
                <OnlineBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <Avatar 
                    alt={user.username} 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  />
                </OnlineBadge>
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Tooltip title="Click to start private chat">
                    <Typography variant="body2">
                      {user.username}
                    </Typography>
                  </Tooltip>
                } 
              />
            </ListItemButton>
          </ListItem>
        ))
      )}
    </List>
  );
};

export default UserList;