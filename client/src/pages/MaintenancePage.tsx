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
                { id: 1, room: '204', issue: 'Air conditioner not cooling', priority: 'HIGH', status: 'PENDING', created_at: new Date() },
                { id: 2, room: '101', issue: 'Leaking faucet in bathroom', priority: 'MEDIUM', status: 'IN_PROGRESS', created_at: new Date() },
                { id: 3, room: '405', issue: 'Light bulb replacement', priority: 'LOW', status: 'COMPLETED', created_at: new Date() },
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'HIGH': return <span className="badge-pill bg-error">HIGH</span>;
            case 'MEDIUM': return <span className="badge-pill bg-warning">MEDIUM</span>;
            default: return <span className="badge-pill bg-primary-light">LOW</span>;
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1>Maintenance Requests</h1>
                    <p>Track and manage repair requests from your tenants.</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    New Request
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
                        <p className="stats-title">Pending Tasks</p>
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
                        <p className="stats-title">Completed (This Month)</p>
                        <h3 className="stats-value">48</h3>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header-flex">
                    <h3>Active Requests</h3>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Room</th>
                            <th>Issue Description</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Requested</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6}>Loading requests...</td></tr>
                        ) : requests.map((req: any) => (
                            <tr key={req.id}>
                                <td className="font-bold">{req.room}</td>
                                <td>{req.issue}</td>
                                <td>{getPriorityBadge(req.priority)}</td>
                                <td>
                                    <span className={`status-badge status-${req.status.toLowerCase().replace('_', '-')}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex-center-gap text-muted text-xs">
                                        <Clock size={12} />
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td>
                                    <button className="btn btn-secondary btn-sm">Manage</button>
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
