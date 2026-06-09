const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Dashboard
  getDashboard: () => fetchAPI('/dashboard'),

  // Vehicles
  getVehicles: () => fetchAPI('/vehicles'),
  getVehicle: (id) => fetchAPI(`/vehicles/${id}`),
  createVehicle: (data) => fetchAPI('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (id, data) => fetchAPI(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVehicle: (id) => fetchAPI(`/vehicles/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: () => fetchAPI('/customers'),
  getCustomer: (id) => fetchAPI(`/customers/${id}`),
  createCustomer: (data) => fetchAPI('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => fetchAPI(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => fetchAPI(`/customers/${id}`, { method: 'DELETE' }),

  // Bookings
  getBookings: () => fetchAPI('/bookings'),
  getBookingsFull: () => fetchAPI('/bookings-full'),
  getBooking: (id) => fetchAPI(`/bookings/${id}`),
  createBooking: (data) => fetchAPI('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBooking: (id, data) => fetchAPI(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBooking: (id) => fetchAPI(`/bookings/${id}`, { method: 'DELETE' }),
};
