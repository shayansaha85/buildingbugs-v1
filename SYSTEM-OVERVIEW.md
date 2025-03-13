# BuildingBugs: Building Management System Overview

This codebase is a full-stack application for managing building maintenance tickets. It allows administrators to oversee multiple buildings while tenants can create and manage maintenance tickets for their rooms.

## Architecture Overview

The project has a classic client-server architecture:

- **Frontend**: React with TypeScript, using Tailwind CSS for styling
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose ORM

## Backend Structure

### Server (`server/index.js`)
The main server file initializes Express and contains API endpoints for:
- Fetching buildings, rooms, and tickets
- Creating and closing tickets
- User authentication
- User management
- Initializing/updating building configurations

### Models
Four MongoDB models define the data structure:
- **Building** (`models/Building.js`): Contains building information and room references
- **Room** (`models/Room.js`): Represents rooms within buildings and their tickets
- **Ticket** (`models/Ticket.js`): Maintenance requests with details and status
- **User** (`models/User.js`): User accounts with role-based access control

### Configuration
- **buildingsConfig.js**: Contains static configuration for buildings and room counts

## Frontend Structure

### Context Providers
- **AuthContext**: Handles user authentication, session management, and user operations
- **BuildingContext**: Manages building data and ticket operations

### Components
- **Login**: Authentication interface with role selection
- **Buildings**: Dashboard showing all buildings with their status
- **Rooms**: View of rooms in a building and their tickets
- **UserManagement**: Admin interface for managing tenant accounts
- **ProtectedRoute**: Route wrapper to enforce authentication and role-based access
- **Navbar**: Application header
- **Setup**: Initial setup interface (appears unused in active code)

## Key Features

1. **Role-based access control**:
   - Admins can see all buildings and manage users
   - Tenants only see their assigned building and room

2. **Ticket management**:
   - Creation of maintenance tickets with problem details
   - Tracking open/closed status
   - Filtering by status

3. **Building configuration**:
   - Dynamic building configuration with automatic updates
   - Hot-reload of configuration changes

4. **User management**:
   - Admin can create/delete tenant accounts
   - Accounts are tied to specific buildings and rooms

## Data Flow

1. Users authenticate via `/api/auth/login`
2. Based on their role, they see filtered buildings data
3. Tenants can create tickets for their room
4. Admins can view all tickets and manage tenant accounts
5. MongoDB stores the state of buildings, rooms, tickets, and users

The application has well-structured separation of concerns between data management (contexts), UI components, and server-side logic.