import mongoose from 'mongoose';

const buildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }]
});

export const Building = mongoose.model('Building', buildingSchema);