import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Assuming you have an authContext file

interface Ticket {
  _id: string;
  roomId: string;
  customerName: string;
  phoneNumber: string;
  problemType: string;
  note: string;
  status: 'open' | 'closed';
  createdAt: string;
  closedAt?: string;
}

interface Room {
  _id: string;
  buildingId: string;
  name: string;
  tickets: Ticket[];
}

interface Building {
  _id: string;
  name: string;
  rooms: Room[];
}

interface BuildingContextType {
  buildings: Building[];
  addTicket: (roomId: string, ticket: Omit<Ticket, '_id' | 'createdAt' | 'status'>) => Promise<void>;
  closeTicket: (roomId: string, ticketId: string) => Promise<void>;
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined);

export function BuildingProvider({ children }: { children: React.ReactNode }) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/buildings');
      const data = await response.json();
      setBuildings(data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const addTicket = async (roomId: string, ticketData: Omit<Ticket, '_id' | 'createdAt' | 'status'>) => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...ticketData, roomId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }
      
      await fetchBuildings();
    } catch (error) {
      console.error('Error adding ticket:', error);
      throw error;
    }
  };

  const closeTicket = async (roomId: string, ticketId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}/close`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Failed to close ticket');
      }
      
      await fetchBuildings();
    } catch (error) {
      console.error('Error closing ticket:', error);
      throw error;
    }
  };

  // Filter buildings based on user role and assigned building
  const filteredBuildings = buildings.filter(building => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return building._id === user.buildingId;
  });

  return (
    <BuildingContext.Provider value={{ 
      buildings: filteredBuildings, 
      addTicket, 
      closeTicket 
    }}>
      {children}
    </BuildingContext.Provider>
  );
}

export function useBuildings() {
  const context = useContext(BuildingContext);
  if (context === undefined) {
    throw new Error('useBuildings must be used within a BuildingProvider');
  }
  return context;
}