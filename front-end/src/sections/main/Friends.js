import { Dialog, DialogContent, Stack, Tab, Tabs } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FetchFriendRequests, FetchFriends, FetchUsers } from '../../redux/slices/app';
import { FriendComponent, FriendRequestComponent, UserComponent } from '../../components/Friends';

const UsersList = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(FetchUsers());
  }, []);

  const { users } = useSelector((state) => state.app);


  return (
    <>
      {users.map((element, index) => {
        return <UserComponent key={element._id} {...element} />;
      })}
    </>
  )
};

const FriendsList = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(FetchFriends());
  }, []);

  const { friends } = useSelector((state) => state.app);
  console.log(friends);


  return (
    <>
      {friends.map((element, index) => {
        return (
          <FriendComponent key={element._id} {...element.sender} id={element._id} firstName={element.firstName} lastName={element.lastName} _id={element._id} avatar={element.avatar} />
        );
      })}
    </>
  )
};

const FriendRequestsList = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(FetchFriendRequests());
  }, []);

  const { friendRequests } = useSelector((state) => state.app);


  return (
    <>
      {friendRequests.map((element, index) => {
        return (
          <FriendRequestComponent key={element._id} {...element} id={element._id} firstName={element.sender.firstName} lastName={element.sender.lastName} avatar={element.avatar}/>
        );
      })}
    </>
  )
};

const Friends = ({ open, handleClose }) => {
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Dialog
      fullWidth
      maxWidth='xs'
      open={open}
      keepMounted
      onClose={handleClose}
      sx={{ p: 4 }}
    >
      <Stack p={2} sx={{ width: '100%' }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label='Explore' />
          <Tab label='Friends' />
          <Tab label='Requests' />
        </Tabs>
      </Stack>

      <DialogContent>
        <Stack sx={{ height: '100%' }}>
          <Stack spacing={2.5}>
            {(() => {
              switch (value) {
                case 0:
                  return <UsersList />;
                case 1:
                  return <FriendsList/>
                case 2:
                  return <FriendRequestsList/>
                default:
                  break;
              }
            })()}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default Friends;
