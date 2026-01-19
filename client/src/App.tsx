import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  DoorClosed,
  Users,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Layers,
  Zap,
  Bed,
  Wrench,
  Wallet,
  Shield,
  History
} from 'lucide-react';

// Pages
import LoginPage from './pages/LoginPage';
import BranchesPage from './pages/BranchesPage';
import RoomsPage from './pages/RoomsPage';
import TenantsPage from './pages/TenantsPage';
import LeasesPage from './pages/LeasesPage';
import ReportsPage from './pages/ReportsPage';
import MetersPage from './pages/MetersPage';
import DailyStaysPage from './pages/DailyStaysPage';
import SettingsPage from './pages/SettingsPage';
import MaintenancePage from './pages/MaintenancePage';
import StaffPage from './pages/StaffPage';
import ExpensesPage from './pages/ExpensesPage';
import AuditLogsPage from './pages/AuditLogsPage';

// Components
import PaymentReview from './components/PaymentReview';
import StatsCard from './components/StatsCard';

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const Dashboard = () => (
  <div className="dashboard-view fade-in">
    <div className="stats-grid">
      <StatsCard title="Total Revenue" value="฿245,000" icon={CreditCard} color="#4f46e5" trend="+12.5%" trendUp />
      <StatsCard title="Occupancy Rate" value="92%" icon={Building2} color="#10b981" trend="+2.4%" trendUp />
      <StatsCard title="Active Tenants" value="124" icon={Users} color="#f59e0b" />
      <StatsCard title="Pending Slips" value="8" icon={FileText} color="#ef4444" trend="Action required" />
    </div>

    <div className="grid-2 mt-2">
      <div className="card">
        <h3>Revenue Trend</h3>
        <div className="chart-placeholder">
          <div className="mock-chart-bar">
            {[30, 45, 60, 25, 80, 50, 90, 65, 75, 55, 85, 95].map((h, i) => <div key={i} className="bar" style={{ height: `${h}%` }}></div>)}
          </div>
          <div className="chart-labels">
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Dec</span>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>System Status</h3>
        <div className="stats-list">
          <div className="flex-center-gap text-xs"><Wrench size={14} className="text-error" /> 12 Pending repairs</div>
          <div className="flex-center-gap text-xs"><Zap size={14} className="text-warning" /> Meter readings due today</div>
          <div className="flex-center-gap text-xs"><FileText size={14} className="text-primary" /> 2 Leases expiring this week</div>
          <div className="flex-center-gap text-xs"><History size={14} className="text-muted" /> Last backup: 2 hours ago</div>
        </div>
      </div>
    </div>
  </div>
);

const Layout = ({ children, onLogout }: { children: React.ReactNode, onLogout: () => void }) => {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Layers className="logo-icon" />
          <span>RentCore</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-group-label">OVERVIEW</div>
          <SidebarItem to="/" icon={BarChart3} label="Dashboard" />
          <SidebarItem to="/reports" icon={BarChart3} label="Analytics" />

          <div className="sidebar-group-label">OPERATIONS</div>
          <SidebarItem to="/branches" icon={Building2} label="Branches" />
          <SidebarItem to="/rooms" icon={DoorClosed} label="Rooms" />
          <SidebarItem to="/tenants" icon={Users} label="Tenants" />
          <SidebarItem to="/leases" icon={FileText} label="Leases" />
          <SidebarItem to="/daily" icon={Bed} label="Daily Stays" />

          <div className="sidebar-group-label">FINANCE</div>
          <SidebarItem to="/invoices" icon={CreditCard} label="Verify Slips" />
          <SidebarItem to="/expenses" icon={Wallet} label="Expenses" />
          <SidebarItem to="/meters" icon={Zap} label="Utilities" />

          <div className="sidebar-group-label">ADMIN</div>
          <SidebarItem to="/maintenance" icon={Wrench} label="Maintenance" />
          <SidebarItem to="/staff" icon={Shield} label="Staff Users" />
          <SidebarItem to="/audit" icon={History} label="Audit Logs" />
          <SidebarItem to="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <h2>Administrative Dashboard</h2>
          <div className="user-profile">
            <div className="avatar">A</div>
            <span>Admin User</span>
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/leases" element={<LeasesPage />} />
          <Route path="/invoices" element={<PaymentReview />} />
          <Route path="/meters" element={<MetersPage />} />
          <Route path="/daily" element={<DailyStaysPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/audit" element={<AuditLogsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
