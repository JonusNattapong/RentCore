import { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Eye, FileText, AlertTriangle } from 'lucide-react';

interface Payment {
    id: string;
    invoice_id: string;
    invoice_no: string;
    tenant_name: string;
    amount: number;
    status: string;
    transaction_ref: string;
    file_url: string;
    created_at: string;
    ocr_amount?: number;
    ocr_match?: boolean;
}

const PaymentReview = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await axios.get('/api/v1/payments/pending');
            setPayments(response.data);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id: string) => {
        if (!window.confirm('Confirm this payment and send receipt?')) return;
        try {
            await axios.post(`/api/v1/payments/${id}/confirm`);
            fetchPayments();
            setSelectedPayment(null);
        } catch (error) {
            alert('Confirmation failed');
        }
    };

    const handleReject = async (id: string) => {
        const reason = window.prompt('Reason for rejection:');
        if (reason === null) return;
        try {
            await axios.post(`/api/v1/payments/${id}/reject`, { reason });
            fetchPayments();
            setSelectedPayment(null);
        } catch (error) {
            alert('Rejection failed');
        }
    };

    if (loading) return <div>Loading payments...</div>;

    return (
        <div className="payment-review-container">
            <div className="card">
                <div className="card-header">
                    <h3>Pending Slip Verifications</h3>
                    <p>Review OCR data and confirm tenant payments.</p>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Tenant</th>
                            <th>Inv #</th>
                            <th>Amount</th>
                            <th>OCR Match</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.id}>
                                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                                <td>{p.tenant_name}</td>
                                <td>{p.invoice_no}</td>
                                <td>{p.amount.toLocaleString()} THB</td>
                                <td>
                                    {p.ocr_match ? (
                                        <span className="status-badge status-success">MATCH</span>
                                    ) : (
                                        <span className="status-badge status-error">MISMATCH</span>
                                    )}
                                </td>
                                <td className="actions">
                                    <button onClick={() => setSelectedPayment(p)} className="btn-icon">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedPayment && (
                <div className="modal-overlay">
                    <div className="modal card">
                        <div className="modal-header">
                            <h2>Review Slip: {selectedPayment.invoice_no}</h2>
                            <button onClick={() => setSelectedPayment(null)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="slip-viewer">
                                <img src={`/api/v1/payments/slips/${selectedPayment.id}`} alt="Payment Slip" />
                            </div>
                            <div className="slip-details">
                                <div className="detail-group">
                                    <label>Ref Number</label>
                                    <p>{selectedPayment.transaction_ref || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <label>Transaction Amount</label>
                                    <p className="large-text">{selectedPayment.amount.toLocaleString()} THB</p>
                                </div>
                                {selectedPayment.ocr_amount && (
                                    <div className={`ocr-box ${selectedPayment.ocr_match ? 'success' : 'warning'}`}>
                                        <div className="ocr-header">
                                            <FileText size={16} />
                                            <span>OCR DETECTED</span>
                                        </div>
                                        <div className="ocr-value">
                                            {selectedPayment.ocr_amount.toLocaleString()} THB
                                        </div>
                                        {!selectedPayment.ocr_match && (
                                            <div className="ocr-alert">
                                                <AlertTriangle size={14} />
                                                <span>Amount mismatch with invoice!</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => handleReject(selectedPayment.id)} className="btn btn-danger">Reject Slip</button>
                            <button onClick={() => handleConfirm(selectedPayment.id)} className="btn btn-primary">
                                <Check size={18} />
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentReview;
