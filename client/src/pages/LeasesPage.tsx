import { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Plus, Calendar } from 'lucide-react';

const LeasesPage = () => {
    const [leases, setLeases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeases();
    }, []);

    const loadLeases = async () => {
        try {
            const { data } = await api.get('/leases');
            setLeases(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Lease Agreements</h1>
                    <p>Monitor active contracts and upcoming expirations.</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    New Contract
                </button>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tenant</th>
                            <th>Room</th>
                            <th>Start Date</th>
                            <th>Rent</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6}>Loading leases...</td></tr>
                        ) : leases.map(lease => (
                            <tr key={lease.id}>
                                <td>{lease.tenant_name}</td>
                                <td>{lease.room_number}</td>
                                <td>
                                    <div className="date-cell">
                                        <Calendar size={14} />
                                        <span>{new Date(lease.start_date).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="font-bold">฿{Number(lease.rent_monthly).toLocaleString()}</td>
                                <td>
                                    <span className={`status-badge status-${lease.status.toLowerCase()}`}>
                                        {lease.status}
                                    </span>
                                </td>
                                <td className="actions">
                                    <button className="btn-icon">
                                        <FileText size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeasesPage;
