import { useState, useEffect } from 'react';
import { ArrowDownCircle, Plus, PieChart, ShoppingCart } from 'lucide-react';

const ExpensesPage = () => {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setExpenses([
                { id: 1, category: 'การซ่อมบำรุง', description: 'ซ่อมแอร์ ห้อง 204', amount: 1500, date: new Date(), method: 'เงินสด' },
                { id: 2, category: 'สาธารณูปโภค', description: 'ค่าน้ำ-ไฟ ส่วนกลาง เดือนมิถุนายน', amount: 12400, date: new Date(), method: 'เงินโอน' },
                { id: 3, category: 'พนักงาน', description: 'เงินเดือน รปภ.', amount: 15000, date: new Date(), method: 'เงินโอน' },
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
                    <h1>บันทึกรายจ่าย</h1>
                    <p>บันทึกและติดตามค่าใช้จ่ายต่างๆ ของหอพัก</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    เพิ่มรายการจ่าย
                </button>
            </div>

            <div className="stats-grid">
                <div className="card stats-card">
                    <div className="stats-header">
                        <div className="stats-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
                            <ArrowDownCircle size={24} />
                        </div>
                    </div>
                    <div className="stats-content">
                        <p className="stats-title">รายจ่ายทั้งหมด (เดือนนี้)</p>
                        <h3 className="stats-value">฿28,900</h3>
                    </div>
                </div>
                <div className="card stats-card">
                    <div className="stats-header">
                        <div className="stats-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                            <PieChart size={24} />
                        </div>
                    </div>
                    <div className="stats-content">
                        <p className="stats-title">หมวดหมู่ที่จ่ายมากที่สุด</p>
                        <h3 className="stats-value">เงินเดือนพนักงาน</h3>
                    </div>
                </div>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>วันที่</th>
                            <th>หมวดหมู่</th>
                            <th>รายละเอียด</th>
                            <th>จำนวนเงิน</th>
                            <th>วิธีการจ่าย</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6}>กำลังโหลดข้อมูลรายจ่าย...</td></tr>
                        ) : expenses.map((exp: any) => (
                            <tr key={exp.id}>
                                <td>{new Date(exp.date).toLocaleDateString('th-TH')}</td>
                                <td>
                                    <span className="badge-pill bg-primary-light text-primary">{exp.category}</span>
                                </td>
                                <td>{exp.description}</td>
                                <td className="text-error font-bold">฿{exp.amount.toLocaleString()}</td>
                                <td>{exp.method}</td>
                                <td>
                                    <button className="btn-icon"><ShoppingCart size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpensesPage;
