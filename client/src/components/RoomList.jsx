import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Forum as ForumIcon,
  Code as CodeIcon,
  EmojiObjects as IdeaIcon,
} from '@mui/icons-material';

const RoomList = ({ rooms, activeRoom, unreadCounts, onRoomChange }) => {
  // Get room icon based on room ID
  const getRoomIcon = (roomId) => {
    switch (roomId) {
      case 'global':
        return <ForumIcon />;
      case 'tech':
        return <CodeIcon />;
      case 'random':
        return <IdeaIcon />;
      default:
        return <ForumIcon />;
    }
  };
  
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1 }}>
      {rooms.map((room) => {
        const unreadCount = unreadCounts[room.id] || 0;
        
        return (
          <ListItem key={room.id} disablePadding>
            <ListItemButton
              selected={activeRoom === room.id}
              onClick={() => onRoomChange(room.id)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor: activeRoom === room.id ? 'action.selected' : 'transparent',
              }}
            >
              <ListItemIcon>
                {getRoomIcon(room.id)}
              </ListItemIcon>
              <ListItemText primary={room.name} />
              
              {unreadCount > 0 && (
                <Tooltip title={`${unreadCount} unread messages`}>
                  <Badge 
                    badgeContent={unreadCount} 
                    color="error" 
                    sx={{ ml: 1 }}
                  />
                </Tooltip>
              )}
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default RoomList;