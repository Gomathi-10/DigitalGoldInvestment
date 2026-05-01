import { useState, useEffect } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import "./Invest.css";
import AxiosInstance from "../../AxiosInstance";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import GoldPriceChart from "./GoldPriceChart";

const Invest = () => {
    const [amount, setAmount] = useState("");
    const [goldRate, setGoldRate] = useState(null);
    const [goldGrams, setGoldGrams] = useState(0);
    const [kycStatus, setKycStatus] = useState("loading");


    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [investmentMode, setInvestmentMode] = useState("lumpSum"); // "lumpSum" or "sip"
    const [duration, setDuration] = useState(3); // Years
    const [sipFrequency, setSipFrequency] = useState("daily");
    const [sipDays, setSipDays] = useState(30);
    const [projectedGold, setProjectedGold] = useState(0);
    const [projectedValue, setProjectedValue] = useState(0);

    const user = { firstname: localStorage.getItem("username") || "User" };
    const navigate = useNavigate();

    useEffect(() => {
        fetchInitialData();
        fetchSipPreference();
    }, []);

    const fetchSipPreference = async () => {
        try {
            const res = await AxiosInstance.get("sip-preference/");
            if (res.data.status !== "not_set" && res.data.frequency) {
                setSipFrequency(res.data.frequency);
                if (res.data.amount) setAmount(res.data.amount.toString());
                if (res.data.days) setSipDays(res.data.days);
            }
        } catch (error) {
            console.error("Error fetching SIP preference:", error);
        }
    };

    const handleSipFrequencyChange = async (freq) => {
        setSipFrequency(freq);
        if (freq === "daily" && amount) {
            toast.message(`You have chosen to invest ₹${amount} daily.`);
        }
        
        // Save preference
        try {
            await AxiosInstance.post("sip-preference/", {
                frequency: freq,
                amount: amount || 0,
                days: sipDays
            });
        } catch (error) {
            console.error("Failed to save SIP preference:", error);
        }
    };

    const handleSipDaysChange = (e) => {
        setSipDays(parseInt(e.target.value) || 0);
    };

    const handleSipDaysBlur = async () => {
        if (sipDays > 0) {
            toast.message(`SIP duration set to ${sipDays} days.`);
            if (investmentMode === "sip") {
                try {
                    await AxiosInstance.post("sip-preference/", {
                        frequency: sipFrequency,
                        amount: amount || 0,
                        days: sipDays
                    });
                } catch (error) {
                    console.error("Failed to save SIP preference:", error);
                }
            }
        }
    };

    const fetchInitialData = async () => {
        // 1. Check KYC Status
        try {
            const kycRes = await AxiosInstance.get("kyc/status/");
            console.log("DEBUG Invest: KYC Status Data Received:", kycRes.data);

            // Handle both {status: '...'} and full KYC object
            let status = kycRes.data.status;
            if (status) {
                status = status.toLowerCase();
            } else {
                console.warn("DEBUG Invest: Status field missing in response, defaulting to 'pending'");
                status = "pending";
            }

            console.log("DEBUG Invest: Setting kycStatus to:", status);
            setKycStatus(status);
        } catch (error) {

            console.error("DEBUG Invest: KYC Fetch Error:", error);
            if (error.response && error.response.status === 404) {
                setKycStatus("not_submitted");
            } else if (error.response && error.response.status === 401) {
                toast.error("Authentication required. Please log in again.");
                navigate("/login");
            } else {
                setKycStatus("error");
                toast.error("Failed to check KYC status");
            }
        }

        // 2. Fetch Gold Rate
        try {
            const rateRes = await AxiosInstance.get("gold-price/");
            setGoldRate(rateRes.data.rate);
        } catch (error) {
            console.error("DEBUG Invest: Gold Rate Fetch Error:", error);
            toast.error("Failed to fetch live gold rate");
        }
    };



    useEffect(() => {
        if (goldRate && amount > 0) {
            calculateProjections();
        }
    }, [amount, goldRate, investmentMode, duration, sipFrequency, sipDays]);

    const calculateProjections = () => {
        const amt = parseFloat(amount);
        if (investmentMode === "lumpSum") {
            const grams = amt / goldRate;
            setGoldGrams(grams.toFixed(4));
            // Project over 'duration' years with ~10% annual growth
            const projectedRate = goldRate * Math.pow(1.10, duration);
            setProjectedValue(roundTo(grams * projectedRate, 2));
            setProjectedGold(grams.toFixed(4));
        } else {
            // SIP Mode
            const timesPerYear = sipFrequency === "daily" ? 365 : 12;
            const tempDuration = sipDays > 0 ? (sipDays / 365) : duration; // use sipDays if set, otherwise duration years
            const totalPeriods = sipFrequency === "daily" ? (sipDays > 0 ? sipDays : duration * 365) : (sipDays > 0 ? (sipDays / 30) : duration * 12);
            
            const totalInvested = amt * totalPeriods;
            const gramsAccumulated = totalInvested / goldRate;

            setGoldGrams(gramsAccumulated.toFixed(4));

            // Average compounding return on SIP
            const annualGrowth = 0.12;
            const projectedSIPValue = totalInvested * Math.pow(1 + annualGrowth / 2, tempDuration); 

            setProjectedGold(gramsAccumulated.toFixed(4));
            setProjectedValue(roundTo(projectedSIPValue, 2));
        }
    };

    const roundTo = (num, places) => {
        return +(Math.round(num + "e+" + places) + "e-" + places);
    };

    const calculateGold = async (val) => {
        setAmount(val);
        // Save amount preference if in SIP mode
        if (investmentMode === "sip") {
            try {
                await AxiosInstance.post("sip-preference/", {
                    frequency: sipFrequency,
                    amount: val || 0,
                    days: sipDays
                });
            } catch (error) {
                console.error("Failed to save SIP preference:", error);
            }
        }
    };

    const handleInvest = async () => {
        if (!amount || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setLoading(true);
        try {
            const response = await AxiosInstance.post("invest/create/", {
                amount: amount,
            });

            const { checkout_url } = response.data;

            if (checkout_url) {
                window.location.href = checkout_url;
            } else {
                toast.error("Failed to initialize payment");
            }

        } catch (error) {
            console.error("Investment Error:", error);
            toast.error(error.response?.data?.error || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleMockInvest = async () => {
        if (!amount || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setLoading(true);
        try {
            const response = await AxiosInstance.post("invest/create/", {
                amount: amount,
                is_mock: true
            });

            if (response.data.status === "success") {
                toast.success(response.data.message);
                setTimeout(() => navigate("/dashboard"), 1500);
            }
        } catch (error) {
            console.error("Mock Investment Error:", error);
            toast.error(error.response?.data?.error || "Mock transaction failed");
        } finally {
            setLoading(false);
        }
    };



    if (kycStatus === "loading") return <div className="loading">Checking KYC Status...</div>;

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
                        <div className="invest-container">
                            {kycStatus !== "approved" ? (
                                <div className="kyc-warning-card glass-card">
                                    <h2 className="text-emerald">KYC Required</h2>
                                    <p>You cannot invest until your KYC is approved by the admin.</p>
                                    <p>Current Status: <span className={`status-badge status-${kycStatus}`}>{kycStatus.toUpperCase()}</span></p>
                                    <button className="emerald-btn" onClick={() => navigate("/kyc")}>Go to KYC Page</button>
                                </div>
                            ) : (
                                <div className="invest-grid">
                                    <div className="invest-card glass-card emerald-glow">
                                        <h1 className="invest-title">Gold Investment Planner</h1>

                                        <div className="mode-toggle-group">
                                            <button
                                                className={`mode-btn ${investmentMode === "lumpSum" ? "active" : ""}`}
                                                onClick={() => setInvestmentMode("lumpSum")}
                                            >
                                                Lump Sum
                                            </button>
                                            <button
                                                className={`mode-btn ${investmentMode === "sip" ? "active" : ""}`}
                                                onClick={() => setInvestmentMode("sip")}
                                            >
                                                SIP (Daily)
                                            </button>
                                        </div>

                                        <div className="gold-rate-card">
                                            <span className="label">Current Gold Rate (24K)</span>
                                            <h2 className="rate-value">₹ {goldRate ? goldRate.toLocaleString() : "..."} <span className="unit">/ gm</span></h2>
                                        </div>

                                        <div className="investment-form">
                                            <div className="input-group-emerald">
                                                <label>{investmentMode === "sip" ? (sipFrequency === "monthly" ? "Monthly Investment Amount (₹)" : "Daily Investment Amount (₹)") : "Amount to Invest (₹)"}</label>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => calculateGold(e.target.value)}
                                                    placeholder={investmentMode === "sip" ? "eg. 100" : "eg. 1000"}
                                                />
                                            </div>

                                            {investmentMode === "sip" && (
                                                <div className="sip-frequency-selector">
                                                    <label>Frequency:</label>
                                                    <div className="mode-toggle-group" style={{ marginBottom: '15px' }}>
                                                        <button
                                                            className={`mode-btn ${sipFrequency === "daily" ? "active" : ""}`}
                                                            onClick={() => handleSipFrequencyChange("daily")}
                                                            style={{ fontSize: '0.9rem', padding: '8px 15px' }}
                                                        >
                                                            Daily
                                                        </button>
                                                        <button
                                                            className={`mode-btn ${sipFrequency === "monthly" ? "active" : ""}`}
                                                            onClick={() => handleSipFrequencyChange("monthly")}
                                                            style={{ fontSize: '0.9rem', padding: '8px 15px' }}
                                                        >
                                                            Monthly
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {investmentMode === "sip" ? (
                                                 <div className="duration-selector">
                                                    <label>Investment Duration: <span className="text-emerald">{sipDays} Days</span></label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={sipDays}
                                                        onChange={handleSipDaysChange}
                                                        onBlur={handleSipDaysBlur}
                                                        className="duration-input"
                                                        placeholder="Number of days"
                                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: 'white', marginTop: '10px' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="duration-selector">
                                                    <label>Investment Duration: <span className="text-emerald">{duration} Years</span></label>
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="10"
                                                        value={duration}
                                                        onChange={(e) => setDuration(parseInt(e.target.value))}
                                                        className="duration-slider"
                                                    />
                                                    <div className="slider-labels">
                                                        <span>1Y</span>
                                                        <span>5Y</span>
                                                        <span>10Y</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="projection-results">
                                                <div className="result-item">
                                                    <span className="label">Total Gold Accumulation:</span>
                                                    <h3 className="value text-emerald">{goldGrams} Grams</h3>
                                                </div>
                                                <div className="result-item separator">
                                                    <span className="label">Projected Future Value:</span>
                                                    <h3 className="value text-emerald">₹ {projectedValue.toLocaleString()}</h3>
                                                </div>
                                            </div>

                                            <div className="invest-button-group">
                                                <button
                                                    className="invest-now-btn"
                                                    onClick={handleInvest}
                                                    disabled={loading || !amount}
                                                >
                                                    {loading ? "Processing..." : "Start Investing"}
                                                </button>

                                                <button
                                                    className="mock-invest-btn"
                                                    onClick={handleMockInvest}
                                                    disabled={loading || !amount}
                                                >
                                                    Mock Invest (Instant)
                                                </button>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="invest-sidebar-grid">
                                        <div className="invest-info-card glass-card">
                                            <h3 className="sidebar-title">Projected Returns</h3>
                                            <p className="sidebar-subtitle">Based on your investment of <span className="text-emerald">₹{amount || 1000}</span></p>

                                            <GoldPriceChart amount={amount} mode={investmentMode} duration={duration} />

                                            <div className="projection-note">
                                                <p>* Projected value over {duration} years at ~12% annual growth.</p>
                                            </div>
                                        </div>

                                        <div className="invest-info-card glass-card">
                                            <h3>Why Invest in Digital Gold?</h3>
                                            <ul className="benefits-list">
                                                <li>99.9% Pure 24K Gold</li>
                                                <li>Safe & Secure Vault Storage</li>
                                                <li>Start with as little as ₹100</li>
                                                <li>Instant Liquidity</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};


export default Invest;
