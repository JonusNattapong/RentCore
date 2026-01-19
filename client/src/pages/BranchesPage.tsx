import { useState, useEffect } from 'react';
import { branchService } from '../services/api';
import { Plus, Edit2, MapPin, Building, Trash2 } from 'lucide-react';

const BranchesPage = () => {
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            const { data } = await branchService.getBranches();
            setBranches(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading branches...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Branches & Properties</h1>
                    <p>Manage your physical locations and bank details.</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    New Branch
                </button>
            </div>

            <div className="branches-grid">
                {branches.map(branch => (
                    <div key={branch.id} className="card branch-card">
                        <div className="branch-card-header">
                            <div className="branch-icon">
                                <Building size={24} />
                            </div>
                            <div className="branch-actions">
                                <button className="btn-icon"><Edit2 size={16} /></button>
                                <button className="btn-icon text-error"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="branch-card-body">
                            <h3>{branch.name}</h3>
                            <div className="branch-info-item">
                                <MapPin size={16} />
                                <span>{branch.address || 'No address set'}</span>
                            </div>
                        </div>

                        <div className="branch-card-footer">
                            <div className="info-badge">
                                <label>Bank</label>
                                <span>{branch.bank_account_name || 'N/A'}</span>
                            </div>
                            <div className="info-badge">
                                <label>Account</label>
                                <span>{branch.bank_account_no || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BranchesPage;
