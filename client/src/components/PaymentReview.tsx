import { useState, useEffect } from 'react';
import { paymentService } from '../services/api';
import { CheckCircle, XCircle, Eye, AlertCircle, Image as ImageIcon } from 'lucide-react';

const PaymentReview = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const { data } = await paymentService.getPendingPayments();
            setPayments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id: string) => {
        if (!confirm('ยืนยันความถูกต้องของสลิปและออกใบเสร็จใช่หรือไม่?')) return;
        try {
            await paymentService.confirmPayment(id);
            loadPayments();
            setSelectedPayment(null);
            alert('ยืนยันชำระเงินเรียบร้อยแล้ว');
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการยืนยัน');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>ตรวจสอบการชำระเงิน</h1>
                    <p>ตรวจสอบสลิปโอนเงินด้วยระบบ OCR และยืนยันการรับเงิน</p>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ผู้เช่า/ห้อง</th>
                                <th>ยอดเงิน</th>
                                <th>สถานะ OCR</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4}>กำลังโหลดข้อมูล...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-4">ไม่มีรายการรอตรวจสอบ</td></tr>
                            ) : (
                                payments.map(p => (
                                    <tr key={p.id} className={selectedPayment?.id === p.id ? 'row-active' : ''}>
                                        <td>
                                            <div className="font-bold">{p.tenant_name}</div>
                                            <div className="text-xs text-muted">ห้อง {p.room_number}</div>
                                        </td>
                                        <td className="font-bold text-primary">฿{Number(p.amount).toLocaleString()}</td>
                                        <td>
                                            {p.ocr_status === 'MATCH' ? (
                                                <span className="badge-pill bg-success">ข้อมูลตรง</span>
                                            ) : (
                                                <span className="badge-pill bg-error">ต้องตรวจสอบ</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-icon"
                                                onClick={() => setSelectedPayment(p)}
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    {selectedPayment ? (
                        <div className="review-panel fade-in">
                            <h3>รายละเอียดการตรวจสอบ</h3>
                            <div className="slip-preview mt-2">
                                <img
                                    src={paymentService.getSlipUrl(selectedPayment.id)}
                                    alt="Payment Slip"
                                    className="img-fluid rounded"
                                />
                            </div>

                            <div className="ocr-comparison mt-2">
                                <div className={`comparison-item ${selectedPayment.ocr_amount_match ? 'match' : 'mismatch'}`}>
                                    <label>ยอดเงินในสลิป (OCR)</label>
                                    <div className="value">
                                        <span>฿{Number(selectedPayment.ocr_amount).toLocaleString()}</span>
                                        {selectedPayment.ocr_amount_match ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    </div>
                                </div>
                            </div>

                            <div className="action-footer mt-2">
                                <button
                                    className="btn btn-danger"
                                    onClick={() => alert('ฟีเจอร์นี้กำลังพัฒนา')}
                                >
                                    <XCircle size={18} /> ปฏิเสธ
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleConfirm(selectedPayment.id)}
                                >
                                    <CheckCircle size={18} /> ยืนยันความถูกต้อง
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <ImageIcon size={48} className="text-muted" />
                            <p>กรุณาเลือกรายการเพื่อตรวจสอบสลิป</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentReview;
