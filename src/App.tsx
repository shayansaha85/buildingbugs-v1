import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Buildings from './components/Buildings';
import Rooms from './components/Rooms';
import { AuthProvider } from './contexts/AuthContext';
import { BuildingProvider } from './contexts/BuildingContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/navbar'
import UserManagement from './components/UserManagement';

function App() {
  return (
    <AuthProvider>
      <BuildingProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/buildings"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <Buildings />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buildings/:buildingId/rooms"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <Rooms />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute adminOnly>
                    <Navbar />
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </BuildingProvider>
    </AuthProvider>
  );
}

export default App;