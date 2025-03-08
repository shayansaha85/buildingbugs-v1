import buildingbugs from './images/buildingbugslogo.png';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <img 
            src={buildingbugs} 
            alt="BuildingBugs Logo"
            className="h-12 w-auto" 
          />
        </div>
      </div>
    </nav>
  );
}