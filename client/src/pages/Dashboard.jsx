import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, bookingsData] = await Promise.all([
        api.getDashboard(),
        api.getBookingsFull()
      ]);
      setStats(statsData);
      setRecentBookings(bookingsData.slice(-5).reverse());
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadDashboard);
  }, [loadDashboard]);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Vehicles</h3>
          <div className="value">{stats?.totalVehicles || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Available</h3>
          <div className="value">{stats?.availableVehicles || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Rented Out</h3>
          <div className="value">{stats?.rentedVehicles || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Active Bookings</h3>
          <div className="value">{stats?.activeBookings || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Today's Check-ins</h3>
          <div className="value">{stats?.todayCheckIns || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Today's Check-outs</h3>
          <div className="value">{stats?.todayCheckOuts || 0}</div>
        </div>
        <div className="stat-card revenue">
          <h3>Total Revenue</h3>
          <div className="value">${stats?.revenue || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Customers</h3>
          <div className="value">{stats?.totalCustomers || 0}</div>
        </div>
      </div>

      <div className="card">
        <h2>Recent Bookings</h2>
        {recentBookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.customer?.name || 'N/A'}</td>
                    <td>{booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : 'N/A'}</td>
                    <td>{booking.startDate}</td>
                    <td>{booking.endDate}</td>
                    <td><span className={`status ${booking.status}`}>{booking.status}</span></td>
                    <td>${booking.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
