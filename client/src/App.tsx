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
      <StatsCard title="รายได้ทั้งหมด" value="฿245,000" icon={CreditCard} color="#4f46e5" trend="+12.5%" trendUp />
      <StatsCard title="อัตราการเข้าพัก" value="92%" icon={Building2} color="#10b981" trend="+2.4%" trendUp />
      <StatsCard title="ผู้เช่าทั้งหมด" value="124" icon={Users} color="#f59e0b" />
      <StatsCard title="สลิปรอตรวจสอบ" value="8" icon={FileText} color="#ef4444" trend="ต้องดำเนินการ" />
    </div>

    <div className="grid-2 mt-2">
      <div className="card">
        <h3>แนวโน้มรายได้</h3>
        <div className="chart-placeholder">
          <div className="mock-chart-bar">
            {[30, 45, 60, 25, 80, 50, 90, 65, 75, 55, 85, 95].map((h, i) => <div key={i} className="bar" style={{ height: `${h}%` }}></div>)}
          </div>
          <div className="chart-labels">
            <span>ม.ค.</span><span>มี.ค.</span><span>พ.ค.</span><span>ก.ค.</span><span>ก.ย.</span><span>ธ.ค.</span>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>สถานะระบบและการแจ้งเตือน</h3>
        <div className="stats-list">
          <div className="flex-center-gap text-xs"><Wrench size={14} className="text-error" /> 12 รายการแจ้งซ่อมรออยู่</div>
          <div className="flex-center-gap text-xs"><Zap size={14} className="text-warning" /> ถึงกำหนดจดมิเตอร์วันนี้</div>
          <div className="flex-center-gap text-xs"><FileText size={14} className="text-primary" /> 2 สัญญาเช่าจะหมดอายุในสัปดาห์นี้</div>
          <div className="flex-center-gap text-xs"><History size={14} className="text-muted" /> สำรองข้อมูลล่าสุด: 2 ชั่วโมงที่แล้ว</div>
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
          <div className="sidebar-group-label">ภาพรวม</div>
          <SidebarItem to="/" icon={BarChart3} label="แผงควบคุม" />
          <SidebarItem to="/reports" icon={BarChart3} label="รายงานวิเคราะห์" />

          <div className="sidebar-group-label">การจัดการ</div>
          <SidebarItem to="/branches" icon={Building2} label="สาขา/หอพัก" />
          <SidebarItem to="/rooms" icon={DoorClosed} label="ห้องพัก" />
          <SidebarItem to="/tenants" icon={Users} label="ข้อมูลผู้เช่า" />
          <SidebarItem to="/leases" icon={FileText} label="สัญญาเช่า" />
          <SidebarItem to="/daily" icon={Bed} label="เช่ารายวัน" />

          <div className="sidebar-group-label">การเงิน</div>
          <SidebarItem to="/invoices" icon={CreditCard} label="ตรวจสอบสลิป" />
          <SidebarItem to="/expenses" icon={Wallet} label="รายจ่าย" />
          <SidebarItem to="/meters" icon={Zap} label="จดมิเตอร์น้ำ-ไฟ" />

          <div className="sidebar-group-label">ตั้งค่าระบบ</div>
          <SidebarItem to="/maintenance" icon={Wrench} label="รายการแจ้งซ่อม" />
          <SidebarItem to="/staff" icon={Shield} label="จัดการพนักงาน" />
          <SidebarItem to="/audit" icon={History} label="บันทึกกิจกรรม" />
          <SidebarItem to="/settings" icon={Settings} label="ตั้งค่าทั่วไป" />
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <h2>ระบบบริหารจัดการหอพัก</h2>
          <div className="user-profile">
            <div className="avatar">A</div>
            <span>ผู้ดูแลระบบ</span>
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
