import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', licenseNumber: ''
  });
  const [error, setError] = useState('');

  const loadCustomers = useCallback(async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch {
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadCustomers);
  }, [loadCustomers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, formData);
      } else {
        await api.createCustomer(formData);
      }
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', licenseNumber: '' });
      loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      licenseNumber: customer.licenseNumber
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.deleteCustomer(id);
      loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading customers...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingCustomer(null);
          setFormData({ name: '', email: '', phone: '', licenseNumber: '' });
          setShowModal(true);
        }}>
          + Add Customer
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        {customers.length === 0 ? (
          <div className="empty-state">
            <p>No customers yet</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add First Customer</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>License Number</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.licenseNumber}</td>
                    <td>{customer.createdAt}</td>
                    <td className="actions">
                      <button className="btn btn-sm" onClick={() => handleEdit(customer)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(customer.id)}>Delete</button>
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
            <h2>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="John Smith" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="john@email.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required placeholder="555-0101" />
              </div>
              <div className="form-group">
                <label>Driver's License Number</label>
                <input type="text" value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} required placeholder="DL123456" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCustomer ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
