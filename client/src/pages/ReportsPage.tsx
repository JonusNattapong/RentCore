import { useState } from 'react';
import { BarChart, PieChart, TrendingUp, Download } from 'lucide-react';

const ReportsPage = () => {
    const [reportType, setReportType] = useState('REVENUE');

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Analytics & Reports</h1>
                    <p>Visual reports on revenue, occupancy, and expenses.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary mr-2">
                        <Download size={18} />
                        Export PDF
                    </button>
                    <button className="btn btn-primary">
                        <Download size={18} />
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="report-controls card">
                <div className="tab-group">
                    <button
                        className={`tab ${reportType === 'REVENUE' ? 'active' : ''}`}
                        onClick={() => setReportType('REVENUE')}
                    >
                        <TrendingUp size={16} />
                        Revenue
                    </button>
                    <button
                        className={`tab ${reportType === 'OCCUPANCY' ? 'active' : ''}`}
                        onClick={() => setReportType('OCCUPANCY')}
                    >
                        <BarChart size={16} />
                        Occupancy
                    </button>
                    <button
                        className={`tab ${reportType === 'EXPENSES' ? 'active' : ''}`}
                        onClick={() => setReportType('EXPENSES')}
                    >
                        <PieChart size={16} />
                        Expenses
                    </button>
                </div>

                <div className="report-filters">
                    <div className="filter-group">
                        <label>Period</label>
                        <select className="select-filter">
                            <option>Monthly (Current)</option>
                            <option>Last 3 Months</option>
                            <option>Yearly</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Branch</label>
                        <select className="select-filter">
                            <option>All Branches</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="report-visualization grid-2">
                <div className="card">
                    <h3>Revenue Breakdown</h3>
                    <div className="chart-placeholder">
                        {/* Here goes Chart.js or Recharts components */}
                        <div className="mock-chart-bar">
                            {[40, 65, 55, 80, 95, 75, 85].map((h, i) => (
                                <div key={i} className="bar" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="chart-labels">
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3>Summary Stats</h3>
                    <div className="stats-list">
                        <div className="stats-list-item">
                            <span>Total Billed</span>
                            <span className="font-bold">฿245,000.00</span>
                        </div>
                        <div className="stats-list-item">
                            <span>Total Collected</span>
                            <span className="font-bold text-success">฿212,500.00</span>
                        </div>
                        <div className="stats-list-item">
                            <span>Outstanding</span>
                            <span className="font-bold text-error">฿32,500.00</span>
                        </div>
                        <div className="stats-list-item">
                            <span>In-House Rate</span>
                            <span className="font-bold">86.7%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
