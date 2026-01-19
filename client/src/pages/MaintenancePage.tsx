import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';

const MaintenancePage = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setRequests([
                { id: 1, room: '204', issue: 'แอร์ไม่เย็น', priority: 'HIGH', status: 'PENDING', created_at: new Date() },
                { id: 2, room: '101', issue: 'ก๊อกน้ำอ่างล้างหน้าซึม', priority: 'MEDIUM', status: 'IN_PROGRESS', created_at: new Date() },
                { id: 3, room: '405', issue: 'หลอดไฟหน้าห้องขาด', priority: 'LOW', status: 'COMPLETED', created_at: new Date() },
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'HIGH': return <span className="badge-pill bg-error">เร่งด่วน</span>;
            case 'MEDIUM': return <span className="badge-pill bg-warning">ปกติ</span>;
            default: return <span className="badge-pill bg-primary-light">ทั่วไป</span>;
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1>รายการแจ้งซ่อม</h1>
                    <p>ติดตามและจัดการรายการแจ้งซ่อมบำรุงจากผู้เช่า</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    เพิ่มรายการแจ้งซ่อม
                </button>
            </div>

            <div className="stats-grid">
                <div className="card stats-card">
                    <div className="stats-header">
                        <div className="stats-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                    <div className="stats-content">
                        <p className="stats-title">งานที่ยังค้างอยู่</p>
                        <h3 className="stats-value">12</h3>
                    </div>
                </div>
                <div className="card stats-card">
                    <div className="stats-header">
                        <div className="stats-icon" style={{ backgroundColor: '#dcfce7', color: '#22c55e' }}>
                            <CheckCircle size={24} />
                        </div>
                    </div>
                    <div className="stats-content">
                        <p className="stats-title">งานที่เสร็จแล้ว (เดือนนี้)</p>
                        <h3 className="stats-value">48</h3>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header-flex">
                    <h3>รายการซ่อมบำรุงล่าสุด</h3>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ห้อง</th>
                            <th>รายละเอียดปัญหา</th>
                            <th>ความสำคัญ</th>
                            <th>สถานะ</th>
                            <th>วันที่แจ้ง</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6}>กำลังโหลดข้อมูลการแจ้งซ่อม...</td></tr>
                        ) : requests.map((req: any) => (
                            <tr key={req.id}>
                                <td className="font-bold">{req.room}</td>
                                <td>{req.issue}</td>
                                <td>{getPriorityBadge(req.priority)}</td>
                                <td>
                                    <span className={`status-badge status-${req.status.toLowerCase().replace('_', '-')}`}>
                                        {req.status === 'PENDING' ? 'รอดำเนินการ' :
                                            req.status === 'IN_PROGRESS' ? 'กำลังซ่อม' :
                                                req.status === 'COMPLETED' ? 'เสร็จสิ้น' : req.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex-center-gap text-muted text-xs">
                                        <Clock size={12} />
                                        {new Date(req.created_at).toLocaleDateString('th-TH')}
                                    </div>
                                </td>
                                <td>
                                    <button className="btn btn-secondary btn-sm">จัดการ</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MaintenancePage;
