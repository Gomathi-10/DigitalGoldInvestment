import React, { useState, useEffect } from "react";
import "./Profile.css";
import AxiosInstance from "../../AxiosInstance";
import { User, ShieldCheck, MapPin, FileText, Eye, Calendar, Mail, Loader2 } from "lucide-react";

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await AxiosInstance.get("profile/");
                setProfileData(response.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="profile-loading">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
                <p>Loading Profile...</p>
            </div>
        );
    }

    const { user, kyc } = profileData;

    const DetailItem = ({ icon: Icon, label, value }) => (
        <div className="detail-item">
            <div className="detail-icon">
                <Icon size={18} />
            </div>
            <div className="detail-content">
                <span className="detail-label">{label}</span>
                <span className="detail-value">{value || "Not Provided"}</span>
            </div>
        </div>
    );

    const DocumentCard = ({ title, number, fileUrl }) => (
        <div className="document-card">
            <div className="document-info">
                <h3>{title}</h3>
                <p>{number || "XXXX-XXXX-XXXX"}</p>
            </div>
            {fileUrl && (
                <a
                    href={`http://localhost:8000${fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-doc-btn"
                >
                    <Eye size={16} /> View
                </a>
            )}
        </div>
    );

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="header-content">
                    <div className="profile-avatar">
                        <User size={40} />
                    </div>
                    <div className="header-text">
                        <h1>{kyc?.full_name || user.username || "User Profile"}</h1>
                        <p className="email-badge"><Mail size={14} /> {user.email}</p>
                    </div>
                </div>
                <div className={`kyc-status-badge ${kyc?.status || "none"}`}>
                    <ShieldCheck size={16} />
                    {kyc?.status ? kyc.status.toUpperCase() : "KYC NOT STARTED"}
                </div>
            </header>

            <div className="profile-grid">
                {/* Account Details */}
                <div className="profile-section glass-card">
                    <div className="section-title">
                        <User size={20} className="text-emerald-400" />
                        <h2>Account Details</h2>
                    </div>
                    <div className="details-list">
                        <DetailItem icon={User} label="Username" value={user.username} />
                        <DetailItem icon={Calendar} label="Member Since" value={new Date(user.date_joined).toLocaleDateString()} />
                    </div>
                </div>

                {/* Personal Details */}
                <div className="profile-section glass-card">
                    <div className="section-title">
                        <ShieldCheck size={20} className="text-emerald-400" />
                        <h2>Personal Identity</h2>
                    </div>
                    <div className="details-list">
                        <DetailItem icon={User} label="Full Name" value={kyc?.full_name} />
                        <DetailItem icon={Calendar} label="Date of Birth" value={kyc?.date_of_birth} />
                        <DetailItem icon={FileText} label="Phone Number" value={kyc?.phone_number} />
                    </div>
                </div>

                {/* Address Details */}
                <div className="profile-section glass-card">
                    <div className="section-title">
                        <MapPin size={20} className="text-emerald-400" />
                        <h2>Address</h2>
                    </div>
                    <div className="details-list">
                        <DetailItem icon={MapPin} label="Street" value={kyc?.address_line1} />
                        <DetailItem icon={MapPin} label="City/State" value={kyc ? `${kyc.city}, ${kyc.state}` : null} />
                        <DetailItem icon={MapPin} label="Pincode" value={kyc?.pincode} />
                    </div>
                </div>

                {/* Documents */}
                <div className="profile-section glass-card full-width">
                    <div className="section-title">
                        <FileText size={20} className="text-emerald-400" />
                        <h2>Verified Documents</h2>
                    </div>
                    <div className="documents-grid">
                        <DocumentCard
                            title="Aadhar Card"
                            number={kyc?.aadhar_number}
                            fileUrl={kyc?.aadhar_document}
                        />
                        <DocumentCard
                            title="PAN Card"
                            number={kyc?.pan_number}
                            fileUrl={kyc?.pan_document}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
