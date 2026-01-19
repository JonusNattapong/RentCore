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

    const loadInitialData = async () => {
        try {
            const [roomsRes, branchesRes] = await Promise.all([
                roomService.getRooms(),
                branchService.getBranches()
            ]);
            setRooms(roomsRes.data);
            setBranches(branchesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBranchChange = async (branchId: string) => {
        setSelectedBranch(branchId);
        setLoading(true);
        try {
            const { data } = await roomService.getRooms(branchId);
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
                <div>
                    <h1>จัดการห้องพัก</h1>
                    <p>ตรวจสอบสถานะห้องพักและจัดการข้อมูลห้องทั้งหมด</p>
                </div>
                <div className="header-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input type="text" placeholder="หาเลขห้อง..." />
                    </div>
                    <select
                        className="select-filter"
                        value={selectedBranch}
                        onChange={(e) => handleBranchChange(e.target.value)}
                    >
                        <option value="">ทุกสาขา</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">กำลังโหลดข้อมูลห้อง...</div>
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
                                    {room.status === 'AVAILABLE' ? 'ว่าง' :
                                        room.status === 'OCCUPIED' ? 'มีผู้เช่า' :
                                            room.status === 'MAINTENANCE' ? 'ปรับปรุง' : room.status}
                                </span>
                            </div>

                            <div className="room-info">
                                <Tag size={14} />
                                <span>{room.type_name}</span>
                            </div>

                            {room.tenant_name && (
                                <div className="room-info">
                                    <User size={14} />
                                    <span>{room.tenant_name}</span>
                                </div>
                            )}

                            <div className="room-footer">
                                <div className="room-price">
                                    <label>ค่าเช่ารายเดือน</label>
                                    <span>฿{Number(room.base_price).toLocaleString()}</span>
                                </div>
                                <button className="btn btn-secondary btn-sm">รายละเอียด</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoomsPage;
