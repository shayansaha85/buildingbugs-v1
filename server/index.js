import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { watch } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Building } from './models/Building.js';
import { Room } from './models/Room.js';
import { Ticket } from './models/Ticket.js';
import { buildingsConfig } from './config/buildingsConfig.js';
import { User } from './models/User.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Get all buildings with rooms and tickets
app.get('/api/buildings', async (req, res) => {
  try {
    const buildings = await Building.find().populate({
      path: 'rooms',
      populate: {
        path: 'tickets'
      }
    });
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { roomId, customerName, phoneNumber, problemType, note } = req.body;
    const ticket = new Ticket({
      roomId,
      customerName,
      phoneNumber,
      problemType,
      note,
      status: 'open',
      createdAt: new Date()
    });
    await ticket.save();
    
    const room = await Room.findById(roomId);
    room.tickets.push(ticket._id);
    await room.save();
    
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Close a ticket
app.patch('/api/tickets/:ticketId/close', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    ticket.status = 'closed';
    ticket.closedAt = new Date();
    await ticket.save();
    
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// User authentication and management
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password })
      .populate('buildingId', 'name')
      .populate('roomId', 'name');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      id: user._id,
      username: user.username,
      role: user.role,
      buildingId: user.buildingId?._id,
      roomId: user.roomId?._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, password, buildingId, roomId } = req.body;
    const user = new User({
      username,
      password,
      role: 'customer',
      buildingId,
      roomId
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' })
      .populate('buildingId', 'name')
      .populate('roomId', 'name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/users/:userId', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize static data if database is empty
async function initializeStaticData(config = buildingsConfig) {
  try {
    const configToUse = config;
    
    // Get existing buildings with their rooms and tickets
    const existingBuildings = await Building.find().populate({
      path: 'rooms',
      populate: { path: 'tickets' }
    });

    // Create a map of existing buildings and their rooms/tickets
    const existingBuildingsMap = new Map();
    existingBuildings.forEach(building => {
      existingBuildingsMap.set(building.name, {
        id: building._id,
        rooms: building.rooms
      });
    });

    // Process each building in the config
    for (const buildingConfig of configToUse) {
      const existingBuilding = existingBuildingsMap.get(buildingConfig.name);
      
      if (!existingBuilding) {
        // Create new building if it doesn't exist
        const newBuilding = new Building({ 
          name: buildingConfig.name,
          rooms: []
        });
        const savedBuilding = await newBuilding.save();

        // Create rooms for new building
        for (let i = 0; i < buildingConfig.roomCount; i++) {
          const room = new Room({
            buildingId: savedBuilding._id,
            name: `Flat ${i + 1}`,
            tickets: []
          });
          const savedRoom = await room.save();
          savedBuilding.rooms.push(savedRoom._id);
        }
        await savedBuilding.save();
      } else if (existingBuilding.rooms.length !== buildingConfig.roomCount) {
        // Update existing building if room count changed
        await Room.deleteMany({ buildingId: existingBuilding.id });
        const roomIds = [];

        // Create new rooms while preserving existing tickets
        for (let i = 0; i < buildingConfig.roomCount; i++) {
          const oldRoom = existingBuilding.rooms[i];
          const room = new Room({
            buildingId: existingBuilding.id,
            name: `Flat ${i + 1}`,
            tickets: oldRoom ? oldRoom.tickets : []
          });
          const savedRoom = await room.save();
          roomIds.push(savedRoom._id);
        }

        // Update building with new rooms
        await Building.findByIdAndUpdate(
          existingBuilding.id,
          { $set: { rooms: roomIds } },
          { new: true }
        );
      }
    }

    // Remove buildings that are no longer in config
    const configBuildingNames = configToUse.map(b => b.name);
    await Building.deleteMany({
      name: { $nin: configBuildingNames }
    });

    console.log('Buildings configuration updated successfully');
  } catch (error) {
    console.error('Error initializing static data:', error);
    throw error;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'config', 'buildingsConfig.js');

let isInitializing = false;

// Modified file watcher
watch(configPath, async (eventType) => {
  if (eventType === 'change' && !isInitializing) {
    console.log('Buildings configuration changed, reinitializing...');
    try {
      isInitializing = true;
      // Re-import the configuration using dynamic import with cache busting
      const updatedConfig = await import(`./config/buildingsConfig.js?update=${Date.now()}`);
      await initializeStaticData(updatedConfig.buildingsConfig);
      console.log('Buildings reinitialized successfully');
    } catch (error) {
      console.error('Error reinitializing buildings:', error);
    } finally {
      isInitializing = false;
    }
  }
});

// Server startup
const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    isInitializing = true;
    await initializeStaticData();
    console.log('Initial buildings configuration completed');
  } catch (error) {
    console.error('Error during initial setup:', error);
  } finally {
    isInitializing = false;
    console.log('Watching for changes in buildings configuration...');
  }
});