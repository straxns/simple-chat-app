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
.then(() => {
  console.log('Connected to MongoDB');
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

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(204).send(); // No content response
  });

// server.js
app.get('/api/messages', async (req, res) => {
    const { latestMessageId } = req.query;
    const query = latestMessageId ? { _id: { $gt: latestMessageId } } : {};
    const messages = await Message.find(query).sort({ timestamp: -1 });
    res.json(messages.reverse());
  });


app.post('/api/messages', async (req, res) => {
    const { senderId, senderName, content } = req.body;
    const message = new Message({ senderId, senderName, content });
    await message.save();
    io.emit('newMessage', message);
    res.status(201).json(message);
  });


app.patch('/api/messages/:id/seen', async (req, res) => {
    const { id } = req.params;
    const message = await Message.findByIdAndUpdate(
      id,
      { seen: true },
      { new: true }
    );
    io.emit('messageSeen', message);
    res.json(message);
  });


io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
  

    socket.on('sendMessage', async (message) => {
      const newMessage = new Message(message);
      await newMessage.save();
      io.emit('newMessage', newMessage); 
    });
  

    socket.on('markMessageAsSeen', async (messageId) => {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { seen: true },
        { new: true }
      );
      io.emit('messageSeen', updatedMessage);
    });
  
    socket.on('disconnect', async () => {
        console.log('A user disconnected:', socket.id);
        if (socket.userId) {
          await User.findByIdAndDelete(socket.userId);
          io.emit('userLeft', socket.userId);
        }
      });
  });


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

