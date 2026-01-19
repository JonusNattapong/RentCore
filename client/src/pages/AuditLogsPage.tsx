import { useState, useEffect } from 'react';
import api from '../services/api';
import { Clock, Search } from 'lucide-react';

const AuditLogsPage = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const { data } = await api.get('/audit-logs'); // Assuming this endpoint exists or will be created
            setLogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1>System Audit Logs</h1>
                    <p>Track all administrative actions and security events.</p>
                </div>
                <div className="header-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input type="text" placeholder="Filter by user or action..." />
                    </div>
                </div>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Action</th>
                            <th>Resource</th>
                            <th>Details</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5}>Loading logs...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-4">No recent activity logs found.</td></tr>
                        ) : logs.map((log: any) => (
                            <tr key={log.id}>
                                <td>
                                    <div className="flex-center-gap">
                                        <div className="avatar-xs">{log.user_name?.[0] || 'U'}</div>
                                        <span>{log.user_name || 'System'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge-pill ${log.action === 'DELETE' ? 'bg-error' : 'bg-primary-light'}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td>{log.resource_type}</td>
                                <td className="text-xs">{log.details || '-'}</td>
                                <td>
                                    <div className="flex-center-gap text-muted">
                                        <Clock size={14} />
                                        <span>{new Date(log.created_at).toLocaleString()}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogsPage;
