import { useState, useEffect } from 'react';
import { branchService } from '../services/api';
import { Building2, MapPin, Phone, CreditCard, Plus } from 'lucide-react';

const BranchesPage = () => {
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            const { data } = await branchService.getBranches();
            setBranches(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">กำลังโหลดข้อมูลสาขา...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>จัดการสาขาและหอพัก</h1>
                    <p>ข้อมูลสาขาทั้งหมด รายละเอียดบัญชีธนาคาร และที่ตั้ง</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    เพิ่มสาขาใหม่
                </button>
            </div>

            <div className="branches-grid">
                {branches.map(branch => (
                    <div key={branch.id} className="card branch-card">
                        <div className="branch-card-header">
                            <div className="branch-icon">
                                <Building2 size={24} />
                            </div>
                            <button className="btn btn-secondary btn-sm">แก้ไข</button>
                        </div>

                        <div className="branch-card-body">
                            <h3>{branch.name}</h3>
                            <div className="branch-info-item">
                                <MapPin size={16} />
                                <span>{branch.address || 'ไม่ระบุที่อยู่'}</span>
                            </div>
                            <div className="branch-info-item">
                                <Phone size={16} />
                                <span>{branch.phone || '-'}</span>
                            </div>

                            <div className="mt-2 p-1 bg-slate-50 rounded">
                                <label className="text-xs font-bold text-muted uppercase">ข้อมูลธนาคารสำหรับ OCR</label>
                                <div className="flex-center-gap mt-1">
                                    <CreditCard size={14} className="text-primary" />
                                    <span className="text-sm">{branch.bank_name}: {branch.account_number}</span>
                                </div>
                            </div>
                        </div>

                        <div className="branch-card-footer">
                            <div className="info-badge">
                                <label>จำนวนห้อง</label>
                                <span>{branch.total_rooms || 0} ห้อง</span>
                            </div>
                            <div className="info-badge">
                                <label>ผู้เช่า</label>
                                <span>{branch.total_tenants || 0} คน</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BranchesPage;
