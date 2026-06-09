const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '');
const STORAGE_KEY = 'car-rental-helper-demo-data';

const demoData = {
  vehicles: [
    { id: 'v1', make: 'Toyota', model: 'Corolla', year: 2023, licensePlate: 'ABC-123', status: 'available', pricePerDay: 50, category: 'sedan' },
    { id: 'v2', make: 'Honda', model: 'Civic', year: 2023, licensePlate: 'DEF-456', status: 'available', pricePerDay: 55, category: 'sedan' },
    { id: 'v3', make: 'Toyota', model: 'Fortuner', year: 2024, licensePlate: 'GHI-789', status: 'available', pricePerDay: 80, category: 'suv' },
    { id: 'v4', make: 'Suzuki', model: 'Swift', year: 2022, licensePlate: 'JKL-012', status: 'available', pricePerDay: 40, category: 'hatchback' },
    { id: 'v5', make: 'Honda', model: 'HR-V', year: 2024, licensePlate: 'MNO-345', status: 'maintenance', pricePerDay: 65, category: 'suv' },
  ],
  customers: [
    { id: 'c1', name: 'John Smith', email: 'john@email.com', phone: '555-0101', licenseNumber: 'DL123456', createdAt: '2024-01-15' },
    { id: 'c2', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '555-0102', licenseNumber: 'DL789012', createdAt: '2024-02-20' },
    { id: 'c3', name: 'Mike Wilson', email: 'mike@email.com', phone: '555-0103', licenseNumber: 'DL345678', createdAt: '2024-03-10' },
  ],
  bookings: [
    { id: 'b1', customerId: 'c1', vehicleId: 'v4', startDate: '2026-05-10', endDate: '2026-05-15', status: 'completed', totalPrice: 200, notes: '' },
    { id: 'b2', customerId: 'c2', vehicleId: 'v1', startDate: '2026-05-14', endDate: '2026-05-17', status: 'confirmed', totalPrice: 150, notes: 'Airport pickup' },
  ],
};

function makeId(prefix) {
  return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
}

function readDemoData() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) return JSON.parse(savedData);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
  return structuredClone(demoData);
}

function writeDemoData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getBookingDetails(booking, data) {
  const customer = data.customers.find((item) => item.id === booking.customerId);
  const vehicle = data.vehicles.find((item) => item.id === booking.vehicleId);

  return {
    ...booking,
    customer: customer ? { id: customer.id, name: customer.name, phone: customer.phone } : null,
    vehicle: vehicle ? { id: vehicle.id, make: vehicle.make, model: vehicle.model, licensePlate: vehicle.licensePlate } : null,
  };
}

async function fetchAPI(endpoint, options = {}) {
  if (!API_URL) return handleDemoRequest(endpoint, options);

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

async function handleDemoRequest(endpoint, options = {}) {
  const method = options.method || 'GET';
  const data = readDemoData();
  const body = options.body ? JSON.parse(options.body) : {};

  if (endpoint === '/dashboard') {
    const today = new Date().toISOString().split('T')[0];
    return {
      totalVehicles: data.vehicles.length,
      availableVehicles: data.vehicles.filter((vehicle) => vehicle.status === 'available').length,
      rentedVehicles: data.vehicles.filter((vehicle) => vehicle.status === 'rented').length,
      totalCustomers: data.customers.length,
      activeBookings: data.bookings.filter((booking) => booking.status === 'active').length,
      totalBookings: data.bookings.length,
      todayCheckIns: data.bookings.filter((booking) => booking.startDate === today).length,
      todayCheckOuts: data.bookings.filter((booking) => booking.endDate === today).length,
      revenue: data.bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
    };
  }

  if (endpoint === '/bookings-full') return data.bookings.map((booking) => getBookingDetails(booking, data));

  const [, collection, id] = endpoint.split('/');
  if (!['vehicles', 'customers', 'bookings'].includes(collection)) throw new Error('Request failed');

  if (method === 'GET') {
    if (!id) return data[collection];

    const item = data[collection].find((entry) => entry.id === id);
    if (!item) throw new Error(`${collection.slice(0, -1)} not found`);
    return item;
  }

  if (method === 'POST') {
    const prefix = collection[0];
    const item = {
      id: makeId(prefix),
      ...(collection === 'customers' ? { createdAt: new Date().toISOString().split('T')[0] } : {}),
      ...body,
    };

    if (collection === 'bookings') {
      const vehicle = data.vehicles.find((entry) => entry.id === body.vehicleId);
      if (!vehicle) throw new Error('Vehicle not found');

      const start = new Date(body.startDate);
      const end = new Date(body.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      item.status = 'confirmed';
      item.totalPrice = days * vehicle.pricePerDay;
      item.notes = body.notes || '';
      item.createdAt = new Date().toISOString();
      vehicle.status = 'rented';
    }

    data[collection].push(item);
    writeDemoData(data);
    return item;
  }

  if (method === 'PUT') {
    const index = data[collection].findIndex((entry) => entry.id === id);
    if (index === -1) throw new Error(`${collection.slice(0, -1)} not found`);

    const oldItem = data[collection][index];
    if (collection === 'bookings' && ['completed', 'cancelled'].includes(body.status) && !['completed', 'cancelled'].includes(oldItem.status)) {
      const vehicle = data.vehicles.find((entry) => entry.id === oldItem.vehicleId);
      if (vehicle) vehicle.status = 'available';
    }

    data[collection][index] = { ...oldItem, ...body };
    writeDemoData(data);
    return data[collection][index];
  }

  if (method === 'DELETE') {
    const index = data[collection].findIndex((entry) => entry.id === id);
    if (index === -1) throw new Error(`${collection.slice(0, -1)} not found`);

    if (collection === 'bookings') {
      const vehicle = data.vehicles.find((entry) => entry.id === data.bookings[index].vehicleId);
      if (vehicle) vehicle.status = 'available';
    }

    data[collection].splice(index, 1);
    writeDemoData(data);
    return null;
  }

  throw new Error('Request failed');
}

export const api = {
  getDashboard: () => fetchAPI('/dashboard'),

  getVehicles: () => fetchAPI('/vehicles'),
  getVehicle: (id) => fetchAPI(`/vehicles/${id}`),
  createVehicle: (data) => fetchAPI('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (id, data) => fetchAPI(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVehicle: (id) => fetchAPI(`/vehicles/${id}`, { method: 'DELETE' }),

  getCustomers: () => fetchAPI('/customers'),
  getCustomer: (id) => fetchAPI(`/customers/${id}`),
  createCustomer: (data) => fetchAPI('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => fetchAPI(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => fetchAPI(`/customers/${id}`, { method: 'DELETE' }),

  getBookings: () => fetchAPI('/bookings'),
  getBookingsFull: () => fetchAPI('/bookings-full'),
  getBooking: (id) => fetchAPI(`/bookings/${id}`),
  createBooking: (data) => fetchAPI('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBooking: (id, data) => fetchAPI(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBooking: (id) => fetchAPI(`/bookings/${id}`, { method: 'DELETE' }),
};
