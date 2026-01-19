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
                    <h1>Utility Monitoring</h1>
                    <p>Record and track electricity and water meter readings.</p>
                </div>
                <button className="btn btn-primary">
                    <Send size={18} />
                    Submit New Readings
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
                        <p className="stats-title">Avg Electricity (kWh)</p>
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
                        <p className="stats-title">Avg Water (m³)</p>
                        <h3 className="stats-value">12.2</h3>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Latest Readings by Room</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Room</th>
                            <th>Electricity (Prev/Curr)</th>
                            <th>Water (Prev/Curr)</th>
                            <th>Units Used</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5}>Loading readings...</td></tr>
                        ) : readings.map((r: any) => (
                            <tr key={r.room_id}>
                                <td>{r.room_number}</td>
                                <td>{r.last_electric} → {r.curr_electric}</td>
                                <td>{r.last_water} → {r.curr_water}</td>
                                <td>
                                    <div className="units-info">
                                        <span className="badge badge-yellow">{r.curr_electric - r.last_electric} kWh</span>
                                        <span className="badge badge-blue">{r.curr_water - r.last_water} m³</span>
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
