require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(bodyParser.json());


mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  try {
    await User.deleteMany({});
    console.log('All guest users deleted from the database.');
  } catch (error) {
    console.error('Error deleting users:', error);
  }
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});


const User = require('./models/User');
const Message = require('./models/Message');


app.get('/api/users/check-username', async (req, res) => {
    const { username } = req.query;
    const user = await User.findOne({ username: username });
    res.json({ available: !user });
  });

app.post('/api/users/register-guest', async (req, res) => {
  const { username } = req.body;
  const user = new User({ username });
  await user.save();
  res.status(201).json(user);
});



app.get('/api/messages', async (req, res) => {
    const { latestMessageId } = req.query;
    const query = latestMessageId ? { _id: { $gt: latestMessageId } } : {};
    const messages = await Message.find(query).sort({ timestamp: -1 });
    res.json(messages.reverse());
  });


const disconnectTimers = new Map();
io.on('connection',async (socket)  => {
    const USER_INACTIVE = +process.env.USER_INACTIVE || 60 * 1000;
    const userId = socket.handshake.auth.userId;
    socket.userId = userId; 
    console.log('A user connected:', socket.id);

    try {
      const user = await User.findById(userId);
      
      if (!user) {
        console.log('User not found:', socket.id);
        io.emit('userNotFound');
      }
          socket.userId = userId; 
          console.log('A user connected:', socket.id, 'User ID:', userId);
    } catch (error) {
        console.error('Database error:', error);
        socket.disconnect(true);
    }
    
    if (disconnectTimers.has(userId)) {
      clearTimeout(disconnectTimers.get(userId)); 
      disconnectTimers.delete(userId);
      console.log(`User ${userId} reconnected, timer canceled`);
    }

    socket.on('sendMessage', async (message) => {
      try {
        if (message.senderId !== socket.userId) return;
        await Message.updateMany({ seen: false }, { seen: true });
        const newMessage = new Message(message);
        await newMessage.save();
        io.emit('newMessage', newMessage);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
  

    socket.on('markMessageAsSeen', async () => {
      try {
        const updatedMessages = await Message.updateMany(
          { seen: false },
          { seen: true }
        );
        const allMessages = await Message.find();
        io.emit('messagesMarkedAsSeen', allMessages);
      } catch (err) {
        console.error('Error marking messages as seen:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
      if (socket.userId) {
        const timer = setTimeout(async () => {
          await User.findByIdAndDelete(socket.userId);
          disconnectTimers.delete(socket.userId);
          io.emit('userLeft', socket.userId);
          console.log(`Deleted inactive user: ${socket.userId}`);
        }, USER_INACTIVE);
        disconnectTimers.set(socket.userId, timer);
      }
    });
  });
  


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

