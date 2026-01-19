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

    if (loading) return <div className="loading">กำลังโหลดข้อมูลผู้เช่า...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>รายชื่อผู้เช่า</h1>
                    <p>จัดการข้อมูลผู้เช่าและรายละเอียดการติดต่อ</p>
                </div>
                <button className="btn btn-primary">
                    <UserPlus size={18} />
                    เพิ่มผู้เช่าใหม่
                </button>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ชื่อ-นามสกุล</th>
                            <th>ข้อมูลการติดต่อ</th>
                            <th>สถานะ</th>
                            <th>วันที่เริ่ม</th>
                            <th>การจัดการ</th>
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
                                            <div className="text-muted text-xs">เลขบัตร: {tenant.citizen_id || 'ไม่ระบุ'}</div>
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
                                            <span>{tenant.phone || 'ไม่ระบุ'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge status-${tenant.status?.toLowerCase() || 'active'}`}>
                                        {tenant.status === 'ACTIVE' ? 'กำลังเช่า' : tenant.status}
                                    </span>
                                </td>
                                <td>{new Date(tenant.created_at).toLocaleDateString('th-TH')}</td>
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
