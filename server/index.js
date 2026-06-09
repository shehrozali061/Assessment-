const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Initialize data file
const initData = {
  vehicles: [
    { id: 'v1', make: 'Toyota', model: 'Corolla', year: 2023, licensePlate: 'ABC-123', status: 'available', pricePerDay: 50, category: 'sedan' },
    { id: 'v2', make: 'Honda', model: 'Civic', year: 2023, licensePlate: 'DEF-456', status: 'available', pricePerDay: 55, category: 'sedan' },
    { id: 'v3', make: 'Toyota', model: 'Fortuner', year: 2024, licensePlate: 'GHI-789', status: 'available', pricePerDay: 80, category: 'suv' },
    { id: 'v4', make: 'Suzuki', model: 'Swift', year: 2022, licensePlate: 'JKL-012', status: 'rented', pricePerDay: 40, category: 'hatchback' },
    { id: 'v5', make: 'Honda', model: 'HR-V', year: 2024, licensePlate: 'MNO-345', status: 'maintenance', pricePerDay: 65, category: 'suv' },
  ],
  customers: [
    { id: 'c1', name: 'John Smith', email: 'john@email.com', phone: '555-0101', licenseNumber: 'DL123456', createdAt: '2024-01-15' },
    { id: 'c2', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '555-0102', licenseNumber: 'DL789012', createdAt: '2024-02-20' },
    { id: 'c3', name: 'Mike Wilson', email: 'mike@email.com', phone: '555-0103', licenseNumber: 'DL345678', createdAt: '2024-03-10' },
  ],
  bookings: [
    { id: 'b1', customerId: 'c1', vehicleId: 'v4', startDate: '2026-05-10', endDate: '2026-05-15', status: 'active', totalPrice: 200, notes: '' },
    { id: 'b2', customerId: 'c2', vehicleId: 'v1', startDate: '2026-05-14', endDate: '2026-05-17', status: 'confirmed', totalPrice: 150, notes: 'Airport pickup' },
  ]
};

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initData, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Vehicles API
app.get('/api/vehicles', (req, res) => {
  const data = readData();
  res.json(data.vehicles);
});

app.get('/api/vehicles/:id', (req, res) => {
  const data = readData();
  const vehicle = data.vehicles.find(v => v.id === req.params.id);
  vehicle ? res.json(vehicle) : res.status(404).json({ error: 'Vehicle not found' });
});

app.post('/api/vehicles', (req, res) => {
  const data = readData();
  const vehicle = { id: uuidv4(), ...req.body };
  data.vehicles.push(vehicle);
  writeData(data);
  res.status(201).json(vehicle);
});

