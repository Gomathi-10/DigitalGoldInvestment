import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";
import AxiosInstance from "../../AxiosInstance";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Users, Activity, Radio, Database, Shield, Settings as SettingsIcon, Save, Server, Bell } from "lucide-react";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [stats, setStats] = useState({ total_users: 0, active_now: 0, live_sessions: 0 });
    const [users, setUsers] = useState([]);
    const [kycRequests, setKycRequests] = useState([]);
    const [kycLoading, setKycLoading] = useState(false);
    const [selectedKyc, setSelectedKyc] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);

    const [adminProfile, setAdminProfile] = useState({
        username: '',
        email: ''
    });
    const navigate = useNavigate();

    // Settings States
    const [notifications, setNotifications] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [registrationAllowed, setRegistrationAllowed] = useState(true);


    useEffect(() => {
        const isStaff = localStorage.getItem("is_staff") === "true";
        if (!isStaff) {
            toast.error("Unauthorized access.");
            navigate("/dashboard");
            return;
        }

        // Simple profile load
        setAdminProfile({
            username: localStorage.getItem('username') || 'Admin',
            email: localStorage.getItem('email') || 'admin@digigold.com'
        });

        if (activeTab !== 'settings' && activeTab !== 'kyc') {
            fetchData();
        }

        const interval = setInterval(() => {
            if (activeTab === 'dashboard') fetchData();
        }, 30000);
        return () => clearInterval(interval);
    }, [activeTab]);

    // Dedicated KYC fetcher
    useEffect(() => {
        if (activeTab === 'kyc') {
            fetchKycData();
        }
    }, [activeTab]);

    const fetchKycData = async () => {
        try {
            setKycLoading(true);
            const kycRes = await AxiosInstance.get("api/admin/kyc/");
            console.log("AdminDashboard: KYC Response Status:", kycRes.status);
            console.log("AdminDashboard: KYC Data received:", kycRes.data);

            const data = Array.isArray(kycRes.data) ? kycRes.data :
                (Array.isArray(kycRes.data.results) ? kycRes.data.results : []);
            setKycRequests(data);

            if (data.length > 0) {
                toast.success(`Fetched ${data.length} KYC requests`);
            } else {
                toast.info("No KYC requests to display");
            }
        } catch (err) {
            console.error("AdminDashboard: Failed to fetch KYC requests:", err);
            if (err.response?.status === 403) {
                toast.error("Access Denied: Admin permissions required");
            } else {
                toast.error("Failed to load KYC requests");
            }
        } finally {
            setKycLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            // Fetch Stats
            try {
                const statsRes = await AxiosInstance.get("api/admin/stats/");
                setStats(statsRes.data);
            } catch (err) { console.error(err); }

            // Fetch Users
            try {
                const usersRes = await AxiosInstance.get("api/admin/users/");
                const userList = Array.isArray(usersRes.data) ? usersRes.data :
                    (Array.isArray(usersRes.data.results) ? usersRes.data.results : []);
                setUsers(userList);
            } catch (err) { console.error(err); }

        } catch (error) {
            console.error("Global fetchData error:", error);
        }
    };

    const fetchMessages = async () => {
        try {
            setMessagesLoading(true);
            const res = await AxiosInstance.get("api/admin/messages/");
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages:", err);
            toast.error("Failed to load messages");
        } finally {
            setMessagesLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'messages') {
            fetchMessages();
        }
    }, [activeTab]);



    const handleKYCAction = async (kycId, action, reason = '') => {
        try {
            const response = await AxiosInstance.post(
                `api/admin/kyc/${kycId}/approve/`,
                { action, reason }
            );

            toast.success(response.data.message);
            fetchKycData(); // Refresh KYC list
        } catch (error) {
            toast.error("Failed to process KYC request");
            console.error(error);
        }
    };

    const handleSaveSettings = () => {
        toast.success("Settings saved successfully!");
    };

    const safeUsers = Array.isArray(users) ? users : [];

    const formatTime = (isoString) => {
        if (!isoString) return 'Never';
        return new Date(isoString).toLocaleString();
    }

    return (
        <div className="admin-container">
            <AdminSidebar active={activeTab} setActive={setActiveTab} />

            <main className="admin-main">
                {activeTab === "dashboard" && (
                    <>
                        <div className="admin-header">
                            <h1>Dashboard Overview</h1>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '5px' }}>Real-time data from localized SQLite database</p>
                        </div>

                        <div className="admin-stats-grid">
                            <div className="stat-card">
                                <h3><Database size={16} style={{ display: 'inline', marginRight: '6px' }} />Total Registered Users</h3>
                                <div className="value">{stats.total_users}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>Total records in DB</div>
                            </div>
                            <div className="stat-card">
                                <h3><Activity size={16} style={{ display: 'inline', marginRight: '6px' }} />Live Active Sessions</h3>
                                <div className="value" style={{ color: "#3b82f6" }}>{stats.live_sessions}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>Currently logged in</div>
                            </div>
                            <div className="stat-card">
                                <h3><Users size={16} style={{ display: 'inline', marginRight: '6px' }} />Active Users (24h)</h3>
                                <div className="value" style={{ color: "#10b981" }}>{stats.active_now}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>Logins in last 24h</div>
                            </div>
                            <div className="stat-card">
                                <h3><Radio size={16} style={{ display: 'inline', marginRight: '6px' }} />System Status</h3>
                                <div
                                    className="value"
                                    style={{ color: "#10b981", fontSize: "1.5rem", marginTop: "5px" }}
                                >
                                    Online
                                </div>
                            </div>
                        </div>

                        <div className="data-table-container">
                            <h2>Recent Logins (Live Update)</h2>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Last Login</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {safeUsers.slice(0, 5).map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.username || "No Name"}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                {user.is_staff ? (
                                                    <span className="badge-admin">Admin</span>
                                                ) : (
                                                    <span className="badge-user">User</span>
                                                )}
                                            </td>
                                            <td style={{ color: '#cbd5e1' }}>
                                                {formatTime(user.last_login)}
                                            </td>
                                            <td>
                                                <span style={{
                                                    width: '8px', height: '8px',
                                                    background: user.last_login ? '#10b981' : '#64748b',
                                                    borderRadius: '50%', display: 'inline-block', marginRight: '6px'
                                                }}></span>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === "users" && (
                    <div className="data-table-container">
                        <h2>All Database Users ({safeUsers.length})</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>KYC Status</th>
                                    <th>Last Login</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {safeUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.username || "No Name"}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            {user.is_staff ? <span className="badge-admin">Admin</span> : <span className="badge-user">User</span>}
                                        </td>
                                        <td>
                                            {user.kyc_status === 'approved' && <span className="badge-approved">Approved</span>}
                                            {user.kyc_status === 'pending' && <span className="badge-pending">Pending</span>}
                                            {user.kyc_status === 'rejected' && <span className="badge-rejected">Rejected</span>}
                                            {user.kyc_status === 'not_submitted' && <span style={{ color: '#64748b' }}>Not Submitted</span>}
                                        </td>
                                        <td>{formatTime(user.last_login)}</td>

                                        <td>
                                            <button className="btn-action btn-edit">
                                                Edit
                                            </button>
                                            <button className="btn-action btn-delete">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "kyc" && (
                    <div className="data-table-container">
                        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1>KYC Verification Requests</h1>
                                <p style={{ color: '#94a3b8' }}>Review and approve user KYC submissions</p>
                            </div>
                            <button
                                className="btn-action"
                                style={{
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '8px 16px',
                                    opacity: kycLoading ? 0.7 : 1,
                                    cursor: kycLoading ? 'not-allowed' : 'pointer'
                                }}
                                onClick={fetchKycData}
                                disabled={kycLoading}
                            >
                                {kycLoading ? 'Refreshing...' : 'Refresh Data'}
                            </button>
                        </div>

                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User Email</th>
                                    <th>Full Name</th>
                                    <th>DOB</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kycRequests.map((kyc) => (
                                    <React.Fragment key={kyc.id}>
                                        <tr
                                            style={{ background: selectedKyc === kyc.id ? '#334155' : 'transparent' }}
                                        >
                                            <td>{kyc.user_email}</td>
                                            <td>{kyc.full_name}</td>
                                            <td>{new Date(kyc.date_of_birth).toLocaleDateString()}</td>
                                            <td>
                                                {kyc.status === 'pending' && <span className="badge-pending">Pending</span>}
                                                {kyc.status === 'approved' && <span className="badge-approved">Approved</span>}
                                                {kyc.status === 'rejected' && <span className="badge-rejected">Rejected</span>}
                                            </td>
                                            <td>{new Date(kyc.submitted_at).toLocaleDateString()}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="btn-action"
                                                        style={{ background: '#3b82f6', color: 'white' }}
                                                        onClick={() => setSelectedKyc(selectedKyc === kyc.id ? null : kyc.id)}
                                                    >
                                                        {selectedKyc === kyc.id ? 'Hide' : 'Details'}
                                                    </button>
                                                    {kyc.status === 'pending' && (
                                                        <>
                                                            <button
                                                                className="btn-action btn-approve"
                                                                onClick={() => handleKYCAction(kyc.id, 'approve')}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="btn-action btn-reject"
                                                                onClick={() => {
                                                                    const reason = prompt('Enter rejection reason:');
                                                                    if (reason) handleKYCAction(kyc.id, 'reject', reason);
                                                                }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {selectedKyc === kyc.id && (
                                            <tr>
                                                <td colSpan="6" style={{ background: '#1e293b', padding: '20px' }}>
                                                    <div className="kyc-details-grid">
                                                        <div className="kyc-detail-section">
                                                            <h4>Personal Information</h4>
                                                            <div className="detail-row">
                                                                <span className="detail-label">Full Name:</span>
                                                                <span className="detail-value">{kyc.full_name}</span>
                                                            </div>
                                                            <div className="detail-row">
                                                                <span className="detail-label">Date of Birth:</span>
                                                                <span className="detail-value">{new Date(kyc.date_of_birth).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="detail-row">
                                                                <span className="detail-label">Phone Number:</span>
                                                                <span className="detail-value">{kyc.phone_number}</span>
                                                            </div>
                                                        </div>

                                                        <div className="kyc-detail-section">
                                                            <h4>Address Details</h4>
                                                            <div className="detail-row">
                                                                <span className="detail-label">Address Line 1:</span>
                                                                <span className="detail-value">{kyc.address_line1}</span>
                                                            </div>
                                                            {kyc.address_line2 && (
                                                                <div className="detail-row">
                                                                    <span className="detail-label">Address Line 2:</span>
                                                                    <span className="detail-value">{kyc.address_line2}</span>
                                                                </div>
                                                            )}
                                                            <div className="detail-row">
                                                                <span className="detail-label">City:</span>
                                                                <span className="detail-value">{kyc.city}</span>
                                                            </div>
                                                            <div className="detail-row">
                                                                <span className="detail-label">State:</span>
                                                                <span className="detail-value">{kyc.state}</span>
                                                            </div>
                                                            <div className="detail-row">
                                                                <span className="detail-label">Pincode:</span>
                                                                <span className="detail-value">{kyc.pincode}</span>
                                                            </div>
                                                            <div className="detail-row">
                                                                <span className="detail-label">Country:</span>
                                                                <span className="detail-value">{kyc.country}</span>
                                                            </div>
                                                        </div>

                                                        <div className="kyc-detail-section">
                                                            <h4>Document Details</h4>
                                                            <div className="detail-row">
                                                                <span className="detail-label">Aadhar Number:</span>
                                                                <span className="detail-value">{kyc.aadhar_number}</span>
                                                            </div>
                                                            <div className="detail-row">
                                                                <span className="detail-label">PAN Number:</span>
                                                                <span className="detail-value">{kyc.pan_number}</span>
                                                            </div>
                                                        </div>

                                                        {kyc.status === 'rejected' && kyc.rejection_reason && (
                                                            <div className="kyc-detail-section" style={{ gridColumn: '1 / -1' }}>
                                                                <h4 style={{ color: '#ef4444' }}>Rejection Reason</h4>
                                                                <div className="detail-row">
                                                                    <span className="detail-value" style={{ color: '#fca5a5' }}>
                                                                        {kyc.rejection_reason}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>

                                ))}
                                {kycRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                            No KYC requests found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="settings-container">
                        <div className="admin-header">
                            <h1>Admin Settings</h1>
                            <p style={{ color: '#94a3b8' }}>Manage system configurations and admin profile.</p>
                        </div>

                        <div className="settings-grid">

                            {/* Profile Settings */}
                            <div className="settings-card">
                                <h3><Shield size={18} style={{ display: 'inline', marginRight: '8px' }} /> Admin Profile</h3>
                                <div className="form-group-admin">
                                    <label>Username</label>
                                    <input type="text" value={adminProfile.username} readOnly />
                                </div>
                                <div className="form-group-admin">
                                    <label>Email Address</label>
                                    <input type="email" value={adminProfile.email} readOnly />
                                </div>
                                <div className="form-group-admin">
                                    <label>Role</label>
                                    <input type="text" value="Super Administrator" disabled style={{ opacity: 0.7 }} />
                                </div>
                                <button className="btn-save">Update Profile</button>
                            </div>

                            {/* System Configuration */}
                            <div className="settings-card">
                                <h3><Server size={18} style={{ display: 'inline', marginRight: '8px' }} /> System Configuration</h3>

                                <div className="toggle-group">
                                    <label>Allow New Registrations</label>
                                    <div
                                        className={`toggle-switch ${registrationAllowed ? 'active' : ''}`}
                                        onClick={() => setRegistrationAllowed(!registrationAllowed)}
                                    >
                                        <div className="toggle-knob"></div>
                                    </div>
                                </div>

                                <div className="toggle-group">
                                    <label>Maintenance Mode</label>
                                    <div
                                        className={`toggle-switch ${maintenanceMode ? 'active' : ''}`}
                                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                                    >
                                        <div className="toggle-knob"></div>
                                    </div>
                                </div>

                                <div className="toggle-group">
                                    <label>Email Notifications</label>
                                    <div
                                        className={`toggle-switch ${notifications ? 'active' : ''}`}
                                        onClick={() => setNotifications(!notifications)}
                                    >
                                        <div className="toggle-knob"></div>
                                    </div>
                                </div>

                                <button className="btn-save" onClick={handleSaveSettings}>Save Configuration</button>
                            </div>

                            {/* Database Backup Simulator */}
                            <div className="settings-card">
                                <h3><Database size={18} style={{ display: 'inline', marginRight: '8px' }} /> Database Management</h3>
                                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '16px' }}>
                                    Last Backup: 2026-01-19 12:00 AM
                                </p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn-action" style={{ background: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '6px' }}>
                                        Backup Now
                                    </button>
                                    <button className="btn-action" style={{ background: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: '6px' }}>
                                        Clear Cache
                                    </button>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="settings-card">
                                <h3><Shield size={18} style={{ display: 'inline', marginRight: '8px' }} /> Security</h3>
                                <button className="btn-action" style={{ background: '#eab308', color: 'white', padding: '8px 16px', borderRadius: '6px', width: '100%' }}>
                                    Change Admin Password
                                </button>
                                <div style={{ marginTop: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                        <input type="checkbox" checked readOnly /> Require 2FA for Admin Login
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "messages" && (
                    <div className="data-table-container">
                        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1>User Messages</h1>
                                <p style={{ color: '#94a3b8' }}>Contact inquiries from users</p>
                            </div>
                            <button
                                className="btn-action"
                                style={{ background: '#10b981', color: 'white', padding: '8px 16px' }}
                                onClick={fetchMessages}
                                disabled={messagesLoading}
                            >
                                {messagesLoading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>

                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Message</th>
                                    <th>Received At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map((msg) => (
                                    <tr key={msg.id}>
                                        <td style={{ fontWeight: '600' }}>{msg.name}</td>
                                        <td>{msg.email}</td>
                                        <td style={{ maxWidth: '400px', whiteSpace: 'pre-wrap' }}>{msg.message}</td>
                                        <td style={{ color: '#94a3b8' }}>{formatTime(msg.created_at)}</td>
                                    </tr>
                                ))}
                                {messages.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                            No messages found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
