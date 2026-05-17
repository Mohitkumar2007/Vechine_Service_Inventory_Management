export type UserRole = 'ADMIN' | 'RECEPTION' | 'MECHANIC' | 'BILLING';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  registeredAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
}

export type ServiceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ServiceJob {
  id: string;
  vehicleId: string;
  customerId: string;
  mechanicId?: string;
  status: ServiceStatus;
  description: string;
  parts: SparePartUsage[];
  estimatedCost: number;
  actualCost?: number;
  scheduledAt: string;
  completedAt?: string;
}

export interface SparePart {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

export interface SparePartUsage {
  partId: string;
  quantity: number;
  priceAtTime: number;
}

export interface Invoice {
  id: string;
  jobId: string;
  customerId: string;
  amount: number;
  status: 'PAID' | 'UNPAID';
  createdAt: string;
}
