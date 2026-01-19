import { useState, useEffect } from 'react';
import { UserPlus, Shield, Trash2, Edit } from 'lucide-react';

const StaffPage = () => {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            setStaff([
                { id: 1, name: 'Jonus Nattapong', email: 'jonus@rentcore.com', role: 'SUPER_ADMIN', status: 'ACTIVE' },
                { id: 2, name: 'Somsak Repair', email: 'somsak@rentcore.com', role: 'MAINTENANCE', status: 'ACTIVE' },
                { id: 3, name: 'Jane Clerk', email: 'jane@rentcore.com', role: 'STAFF', status: 'INACTIVE' },
            ]);
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
                    <h1>Staff Management</h1>
                    <p>Manage administrative users and their access roles.</p>
                </div>
                <button className="btn btn-primary">
                    <UserPlus size={18} />
                    Add Staff Member
                </button>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5}>Loading staff...</td></tr>
                        ) : staff.map((s: any) => (
                            <tr key={s.id}>
                                <td>
                                    <div className="user-info-cell">
                                        <div className="user-avatar">{s.name[0]}</div>
                                        <div>
                                            <div className="font-bold">{s.name}</div>
                                            <div className="text-muted text-xs">{s.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex-center-gap">
                                        <Shield size={14} className="text-primary" />
                                        <span className="text-xs font-bold">{s.role}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge status-${s.status.toLowerCase()}`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td>{s.last_login || 'Never'}</td>
                                <td className="actions">
                                    <div className="flex-center-gap">
                                        <button className="btn-icon"><Edit size={16} /></button>
                                        <button className="btn-icon text-error"><Trash2 size={16} /></button>
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

export default StaffPage;