app.put('/api/vehicles/:id', (req, res) => {
  const data = readData();
  const index = data.vehicles.findIndex(v => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Vehicle not found' });
  data.vehicles[index] = { ...data.vehicles[index], ...req.body };
  writeData(data);
  res.json(data.vehicles[index]);
});

app.delete('/api/vehicles/:id', (req, res) => {
  const data = readData();
  const index = data.vehicles.findIndex(v => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Vehicle not found' });
  data.vehicles.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

// Customers API
app.get('/api/customers', (req, res) => {
  const data = readData();
  res.json(data.customers);
});

app.get('/api/customers/:id', (req, res) => {
  const data = readData();
  const customer = data.customers.find(c => c.id === req.params.id);
  customer ? res.json(customer) : res.status(404).json({ error: 'Customer not found' });
});

app.post('/api/customers', (req, res) => {
  const data = readData();
  const customer = { id: uuidv4(), createdAt: new Date().toISOString().split('T')[0], ...req.body };
  data.customers.push(customer);
  writeData(data);
  res.status(201).json(customer);
});

app.put('/api/customers/:id', (req, res) => {
  const data = readData();
  const index = data.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Customer not found' });
  data.customers[index] = { ...data.customers[index], ...req.body };
  writeData(data);
  res.json(data.customers[index]);
});

app.delete('/api/customers/:id', (req, res) => {
  const data = readData();
  const index = data.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Customer not found' });
  data.customers.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

// Bookings API
app.get('/api/bookings', (req, res) => {
  const data = readData();
  res.json(data.bookings);
});

app.get('/api/bookings/:id', (req, res) => {
  const data = readData();
  const booking = data.bookings.find(b => b.id === req.params.id);
  booking ? res.json(booking) : res.status(404).json({ error: 'Booking not found' });
});

app.post('/api/bookings', (req, res) => {
  const data = readData();
  const { customerId, vehicleId, startDate, endDate, notes } = req.body;

  // Calculate total price
  const vehicle = data.vehicles.find(v => v.id === vehicleId);
  if (!vehicle) return res.status(400).json({ error: 'Vehicle not found' });

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const totalPrice = days * vehicle.pricePerDay;

  const booking = {
    id: uuidv4(),
    customerId,
    vehicleId,
    startDate,
    endDate,
    status: 'confirmed',
    totalPrice,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  data.bookings.push(booking);

  // Update vehicle status
  const vehicleIndex = data.vehicles.findIndex(v => v.id === vehicleId);
  if (vehicleIndex !== -1) {
    data.vehicles[vehicleIndex].status = 'rented';
  }

  writeData(data);
  res.status(201).json(booking);
});

app.put('/api/bookings/:id', (req, res) => {
  const data = readData();
  const index = data.bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Booking not found' });

  const oldBooking = data.bookings[index];

  // If status changed to completed/cancelled, free up the vehicle
  if (['completed', 'cancelled'].includes(req.body.status) && !['completed', 'cancelled'].includes(oldBooking.status)) {
    const vehicleIndex = data.vehicles.findIndex(v => v.id === oldBooking.vehicleId);
    if (vehicleIndex !== -1) {
      data.vehicles[vehicleIndex].status = 'available';
    }
  }

  data.bookings[index] = { ...oldBooking, ...req.body };
  writeData(data);
  res.json(data.bookings[index]);
});

app.delete('/api/bookings/:id', (req, res) => {
  const data = readData();
  const index = data.bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Booking not found' });

  // Free up vehicle
  const booking = data.bookings[index];
  const vehicleIndex = data.vehicles.findIndex(v => v.id === booking.vehicleId);
  if (vehicleIndex !== -1) {
    data.vehicles[vehicleIndex].status = 'available';
  }

  data.bookings.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

// Dashboard stats
app.get('/api/dashboard', (req, res) => {
  const data = readData();
  const today = new Date().toISOString().split('T')[0];

  const stats = {
    totalVehicles: data.vehicles.length,
    availableVehicles: data.vehicles.filter(v => v.status === 'available').length,
    rentedVehicles: data.vehicles.filter(v => v.status === 'rented').length,
    totalCustomers: data.customers.length,
    activeBookings: data.bookings.filter(b => b.status === 'active').length,
    totalBookings: data.bookings.length,
    todayCheckIns: data.bookings.filter(b => b.startDate === today).length,
    todayCheckOuts: data.bookings.filter(b => b.endDate === today).length,
    revenue: data.bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  };

  res.json(stats);
});

// Combined booking with customer and vehicle details
app.get('/api/bookings-full', (req, res) => {
  const data = readData();
  const fullBookings = data.bookings.map(booking => {
    const customer = data.customers.find(c => c.id === booking.customerId);
    const vehicle = data.vehicles.find(v => v.id === booking.vehicleId);
    return {
      ...booking,
      customer: customer ? { id: customer.id, name: customer.name, phone: customer.phone } : null,
      vehicle: vehicle ? { id: vehicle.id, make: vehicle.make, model: vehicle.model, licensePlate: vehicle.licensePlate } : null
    };
  });
  res.json(fullBookings);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
