/*
  # Initial Schema Setup for Building Management System

  1. New Tables
    - buildings
      - id (uuid, primary key)
      - name (text)
      - status (text)
      - created_at (timestamp)
    
    - rooms
      - id (uuid, primary key)
      - building_id (uuid, foreign key)
      - name (text)
      - status (text)
      - created_at (timestamp)
    
    - tickets
      - id (uuid, primary key)
      - room_id (uuid, foreign key)
      - customer_id (uuid, foreign key)
      - customer_name (text)
      - phone_number (text)
      - problem_type (text)
      - note (text)
      - status (text)
      - created_at (timestamp)
      - closed_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create buildings table
CREATE TABLE buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text DEFAULT 'green' CHECK (status IN ('green', 'red')),
  created_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  name text NOT NULL,
  status text DEFAULT 'green' CHECK (status IN ('green', 'red')),
  created_at timestamptz DEFAULT now()
);

-- Create tickets table
CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id),
  customer_id uuid REFERENCES auth.users(id),
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  problem_type text NOT NULL,
  note text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policies for buildings
CREATE POLICY "Buildings are viewable by all authenticated users"
  ON buildings FOR SELECT
  TO authenticated
  USING (true);

-- Policies for rooms
CREATE POLICY "Rooms are viewable by all authenticated users"
  ON rooms FOR SELECT
  TO authenticated
  USING (true);

-- Policies for tickets
CREATE POLICY "Customers can create tickets"
  ON tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can view their own tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id OR 
         EXISTS (
           SELECT 1 FROM auth.users 
           WHERE auth.uid() = id 
           AND raw_user_meta_data->>'role' = 'admin'
         ));

CREATE POLICY "Customers can update their own tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- Insert initial data
INSERT INTO buildings (name) VALUES
  ('Building A'),
  ('Building B'),
  ('Building C');

-- Insert rooms for each building
INSERT INTO rooms (building_id, name)
SELECT 
  b.id,
  'Room ' || r.num
FROM buildings b
CROSS JOIN (SELECT generate_series(1, 5) as num) r;