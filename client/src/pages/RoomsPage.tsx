import { useState, useEffect } from 'react';
import { roomService, branchService } from '../services/api';
import { Search, DoorOpen, User, Tag } from 'lucide-react';

const RoomsPage = () => {
    const [rooms, setRooms] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadRooms();
    }, [selectedBranch]);

    const loadInitialData = async () => {
        try {
            const { data: bData } = await branchService.getBranches();
            setBranches(bData);
        } catch (err) {
            console.error(err);
        }
    };

    const loadRooms = async () => {
        setLoading(true);
        try {
            const { data } = await roomService.getRooms(selectedBranch);
            setRooms(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Room Inventory</h1>
                <div className="header-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input type="text" placeholder="Search room number..." />
                    </div>
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="select-filter"
                    >
                        <option value="">All Branches</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading rooms...</div>
            ) : (
                <div className="rooms-grid">
                    {rooms.map(room => (
                        <div key={room.id} className="card room-card">
                            <div className="room-header">
                                <div className="room-number">
                                    <DoorOpen size={20} />
                                    <span>{room.room_number}</span>
                                </div>
                                <span className={`status-badge status-${room.status.toLowerCase()}`}>
                                    {room.status}
                                </span>
                            </div>

                            <div className="room-body">
                                <div className="room-info">
                                    <Tag size={16} />
                                    <span>{room.room_type || 'Standard'}</span>
                                </div>
                                {room.current_tenant && (
                                    <div className="room-info">
                                        <User size={16} />
                                        <span>{room.current_tenant}</span>
                                    </div>
                                )}
                            </div>

                            <div className="room-footer">
                                <div className="room-price">
                                    <label>Monthly Rent</label>
                                    <span>฿{Number(room.monthly_rate).toLocaleString()}</span>
                                </div>
                                <button className="btn btn-secondary btn-sm">Manage</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoomsPage;
