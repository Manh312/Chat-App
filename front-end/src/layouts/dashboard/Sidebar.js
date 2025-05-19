import React, { useState } from 'react';
import Logo from "../../assets/Images/logo.ico";
import { Nav_Buttons, Profile_Menu } from "../../data";
import { Gear } from "phosphor-react";
import { faker } from "@faker-js/faker";
import { Avatar, Box, Divider, IconButton, Menu, MenuItem, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useSettings from "../../hooks/useSettings";
import AntSwitch from '../../components/AntSwitch';
import { useNavigate } from "react-router-dom";
import { LogoutUser } from '../../redux/slices/auth';
import { useDispatch, useSelector } from 'react-redux';


const getPath = (index) => {
  switch (index) {
    case 0:
      return '/app';
    case 1:
      return '/group';
    case 2:
      return '/call';
    case 3:
      return '/settings';
    default:
      break;
  };
};

const getMenuPath = (index) => {
  switch (index) {
    case 0:
      return '/profile';
    case 1:
      return '/settings';
    case 2:
      return '/auth/login';
    default:
      break;
  };
};

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const { onToggleMode } = useSettings();
  const dispacth = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box p={2} sx={{ backgroundColor: theme.palette.background.paper, boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)', height: '100vh', width: 100 }}>

      <Stack
        direction={"column"}
        alignItems={"center"}
        justifyContent={"space-between"}
        sx={{ height: "100%" }}
        spacing={3}
      >
        <Stack alignItems={"center"} spacing={4}>
          <Box sx={{
            backgroundColor: theme.palette.primary.main,
            height: 64,
            width: 64,
            borderRadius: 1.5,
          }}>
            <img src={Logo} alt="Chat App Logo" />
          </Box>
          <Stack sx={{ width: "max-content" }} direction={"column"} alignItems={"center"} spacing={3}>
            {Nav_Buttons.map((element) =>
              element.index === selected ? (
                <Box p={1} sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 1.5 }}>
                  <IconButton sx={{ width: "max-content", color: "#fff" }} key={element.index}>
                    {element.icon}
                  </IconButton>
                </Box>
              ) : (
                <IconButton onClick={() => {
                  setSelected(element.index);
                  navigate(getPath(element.index));
                }}
                  sx={{ width: "max-content", color: theme.palette.mode === 'light' ? "#000" : theme.palette.text.primary }} key={element.index}>
                  {element.icon}
                </IconButton>
              )
            )}
            <Divider sx={{ width: "48px" }} />
            {selected === 3 ?
              <Box p={1} sx={{
                backgroundColor: theme.palette.primary.main,
                borderRadius: 1.5,
              }}>
                <IconButton sx={{ width: "max-content", color: "#fff" }}>
                  <Gear />
                </IconButton>

              </Box>
              :
              <IconButton onClick={() => {
                setSelected(3);
                navigate(getPath(3));
              }}
                sx={{ width: "max-content", color: theme.palette.mode === 'light' ? "#000" : theme.palette.text.primary }}
              >
                <Gear />
              </IconButton>
            }
          </Stack>
        </Stack>
        <Stack spacing={4}>
          <AntSwitch onChange={() => {
            onToggleMode();
          }} defaultChecked />
          <Avatar id="basic-button" aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            src={user?.avatar}
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick} />
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Stack spacing={1} px={1}>
              {Profile_Menu.map((option, index) => (
                <MenuItem onClick={() => {
                  handleClick();
                }}>
                  <Stack onClick={() => {
                    if (index === 2) {
                      dispacth(LogoutUser());
                    } else {
                      navigate(getMenuPath(index));
                    }
                  }} sx={{ width: 100 }} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <span>{option.title}</span>
                    {option.icon}
                  </Stack>
                </MenuItem>
              ))}
            </Stack>
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Sidebar;
