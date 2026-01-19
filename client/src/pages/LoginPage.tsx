import { useState } from 'react';
import { Layers, Lock, Mail, ArrowRight } from 'lucide-react';

const LoginPage = ({ onLogin }: { onLogin: (token: string) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd call authService.login
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
                    <h1>Welcome Back</h1>
                    <p>Enter your credentials to access the admin panel.</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={18} />
                            <input
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
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
                        Sign In
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="login-footer">
                    <a href="#">Forgot password?</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
