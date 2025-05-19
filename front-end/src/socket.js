import { io } from 'socket.io-client';

// Khởi tạo socket là null ban đầu
let socket = null;

// Hàm kết nối socket
const connectSocket = (user_id) => {
  if (!user_id) {
    console.error('user_id is required to connect to socket');
    return;
  }

  // Nếu socket đã được khởi tạo, không tạo lại
  if (socket) {
    console.log('Socket already initialized:', socket.id);
    // Kiểm tra nếu đã kết nối, gọi lại addUser để đảm bảo
    if (socket.connected) {
      socket.emit('addUser', user_id);
    }
    return;
  }

  console.log('Connecting with user_id:', user_id);
  socket = io('http://localhost:9999', {
    auth: { user_id },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
    transports: ['websocket', 'polling']
  });

  // Xử lý sự kiện khi kết nối thành công
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    // Gửi sự kiện addUser để server cập nhật socket_ids
    socket.emit('addUser', user_id);
  });

  // Xử lý sự kiện khi kết nối thất bại
  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
    // Thử kết nối lại sau 5 giây
    setTimeout(() => {
      if (socket) {
        socket.connect();
      }
    }, 5000);
  });

  // Xử lý sự kiện khi bị ngắt kết nối
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      // Server ngắt kết nối, thử kết nối lại
      socket.connect();
    }
  });

  // Xử lý sự kiện khi kết nối lại thành công
  socket.on('reconnect', (attempt) => {
    console.log('Socket reconnected after', attempt, 'attempts');
    // Gửi lại addUser khi kết nối lại
    socket.emit('addUser', user_id);
  });

  // Xử lý lỗi
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
};

// Hàm ngắt kết nối (tuỳ chọn, nếu cần)
const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log('Socket disconnected manually');
    socket = null;
  }
};

export { socket, connectSocket, disconnectSocket };