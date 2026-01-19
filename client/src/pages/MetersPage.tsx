import { useState, useEffect } from 'react';
import api from '../services/api';
import { Zap, Droplet, Send, CheckCircle } from 'lucide-react';

const MetersPage = () => {
    const [readings, setReadings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReadings();
    }, []);

    const loadReadings = async () => {
        try {
            const { data } = await api.get('/meters/latest');
            setReadings(data);
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
                    <h1>จดมิเตอร์น้ำ-ไฟ</h1>
                    <p>บันทึกและตรวจสอบเลขมิเตอร์ไฟและน้ำประจำเดือน</p>
                </div>
                <button className="btn btn-primary">
                    <Send size={18} />
                    บันทึกข้อมูลใหม่
                </button>
            </div>

            <div className="stats-grid">
                <div className="card stats-card">
                    <div className="stats-header">
                        <div className="stats-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                            <Zap size={24} />
                        </div>
                    </div>
                    <div className="stats-content">
                        <p className="stats-title">ค่าเฉลี่ยไฟฟ้า (หน่วย)</p>
                        <h3 className="stats-value">142.5</h3>
                    </div>
                </div>
                <div className="card stats-card">
                    <div className="stats-header">
                        <div className="stats-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                            <Droplet size={24} />
                        </div>
                    </div>
                    <div className="stats-content">
                        <p className="stats-title">ค่าเฉลี่ยน้ำประปา (หน่วย)</p>
                        <h3 className="stats-value">12.2</h3>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>รายการมิเตอร์แยกตามห้อง</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>เลขห้อง</th>
                            <th>ไฟฟ้า (ก่อน/หลัง)</th>
                            <th>น้ำประปา (ก่อน/หลัง)</th>
                            <th>จำนวนที่ใช้</th>
                            <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5}>กำลังโหลดข้อมูล...</td></tr>
                        ) : readings.map((r: any) => (
                            <tr key={r.room_id}>
                                <td>{r.room_number}</td>
                                <td>{r.last_electric} → {r.curr_electric}</td>
                                <td>{r.last_water} → {r.curr_water}</td>
                                <td>
                                    <div className="units-info">
                                        <span className="badge badge-yellow">{r.curr_electric - r.last_electric} หน่วย</span>
                                        <span className="badge badge-blue">{r.curr_water - r.last_water} หน่วย</span>
                                    </div>
                                </td>
                                <td>
                                    <CheckCircle size={18} className="text-success" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MetersPage;
