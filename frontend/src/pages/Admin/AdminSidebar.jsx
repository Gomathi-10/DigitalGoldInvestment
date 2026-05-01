import { LayoutDashboard, Users, Settings, LogOut, Shield, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ active, setActive }) => {
    const navigate = useNavigate();
    const isAdminWithMessages = localStorage.getItem('email') === 'gomathi@gmail.com';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-logo">
                <LayoutDashboard size={28} />
                <span>AdminPanel</span>
            </div>
            <ul className="admin-nav">
                <li>
                    <button
                        className={active === 'dashboard' ? 'active' : ''}
                        onClick={() => setActive('dashboard')}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                </li>
                <li>
                    <button
                        className={active === 'users' ? 'active' : ''}
                        onClick={() => setActive('users')}
                    >
                        <Users size={20} /> User Management
                    </button>
                </li>
                <li>
                    <button
                        className={active === 'kyc' ? 'active' : ''}
                        onClick={() => setActive('kyc')}
                    >
                        <Shield size={20} /> KYC Verification
                    </button>
                </li>
                {isAdminWithMessages && (
                    <li>
                        <button
                            className={active === 'messages' ? 'active' : ''}
                            onClick={() => setActive('messages')}
                        >
                            <Mail size={20} /> Messages
                        </button>
                    </li>
                )}
                <li>
                    <button
                        className={active === 'settings' ? 'active' : ''}
                        onClick={() => setActive('settings')}
                    >
                        <Settings size={20} /> Settings
                    </button>
                </li>
                <li style={{ marginTop: 'auto' }}>
                    <button onClick={handleLogout} style={{ color: '#ef4444' }}>
                        <LogOut size={20} /> Logout
                    </button>
                </li>
            </ul>
        </aside>
    );
};

export default AdminSidebar;
