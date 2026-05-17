import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { Layout } from './components/layout/Layout';
import { Toaster } from 'react-hot-toast';

// Pages
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { CustomersPage } from './pages/CustomersPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { JobsPage } from './pages/JobsPage';
import { InventoryPage } from './pages/InventoryPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { ReportsPage } from './pages/ReportsPage';
import { ServiceBookingPage } from './pages/ServiceBookingPage';
import { RoleManagementPage } from './pages/RoleManagementPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-orange-500 font-bold animate-pulse text-2xl uppercase tracking-[0.2em]">AutoVantage</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="appointments" element={<ServiceBookingPage />} />
              <Route path="service-booking" element={<Navigate to="/appointments" replace />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="job-history" element={<Navigate to="/jobs" replace />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="billing" element={<InvoicesPage />} />
              <Route path="revenue" element={<Navigate to="/invoices" replace />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<RoleManagementPage />} />
              
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Routes>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #1e293b',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
