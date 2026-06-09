import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/api';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    make: '', model: '', year: '', licensePlate: '', pricePerDay: '', category: 'sedan', status: 'available'
  });
  const [error, setError] = useState('');

  const loadVehicles = useCallback(async () => {
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } catch {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadVehicles);
  }, [loadVehicles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...formData, year: parseInt(formData.year), pricePerDay: parseFloat(formData.pricePerDay) };
      if (editingVehicle) {
        await api.updateVehicle(editingVehicle.id, payload);
      } else {
        await api.createVehicle(payload);
      }
      setShowModal(false);
      setEditingVehicle(null);
      setFormData({ make: '', model: '', year: '', licensePlate: '', pricePerDay: '', category: 'sedan', status: 'available' });
      loadVehicles();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      licensePlate: vehicle.licensePlate,
      pricePerDay: vehicle.pricePerDay.toString(),
      category: vehicle.category,
      status: vehicle.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await api.deleteVehicle(id);
      loadVehicles();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading vehicles...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Vehicles</h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingVehicle(null);
          setFormData({ make: '', model: '', year: '', licensePlate: '', pricePerDay: '', category: 'sedan', status: 'available' });
          setShowModal(true);
        }}>
          + Add Vehicle
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        {vehicles.length === 0 ? (
          <div className="empty-state">
            <p>No vehicles yet</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add First Vehicle</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>License Plate</th>
                  <th>Category</th>
                  <th>Year</th>
                  <th>Price/Day</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(vehicle => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.make} {vehicle.model}</td>
                    <td>{vehicle.licensePlate}</td>
                    <td style={{textTransform: 'capitalize'}}>{vehicle.category}</td>
                    <td>{vehicle.year}</td>
                    <td>${vehicle.pricePerDay}</td>
                    <td><span className={`status ${vehicle.status}`}>{vehicle.status}</span></td>
                    <td className="actions">
                      <button className="btn btn-sm" onClick={() => handleEdit(vehicle)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vehicle.id)}>Delete</button>
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
            <h2>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Make</label>
                <input type="text" value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value})} required placeholder="e.g., Toyota" />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} required placeholder="e.g., Corolla" />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required min="1990" max="2030" />
              </div>
              <div className="form-group">
                <label>License Plate</label>
                <input type="text" value={formData.licensePlate} onChange={(e) => setFormData({...formData, licensePlate: e.target.value})} required placeholder="e.g., ABC-123" />
              </div>
              <div className="form-group">
                <label>Price per Day ($)</label>
                <input type="number" value={formData.pricePerDay} onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} required min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="truck">Truck</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required>
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingVehicle ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehicles;
