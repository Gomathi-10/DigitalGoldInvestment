import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import { toast } from "sonner";
import AxiosInstance from "../../AxiosInstance";
import "./KYC.css";

const KYC = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const user = { firstname: localStorage.getItem("username") || "User" };
    const [kycStatus, setKycStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showResubmitForm, setShowResubmitForm] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        date_of_birth: "",
        phone_number: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        aadhar_number: "",
        pan_number: "",
    });

    useEffect(() => {
        checkKYCStatus();
    }, []);

    const checkKYCStatus = async () => {
        try {
            const response = await AxiosInstance.get("kyc/status/");
            console.log("KYC status response:", response.data);
            if (response.data && response.data.status !== "not_submitted") {
                setKycStatus(response.data);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error checking KYC status:", error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateAge(formData.date_of_birth)) {
            toast.error("You must be at least 18 years old to complete KYC");
            return;
        }

        if (!/^\d{12}$/.test(formData.aadhar_number)) {
            toast.error("Aadhar number must be exactly 12 digits");
            return;
        }

        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number.toUpperCase())) {
            toast.error("Invalid PAN number format (e.g., ABCDE1234F)");
            return;
        }

        try {
            const response = await AxiosInstance.post("kyc/submit/", formData);
            console.log("Submission successful:", response.data);
            toast.success("KYC submitted successfully! Awaiting admin approval.");
            setShowResubmitForm(false);
            checkKYCStatus();
        } catch (error) {
            console.error("Error submitting KYC:", error);
            const errorMsg = error.response?.data?.error || "Failed to submit KYC";
            toast.error(errorMsg);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    // Determine what to render
    const isRejected = kycStatus && kycStatus.status === "rejected";
    const showForm = !kycStatus || (isRejected && showResubmitForm);

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="dashboard-main">
                <Header
                    user={user}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                <main className="dashboard-content">
                    <div className="dashboard-content-inner">
                        <div className="kyc-container">
                            <div className="kyc-header">
                                <h1 className="kyc-title">Account Verification (KYC)</h1>
                                <p className="kyc-subtitle">Complete your profile to unlock secure digital gold investments.</p>
                            </div>

                            {/* Status card — shown if KYC exists and not showing the re-submit form */}
                            {kycStatus && !showResubmitForm && (
                                <div className="kyc-status-card">
                                    <h2>KYC Status</h2>
                                    <div className={`status-badge status-${kycStatus.status}`}>
                                        {kycStatus.status.toUpperCase()}
                                    </div>

                                    {kycStatus.status === "pending" && (
                                        <p>Your KYC is under review. You'll be notified once approved.</p>
                                    )}

                                    {kycStatus.status === "approved" && (
                                        <p>🎉 Your KYC has been approved! You can now start investing in gold.</p>
                                    )}

                                    {kycStatus.status === "rejected" && (
                                        <div className="rejected-section">
                                            <p className="rejection-title">❌ Your KYC was rejected by the admin.</p>
                                            {kycStatus.rejection_reason && (
                                                <div className="rejection-reason-box">
                                                    <strong>Reason:</strong>
                                                    <p className="rejection-reason">{kycStatus.rejection_reason}</p>
                                                </div>
                                            )}
                                            <p className="resubmit-hint">
                                                Please correct the information and re-submit your KYC. Once approved by the admin, you can invest and buy gold.
                                            </p>
                                            <button
                                                className="submit-btn resubmit-btn"
                                                onClick={() => {
                                                    setShowResubmitForm(true);
                                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                                }}
                                            >
                                                🔄 Re-submit KYC
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* KYC Form — shown for new submissions or resubmissions */}
                            {showForm && (
                                <div>
                                    {isRejected && (
                                        <div className="resubmit-notice">
                                            <span>⚠️ You are re-submitting your KYC. Please provide correct and updated information.</span>
                                            <button
                                                className="cancel-resubmit-btn"
                                                onClick={() => setShowResubmitForm(false)}
                                            >
                                                ✕ Cancel
                                            </button>
                                        </div>
                                    )}
                                    <form onSubmit={handleSubmit} className="kyc-form">
                                        {/* Personal Details */}
                                        <div className="form-section">
                                            <h3>Personal Details</h3>
                                            <div className="form-grid">
                                                <div className="form-group">
                                                    <label>Full Name *</label>
                                                    <input
                                                        type="text"
                                                        name="full_name"
                                                        value={formData.full_name}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Date of Birth *</label>
                                                    <input
                                                        type="date"
                                                        name="date_of_birth"
                                                        value={formData.date_of_birth}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Phone Number *</label>
                                                    <input
                                                        type="tel"
                                                        name="phone_number"
                                                        value={formData.phone_number}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Details */}
                                        <div className="form-section">
                                            <h3>Address Details</h3>
                                            <div className="form-grid">
                                                <div className="form-group full-width">
                                                    <label>Address Line 1 *</label>
                                                    <input
                                                        type="text"
                                                        name="address_line1"
                                                        value={formData.address_line1}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group full-width">
                                                    <label>Address Line 2</label>
                                                    <input
                                                        type="text"
                                                        name="address_line2"
                                                        value={formData.address_line2}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>City *</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>State *</label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Pincode *</label>
                                                    <input
                                                        type="text"
                                                        name="pincode"
                                                        value={formData.pincode}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Country *</label>
                                                    <input
                                                        type="text"
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Document Details */}
                                        <div className="form-section">
                                            <h3>Document Details</h3>
                                            <div className="form-grid">
                                                <div className="form-group">
                                                    <label>Aadhar Number * (12 digits)</label>
                                                    <input
                                                        type="text"
                                                        name="aadhar_number"
                                                        value={formData.aadhar_number}
                                                        onChange={handleChange}
                                                        maxLength="12"
                                                        placeholder="123456789012"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>PAN Number * (e.g., ABCDE1234F)</label>
                                                    <input
                                                        type="text"
                                                        name="pan_number"
                                                        value={formData.pan_number}
                                                        onChange={handleChange}
                                                        maxLength="10"
                                                        placeholder="ABCDE1234F"
                                                        style={{ textTransform: "uppercase" }}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-actions">
                                            <button type="submit" className="submit-btn">
                                                {isRejected ? "🔄 Re-submit KYC" : "Submit KYC"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default KYC;
