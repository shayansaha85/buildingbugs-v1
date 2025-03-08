import { useNavigate } from 'react-router-dom';
import { useBuildings } from '../contexts/BuildingContext';
import { useAuth } from '../contexts/AuthContext';
import { Building as BuildingIcon, LogOut, Search, Filter, UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function Buildings() {
  const { buildings } = useBuildings();
  const { signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'withIssues' | 'noIssues'>('all');

  const handleBuildingClick = (buildingId: string) => {
    navigate(`/buildings/${buildingId}/rooms`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getBuildingStatus = (building: any) => {
    return building.rooms.some((room: any) => 
      room.tickets.some((ticket: any) => ticket.status === 'open')
    );
  };

  const filteredBuildings = buildings
    .filter(building =>
      building.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(building => {
      if (filter === 'all') return true;
      const hasIssues = getBuildingStatus(building);
      return filter === 'withIssues' ? hasIssues : !hasIssues;
    });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <BuildingIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Buildings Overview</h1>
          </div>
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <button
                onClick={() => navigate('/users')}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                User Management
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-2 items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search buildings..."
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
            <BuildingIcon className="h-5 w-5 mr-2" />
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
            <BuildingIcon className="h-5 w-5 mr-2" />
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
          {filteredBuildings.map((building) => {
            const hasOpenTickets = getBuildingStatus(building);
            return (
              <button
                key={building._id}
                onClick={() => handleBuildingClick(building._id)}
                className={`p-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 ${
                  hasOpenTickets
                    ? 'bg-red-100 hover:bg-red-200'
                    : 'bg-green-100 hover:bg-green-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {building.name}
                  </h2>
                  <BuildingIcon className={`h-6 w-6 ${
                    hasOpenTickets ? 'text-red-600' : 'text-green-600'
                  }`} />
                </div>
                <div className="text-sm text-gray-600">
                  <p>{building.rooms.length} Rooms</p>
                  <p>
                    {building.rooms.reduce(
                      (count, room) => count + room.tickets.filter(ticket => ticket.status === 'open').length,
                      0
                    )} Open Tickets
                  </p>
                </div>
                {isAdmin && hasOpenTickets && (
                  <div className="mt-4 text-sm text-red-600 font-medium">
                    Requires Attention
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}