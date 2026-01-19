import { useState, useEffect } from 'react';
import { tenantService } from '../services/api';
import { UserPlus, Mail, Phone, ExternalLink } from 'lucide-react';

const TenantsPage = () => {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTenants();
    }, []);

    const loadTenants = async () => {
        try {
            const { data } = await tenantService.getTenants();
            setTenants(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading tenants...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Tenant Directory</h1>
                <button className="btn btn-primary">
                    <UserPlus size={18} />
                    Add Tenant
                </button>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact Info</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((tenant: any) => (
                            <tr key={tenant.id}>
                                <td>
                                    <div className="user-info-cell">
                                        <div className="user-avatar">{tenant.first_name[0]}</div>
                                        <div>
                                            <div className="font-bold">{tenant.first_name} {tenant.last_name}</div>
                                            <div className="text-muted text-xs">ID: {tenant.citizen_id || 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-info">
                                        <div className="contact-item">
                                            <Mail size={14} />
                                            <span>{tenant.email}</span>
                                        </div>
                                        <div className="contact-item">
                                            <Phone size={14} />
                                            <span>{tenant.phone || 'N/A'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge status-${tenant.status?.toLowerCase() || 'active'}`}>
                                        {tenant.status || 'ACTIVE'}
                                    </span>
                                </td>
                                <td>{new Date(tenant.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn-icon">
                                        <ExternalLink size={18} />
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

export default TenantsPage;
