import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    trend?: string;
    trendUp?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, trend, trendUp }) => {
    return (
        <div className="card stats-card">
            <div className="stats-header">
                <div className="stats-icon" style={{ backgroundColor: `${color}15`, color: color }}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`stats-trend ${trendUp ? 'up' : 'down'}`}>
                        {trend}
                    </div>
                )}
            </div>
            <div className="stats-content">
                <p className="stats-title">{title}</p>
                <h3 className="stats-value">{value}</h3>
            </div>
        </div>
    );
};

export default StatsCard;
