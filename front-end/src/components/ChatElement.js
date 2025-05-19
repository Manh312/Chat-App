import { Avatar, Box, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { SelectConversation } from "../redux/slices/app";
import { useEffect, useState } from "react";
import { socket } from "../socket";

const ChatElement = ({ id, user_id, name, img, msg, time, unread, online, createdAt, lastMessage }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { room_id } = useSelector((state) => state.app);
  const selectedChatId = room_id?.toString();

  const [unreadCount, setUnreadCount] = useState(unread || 0);

  let isSelected = +selectedChatId === +id;
  if (!selectedChatId) {
    isSelected = false;
  }

  const avatarUrl = img || "/default-avatar.png";
  const displayName = name || "Unknown";

  const cleanMessage = (message) => {
    if (!message) return "No messages yet";
    return message.replace(/^(Bạn: |Nguyên gửi 1 ảnh\.|Vũ anh đi bây tò cảm xúc 😢\.)/, "").trim();
  };

  const formatDisplayTime = (timeString) => {
  if (!timeString || typeof timeString !== "string") return "";
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return "";
  const now = new Date(); // Sử dụng thời gian hiện tại thực tế
  const diffInMs = Math.abs(now - date); // Đảm bảo giá trị dương
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Nếu tin nhắn trong cùng ngày
  if (diffInDays === 0) {
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    return `${diffInHours}h`;
  }

  // Nếu tin nhắn từ hôm qua
  if (diffInDays === 1) return "Yesterday";

  // Nếu tin nhắn từ lâu hơn
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
};

  const displayTime = formatDisplayTime(createdAt || time || lastMessage?.createdAt);
  const cleanedMsg = cleanMessage(msg || lastMessage?.text);

  // Lắng nghe cập nhật unreadCount từ Socket.IO
  useEffect(() => {
    const handleUpdateUnreadCount = (data) => {
      if (data.conversation_id === id) {
        setUnreadCount(data.unreadCount);
      }
    };
    socket.on("update_unread_count", handleUpdateUnreadCount);

    return () => {
      socket.off("update_unread_count", handleUpdateUnreadCount);
    };
  }, [id]);

  // Đánh dấu tin nhắn đã đọc thông qua Socket.IO
  const handleClick = () => {
    dispatch(SelectConversation({ room_id: id }));
    socket.emit("open_conversation", { conversation_id: id }); // Ưu tiên Socket.IO
  };

  return (
    <Box onClick={handleClick} sx={{
      width: "100%",
      borderRadius: 2,
      backgroundColor: isSelected
        ? theme.palette.mode === "light"
          ? alpha(theme.palette.grey[200], 0.8)
          : alpha(theme.palette.grey[800], 0.8)
        : "transparent",
      "&:hover": {
        backgroundColor: theme.palette.mode === "light" ? alpha(theme.palette.grey[100], 0.5) : alpha(theme.palette.grey[700], 0.5),
        cursor: "pointer",
      },
      transition: "background-color 0.2s ease",
      py: 1.5,
      px: 2,
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={avatarUrl}
              alt={displayName}
              sx={{
                width: 50,
                height: 50,
                border: `2px solid ${isSelected ? theme.palette.primary.main : "transparent"}`,
              }}
            />
            {online && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  width: 16,
                  height: 16,
                  backgroundColor: "#31a24c",
                  borderRadius: "50%",
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
              />
            )}
          </Box>
          <Stack spacing={0.2} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              {displayName}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: unreadCount > 0 ? theme.palette.text.primary : theme.palette.text.secondary,
                fontWeight: unreadCount > 0 ? 600 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "180px",
              }}
            >
              {cleanedMsg}
            </Typography>
          </Stack>
        </Stack>
        <Stack spacing={1} alignItems="flex-end">
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 400 }}>
            {displayTime}
          </Typography>
          {unreadCount > 0 && (
            <Box sx={{ width: 10, height: 10, backgroundColor: "#1877f2", borderRadius: "50%" }} />
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChatElement;