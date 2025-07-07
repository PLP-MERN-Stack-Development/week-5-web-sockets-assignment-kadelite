import { Box, Typography } from '@mui/material';

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;
  
  // Format the typing message based on number of users
  const getTypingMessage = () => {
    if (users.length === 1) {
      return `${users[0]} is typing`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing`;
    } else if (users.length === 3) {
      return `${users[0]}, ${users[1]} and ${users[2]} are typing`;
    } else {
      return `${users.length} people are typing`;
    }
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: 24 }}>
      <Typography variant="caption" color="text.secondary">
        {getTypingMessage()}
      </Typography>
      <Box sx={{ display: 'inline-flex', ml: 0.5, alignItems: 'center' }}>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </Box>
    </Box>
  );
};

export default TypingIndicator;