# Car Rental Helper - Booking Management System

A web-based booking management system for car rental operators.

## Features

- **Dashboard** - Overview of fleet status, today's activity, and revenue
- **Booking Management** - Create, view, edit, and manage bookings with check-in/check-out workflow
- **Vehicle Inventory** - Track vehicles with availability status
- **Customer Management** - Maintain customer records with contact info

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Storage**: JSON file (no database setup required)

## Getting Started

### 1. Start the Backend Server

```bash
cd car-rental-helper/server
npm start
```

Server runs on http://localhost:3001

### 2. Start the Frontend

```bash
cd car-rental-helper/client
npm run dev
```

Frontend runs on http://localhost:5173

## Usage

1. **Add Vehicles** - Go to Vehicles tab and add your fleet
2. **Add Customers** - Go to Customers tab and add customer records
3. **Create Bookings** - Go to Bookings and create new reservations
4. **Manage Status** - Check-in, complete, or cancel bookings from the bookings list

## Sample Data

The system comes pre-loaded with sample vehicles, customers, and bookings to help you get started.

## API Endpoints

- `GET /api/dashboard` - Dashboard statistics
- `GET/POST /api/vehicles` - Vehicle CRUD
- `GET/POST /api/customers` - Customer CRUD
- `GET/POST /api/bookings` - Booking CRUD
- `GET /api/bookings-full` - Bookings with customer/vehicle details
