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
                { id: 1, category: 'Maintenance', description: 'AC Repair Room 204', amount: 1500, date: new Date(), method: 'CASH' },
                { id: 2, category: 'Utilities', description: 'Electric Bill June (Central)', amount: 12400, date: new Date(), method: 'TRANSFER' },
                { id: 3, category: 'Staff', description: 'Security Guard Salary', amount: 15000, date: new Date(), method: 'TRANSFER' },
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
                    <h1>Expense Tracking</h1>
                    <p>Log and monitor operational costs for your properties.</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    Add Expense
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
                        <p className="stats-title">Total Expenses (Month)</p>
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
                        <p className="stats-title">Largest Category</p>
                        <h3 className="stats-value">Staffing</h3>
                    </div>
                </div>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6}>Loading expenses...</td></tr>
                        ) : expenses.map((exp: any) => (
                            <tr key={exp.id}>
                                <td>{new Date(exp.date).toLocaleDateString()}</td>
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
