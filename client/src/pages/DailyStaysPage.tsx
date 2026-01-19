import { useState, useEffect } from 'react';
import api from '../services/api';
import { Bed, LogIn, LogOut } from 'lucide-react';

const DailyStaysPage = () => {
    const [stays, setStays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStays();
    }, []);

    const loadStays = async () => {
        try {
            const { data } = await api.get('/daily-stays');
            setStays(data);
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
                    <h1>Daily Rentals</h1>
                    <p>Manage short-term hotel-style bookings and check-ins.</p>
                </div>
                <button className="btn btn-primary">
                    <Bed size={18} />
                    New Check-in
                </button>
            </div>

            <div className="card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Guest Name</th>
                            <th>Room</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Status</th>
                            <th>Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6}>Loading daily stays...</td></tr>
                        ) : stays.map((stay: any) => (
                            <tr key={stay.id}>
                                <td>{stay.guest_name}</td>
                                <td>{stay.room_number}</td>
                                <td>
                                    <div className="flex-center-gap">
                                        <LogIn size={14} className="text-success" />
                                        <span>{new Date(stay.check_in).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex-center-gap">
                                        <LogOut size={14} className="text-error" />
                                        <span>{new Date(stay.check_out).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge status-${stay.status.toLowerCase()}`}>
                                        {stay.status}
                                    </span>
                                </td>
                                <td>
                                    {stay.is_paid ? (
                                        <span className="badge-pill bg-success">Yes</span>
                                    ) : (
                                        <span className="badge-pill bg-error">No</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DailyStaysPage;
