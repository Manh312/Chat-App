import React from 'react';
import { Avatar, Box, Divider, Fade, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { CaretDown, MagnifyingGlass, Phone, VideoCamera } from 'phosphor-react';
import { useTheme } from '@mui/material/styles';
import StyledBadge from '../StyledBadge';
import { ToggleSidebar } from '../../redux/slices/app';
import { useDispatch, useSelector } from 'react-redux';

const Conversation_Menu = [
  {
    title: "Contact info",
  },
  {
    title: "Mute notifications",
  },
  {
    title: "Clear messages",
  },
  {
    title: "Delete chat",
  },
];

const Header = ({user_id, img, name}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {current_conversation} = useSelector((state) => state.conversation.direct_chat);
  const {friends, room_id} = useSelector((state) => state.app);

  const [conversationMenuAnchorEl, setConversationMenuAnchorEl] =
    React.useState(null);
  const openConversationMenu = Boolean(conversationMenuAnchorEl);
  const handleClickConversationMenu = (event) => {
    setConversationMenuAnchorEl(event.currentTarget);
  };
  const handleCloseConversationMenu = () => {
    setConversationMenuAnchorEl(null);
  };

  const friend = friends.find((f) => f._id.toString() === user_id.toString());
  const avatarUrl = friend?.avatar || img || '/default-avatar.png';
  const displayName = friend ? `${friend.firstName} ${friend.lastName}` : name || "Unknown";

  // Nếu không có room_id được chọn, không hiển thị header
  if (!room_id) {
    return null;
  }
  
  return (
    <Box
      p={2}
      sx={{
        height: 100,
        width: '100%',
        backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background.default,
        boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)',
      }}>

      <Stack alignItems={'center'} direction={'row'} justifyContent={'space-between'} sx={{ width: '100%', height: '100%' }}>
        <Stack onClick={() => {
          dispatch(ToggleSidebar())
        }} direction={'row'} spacing={2}>
          <Box>
            <StyledBadge overlap='circular' anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant='dot'>
              <Avatar src={avatarUrl} alt={displayName} />
            </StyledBadge>
          </Box>
          <Stack spacing={0.2}>
            <Typography variant='subtitle2'>
              {displayName}
            </Typography>
            <Typography variant='caption'>
              Online
            </Typography>
          </Stack>
        </Stack>
        <Stack direction={'row'} alignItems={'center'} spacing={3}>
          <IconButton>
            <VideoCamera />
          </IconButton>
          <IconButton>
            <Phone />
          </IconButton>
          <IconButton>
            <MagnifyingGlass />
          </IconButton>
          <Divider orientation='vertical' flexItem />
          <IconButton
              id="conversation-positioned-button"
              aria-controls={
                openConversationMenu
                  ? "conversation-positioned-menu"
                  : undefined
              }
              aria-haspopup="true"
              aria-expanded={openConversationMenu ? "true" : undefined}
              onClick={handleClickConversationMenu}
            >
              <CaretDown />
            </IconButton>
            <Menu
              MenuListProps={{
                "aria-labelledby": "fade-button",
              }}
              id="conversation-positioned-menu"
              TransitionComponent={Fade}
              aria-labelledby="conversation-positioned-button"
              anchorEl={conversationMenuAnchorEl}
              open={openConversationMenu}
              onClose={handleCloseConversationMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <Box p={1}>
                <Stack spacing={1}>
                  {Conversation_Menu.map((el) => (
                    <MenuItem onClick={handleCloseConversationMenu}>
                      <Stack
                        sx={{ minWidth: 100 }}
                        direction="row"
                        alignItems={"center"}
                        justifyContent="space-between"
                      >
                        <span>{el.title}</span>
                      </Stack>{" "}
                    </MenuItem>
                  ))}
                </Stack>
              </Box>
            </Menu>
        </Stack>

      </Stack>

    </Box>
  );
}

export default Header;
