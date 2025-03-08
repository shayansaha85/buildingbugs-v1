import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuildings } from '../contexts/BuildingContext';
import { Building } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Setup() {
  const [buildingCount, setBuildingCount] = useState(3);
  const [roomsPerBuilding, setRoomsPerBuilding] = useState(5);
  const { initializeBuildings } = useBuildings();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initializeBuildings(buildingCount, roomsPerBuilding);
    toast.success('Buildings initialized successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <Building className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Setup Buildings
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="buildingCount" className="block text-sm font-medium text-gray-700">
                Number of Buildings
              </label>
              <input
                type="number"
                id="buildingCount"
                min="1"
                max="10"
                value={buildingCount}
                onChange={(e) => setBuildingCount(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="roomsPerBuilding" className="block text-sm font-medium text-gray-700">
                Rooms per Building
              </label>
              <input
                type="number"
                id="roomsPerBuilding"
                min="1"
                max="20"
                value={roomsPerBuilding}
                onChange={(e) => setRoomsPerBuilding(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Initialize Buildings
          </button>
        </form>
      </div>
    </div>
  );
}