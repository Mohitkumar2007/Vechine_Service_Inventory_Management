import { User, Customer, Vehicle, ServiceJob, SparePart, Invoice } from '../types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'John Doe',
  email: 'john@autovantage.com',
  role: 'ADMIN',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces'
};

export const DEMO_USERS = [
  { id: 'u-admin', username: 'admin', password: 'admin123', name: 'Owner Admin', email: 'admin@autovantage.local', role: 'ADMIN', avatar: MOCK_USER.avatar },
  { id: 'u-reception', username: 'reception', password: 'reception123', name: 'Reception Desk', email: 'reception@autovantage.local', role: 'RECEPTION', avatar: '' },
  { id: 'u-mechanic', username: 'mechanic', password: 'mechanic123', name: 'Lead Mechanic', email: 'mechanic@autovantage.local', role: 'MECHANIC', avatar: '' },
  { id: 'u-billing', username: 'billing', password: 'billing123', name: 'Billing Counter', email: 'billing@autovantage.local', role: 'BILLING', avatar: '' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Alice Smith', phone: '555-0101', email: 'alice@example.com', address: '123 Maple St', registeredAt: '2024-01-15' },
  { id: 'c2', name: 'Bob Johnson', phone: '555-0102', email: 'bob@example.com', address: '456 Oak Ave', registeredAt: '2024-02-10' },
  { id: 'c3', name: 'Charlie Brown', phone: '555-0103', email: 'charlie@example.com', address: '789 Pine Rd', registeredAt: '2024-03-05' },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', customerId: 'c1', make: 'Toyota', model: 'Camry', year: 2022, vin: '12345ABCDE', licensePlate: 'ABC-1234' },
  { id: 'v2', customerId: 'c2', make: 'Honda', model: 'Civic', year: 2021, vin: '67890FGHIJ', licensePlate: 'XYZ-5678' },
];

export const MOCK_JOBS: ServiceJob[] = [
  { 
    id: 'j1', 
    vehicleId: 'v1', 
    customerId: 'c1', 
    mechanicId: 'm1', 
    status: 'IN_PROGRESS', 
    description: 'Oil change and brake inspection', 
    parts: [],
    estimatedCost: 150, 
    scheduledAt: '2024-05-15T10:00:00Z' 
  },
  { 
    id: 'j2', 
    vehicleId: 'v2', 
    customerId: 'c2', 
    status: 'PENDING', 
    description: 'Engine diagnostic', 
    parts: [],
    estimatedCost: 80, 
    scheduledAt: '2024-05-15T14:30:00Z' 
  },
];

export const MOCK_PARTS: SparePart[] = [
  { id: 'p1', name: 'Oil Filter', sku: 'OF-100', price: 15, stock: 45, category: 'Maintenance' },
  { id: 'p2', name: 'Brake Pads', sku: 'BP-202', price: 85, stock: 12, category: 'Brakes' },
  { id: 'p3', name: 'Spark Plug', sku: 'SP-001', price: 8, stock: 120, category: 'Engine' },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv1', jobId: 'j1', customerId: 'c1', amount: 165.50, status: 'PAID', createdAt: '2024-05-14T11:00:00Z' },
  { id: 'inv2', jobId: 'j2', customerId: 'c2', amount: 80.00, status: 'UNPAID', createdAt: '2024-05-15T09:00:00Z' },
];
