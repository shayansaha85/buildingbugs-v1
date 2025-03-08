import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBuildings } from '../contexts/BuildingContext';
import { useAuth } from '../contexts/AuthContext';
import { DoorOpen as Door, ArrowLeft, Plus, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Ticket {
  _id: string;
  customerName: string;
  phoneNumber: string;
  problemType: string;
  note: string;
  status: 'open' | 'closed';
}

interface Room {
  _id: string;
  name: string;
  tickets: Ticket[];
}

const PROBLEM_TYPES = [
  'Electrical Issue',
  'Plumbing Problem',
  'HVAC Malfunction',
  'Security Concern',
  'Maintenance Required',
  'Cleaning Needed',
  'Internet/Network Issue',
  'Other'
];

export default function Rooms() {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const { buildings, addTicket, closeTicket } = useBuildings();
  const { user, isAdmin } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'withIssues' | 'noIssues'>('all');
  const [ticketForm, setTicketForm] = useState({
    customerName: '',
    phoneNumber: '',
    problemType: PROBLEM_TYPES[0],
    note: ''
  });

  const building = buildings.find(b => b._id === buildingId);
  if (!building) return <div>Building not found</div>;

  // Modified filtering logic for rooms
  const filteredRooms = building.rooms.filter((room: Room) => {
    if (!user) return false;
    if (isAdmin) return true;
    // For customers, check if this room is assigned to them
    return user.roomId === room._id;
  });

  // Debug log to check filtered rooms
  console.log('Filtered Rooms:', filteredRooms);
  console.log('User:', user);

  const displayedRooms = filteredRooms.filter((room: Room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const hasIssues = room.tickets.some(ticket => ticket.status === 'open');

    switch (filter) {
      case 'withIssues':
        return matchesSearch && hasIssues;
      case 'noIssues':
        return matchesSearch && !hasIssues;
      default:
        return matchesSearch;
    }
  });

  const handleBack = () => {
    navigate('/buildings');
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    try {
      await addTicket(selectedRoom, ticketForm);
      setSelectedRoom(null);
      setTicketForm({
        customerName: '',
        phoneNumber: '',
        problemType: PROBLEM_TYPES[0],
        note: ''
      });
      toast.success('Ticket created successfully');
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  const handleCloseTicket = async (roomId: string, ticketId: string) => {
    try {
      await closeTicket(roomId, ticketId);
      toast.success('Ticket closed successfully');
    } catch (error) {
      toast.error('Failed to close ticket');
    }
  };

  const getRoomStatus = (room: Room) => {
    return room.tickets.some(ticket => ticket.status === 'open');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Buildings
          </button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Door className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">{building.name} - Rooms</h1>
          </div>
        </div>

        <div className="mb-6 flex gap-2 items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <button
            onClick={() => setFilter('withIssues')}
            className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
              filter === 'withIssues'
                ? 'bg-red-100 border-red-300 text-red-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-red-50'
            }`}
          >
            <Door className="h-5 w-5 mr-2" />
            With Issues
          </button>

          <button
            onClick={() => setFilter('noIssues')}
            className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
              filter === 'noIssues'
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50'
            }`}
          >
            <Door className="h-5 w-5 mr-2" />
            No Issues
          </button>

          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="flex items-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 mr-2" />
              Clear Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRooms.map((room) => {
            const hasOpenTickets = getRoomStatus(room);
            return (
              <div
                key={room._id}
                className={`p-6 rounded-lg shadow-md ${
                  hasOpenTickets ? 'bg-red-100' : 'bg-green-100'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {room.name}
                  </h2>
                  <Door className={`h-6 w-6 ${
                    hasOpenTickets ? 'text-red-600' : 'text-green-600'
                  }`} />
                </div>

                {room.tickets
                  .filter(ticket => ticket.status === 'open')
                  .map(ticket => (
                    <div
                      key={ticket._id}
                      className="mb-4 p-3 bg-white rounded-md shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{ticket.problemType}</p>
                          <p className="text-sm text-gray-600">{ticket.customerName}</p>
                          <p className="text-sm text-gray-600">{ticket.phoneNumber}</p>
                          <p className="text-sm text-gray-700 mt-1">{ticket.note}</p>
                        </div>
                        {!isAdmin && user && user.roomId === room._id && (
                          <button
                            onClick={() => handleCloseTicket(room._id, ticket._id)}
                            className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                          >
                            Close Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                {!isAdmin && !selectedRoom && (
                  <button
                    onClick={() => setSelectedRoom(room._id)}
                    className="mt-4 flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket
                  </button>
                )}

                {!isAdmin && selectedRoom === room._id && (
                  <form onSubmit={handleSubmitTicket} className="mt-4 space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={ticketForm.customerName}
                        onChange={(e) => setTicketForm({ ...ticketForm, customerName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={ticketForm.phoneNumber}
                        onChange={(e) => setTicketForm({ ...ticketForm, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <select
                        value={ticketForm.problemType}
                        onChange={(e) => setTicketForm({ ...ticketForm, problemType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {PROBLEM_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <textarea
                        placeholder="Description of the problem"
                        value={ticketForm.note}
                        onChange={(e) => setTicketForm({ ...ticketForm, note: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                      >
                        Submit Ticket
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRoom(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}