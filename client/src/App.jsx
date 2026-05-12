import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Vehicles from './pages/Vehicles';
import Customers from './pages/Customers';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="sidebar">
          <div className="logo">
            <h2>🚗 RentalHelper</h2>
          </div>
          <ul className="nav-links">
            <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
            <li><NavLink to="/bookings" className={({ isActive }) => isActive ? 'active' : ''}>Bookings</NavLink></li>
            <li><NavLink to="/vehicles" className={({ isActive }) => isActive ? 'active' : ''}>Vehicles</NavLink></li>
            <li><NavLink to="/customers" className={({ isActive }) => isActive ? 'active' : ''}>Customers</NavLink></li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/customers" element={<Customers />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
