import { useState } from 'react';
import { Layers, Lock, Mail, ArrowRight } from 'lucide-react';

const LoginPage = ({ onLogin }: { onLogin: (token: string) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin('mock-token');
    };

    return (
        <div className="login-wrapper">
            <div className="login-card card">
                <div className="login-header">
                    <div className="logo-lg">
                        <Layers size={40} />
                        <span>RentCore</span>
                    </div>
                    <h1>ยินดีต้อนรับ</h1>
                    <p>กรุณาเข้าสู่ระบบเพื่อจัดการระบบหอพักของคุณ</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>ชื่อผู้ใช้งาน หรือ อีเมล</label>
                        <div className="input-with-icon">
                            <Mail size={18} />
                            <input
                                type="text"
                                placeholder="ชื่อผู้ใช้งาน หรือ email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>รหัสผ่าน</label>
                        <div className="input-with-icon">
                            <Lock size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block mt-2">
                        เข้าสู่ระบบ
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="login-footer">
                    <a href="#">ลืมรหัสผ่าน?</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
