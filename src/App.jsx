import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';


import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Admin Pages
import AdminDashboard from './features/admin/pages/AdminDashboard';
import UserManagement from './features/admin/pages/UserManagement';
import Approvals from './features/admin/pages/Approvals';
import AuditLogs from './features/admin/pages/AuditLogs';
import FinancialAnalytics from './features/admin/pages/FinancialAnalytics';
import ProductionEfficiency from './features/admin/pages/ProductionEfficiency';
import SalaryManagement from './features/admin/pages/SalaryManagement';

// Manager Pages
import ManagerDashboard from './features/manager/pages/ManagerDashboard';
import TaskAssignment from './features/manager/pages/TaskAssignment';
import DeadlineMonitoring from './features/manager/pages/DeadlineMonitoring';

// Worker Pages
import AssignedTasks from './features/worker/pages/AssignedTasks';
import TaskDetail from './features/worker/pages/TaskDetail';

// Inventory Pages
import InventoryDashboard from './features/inventory/pages/InventoryDashboard';
import RawMaterialList from './features/inventory/pages/RawMaterialList';
import MaterialUsageLogs from './features/inventory/pages/MaterialUsageLogs';

// Sales Pages
import SalesDashboard from './features/sales/pages/SalesDashboard';
import OrderManagement from './features/sales/pages/OrderManagement';
import OrderDetail from './features/sales/pages/OrderDetail';
import MySalary from './features/common/pages/MySalary';

function App() {
  const dispatch = useDispatch();

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#334155',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />

        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          {/* Default Route */}
          <Route index element={<Navigate to="/admin" replace />} />
          
          {/* Admin Routes */}
          <Route path="admin">
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="financials" element={<FinancialAnalytics />} />
            <Route path="efficiency" element={<ProductionEfficiency />} />
            <Route path="salaries" element={<SalaryManagement />} />
          </Route>

          {/* Manager Routes */}
          <Route path="manager">
            <Route index element={<ManagerDashboard />} />
            <Route path="tasks" element={<TaskAssignment />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="salary" element={<MySalary />} />
            <Route path="deadlines" element={<DeadlineMonitoring />} />
          </Route>

          {/* Worker Routes */}
          <Route path="worker">
            <Route index element={<Navigate to="/worker/tasks" replace />} />
            <Route path="tasks" element={<AssignedTasks />} />
            <Route path="tasks/:id" element={<TaskDetail />} />
            <Route path="salary" element={<MySalary />} />
            <Route path="approvals" element={<Approvals />} />
          </Route>

          {/* Inventory Routes */}
          <Route path="inventory">
            <Route index element={<InventoryDashboard />} />
            <Route path="stock" element={<RawMaterialList />} />
            <Route path="salary" element={<MySalary />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="logs" element={<MaterialUsageLogs />} />
          </Route>

          {/* Sales Routes */}
          <Route path="sales">
            <Route index element={<SalesDashboard />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="salary" element={<MySalary />} />
            <Route path="approvals" element={<Approvals />} />
          </Route>

          <Route path="welcome" element={<Welcome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
