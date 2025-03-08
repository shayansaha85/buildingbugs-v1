import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  problemType: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date
  }
});

export const Ticket = mongoose.model('Ticket', ticketSchema);