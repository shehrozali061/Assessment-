import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '', vehicleId: '', startDate: '', endDate: '', notes: ''
  });
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [bookingsData, customersData, vehiclesData] = await Promise.all([
        api.getBookingsFull(),
        api.getCustomers(),
        api.getVehicles()
      ]);
      setBookings(bookingsData);
      setCustomers(customersData);
      setVehicles(vehiclesData);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadData);
  }, [loadData]);

  const availableVehicles = vehicles.filter(v => v.status === 'available');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingBooking) {
        await api.updateBooking(editingBooking.id, formData);
      } else {
        await api.createBooking(formData);
      }
      setShowModal(false);
      setEditingBooking(null);
      setFormData({ customerId: '', vehicleId: '', startDate: '', endDate: '', notes: '' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setFormData({
      customerId: booking.customerId,
      vehicleId: booking.vehicleId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      notes: booking.notes || ''
    });
    setShowModal(true);
  };

  const handleStatusChange = async (booking, newStatus) => {
    try {
      await api.updateBooking(booking.id, { status: newStatus });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      await api.deleteBooking(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Bookings</h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingBooking(null);
          setFormData({ customerId: '', vehicleId: '', startDate: '', endDate: '', notes: '' });
          setShowModal(true);
        }}>
          + New Booking
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings yet</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create First Booking</button>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.customer?.name || 'N/A'}<br/><small>{booking.customer?.phone}</small></td>
                    <td>{booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : 'N/A'}<br/><small>{booking.vehicle?.licensePlate}</small></td>
                    <td>{booking.startDate}</td>
                    <td>{booking.endDate}</td>
                    <td><span className={`status ${booking.status}`}>{booking.status}</span></td>
                    <td>${booking.totalPrice}</td>
                    <td className="actions">
                      {booking.status === 'confirmed' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(booking, 'active')}>Check In</button>
                      )}
                      {booking.status === 'active' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(booking, 'completed')}>Complete</button>
                      )}
                      {(booking.status === 'confirmed' || booking.status === 'active') && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(booking, 'cancelled')}>Cancel</button>
                      )}
                      <Link className="btn btn-sm" to={`/bookings/${booking.id}`}>View</Link>
                      <button className="btn btn-sm" onClick={() => handleEdit(booking)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(booking.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingBooking ? 'Edit Booking' : 'New Booking'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer</label>
                <select value={formData.customerId} onChange={(e) => setFormData({...formData, customerId: e.target.value})} required>
                  <option value="">Select customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Vehicle</label>
                <select value={formData.vehicleId} onChange={(e) => setFormData({...formData, vehicleId: e.target.value})} required disabled={editingBooking}>
                  <option value="">Select vehicle</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} - {v.licensePlate} (${v.pricePerDay}/day)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="3" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingBooking ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
