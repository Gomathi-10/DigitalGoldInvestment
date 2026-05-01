import { useState, useEffect } from "react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import "./Withdraw.css";
import AxiosInstance from "../../AxiosInstance";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Withdraw = () => {
    const [activeTab, setActiveTab] = useState("liquidate"); // "liquidate" or "physical"
    const [vaultBalance, setVaultBalance] = useState(0);
    const [goldRate, setGoldRate] = useState(null);
    const [amountInr, setAmountInr] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [purchasedCoins, setPurchasedCoins] = useState([]);

    const user = { firstname: localStorage.getItem("username") || "User" };
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            // 1. Fetch Vault and Rate
            const [vaultRes, rateRes, coinsRes] = await Promise.all([
                AxiosInstance.get("gold-vault/"),
                AxiosInstance.get("gold-price/"),
                AxiosInstance.get("withdraw/purchased-coins/")
            ]);

            setVaultBalance(parseFloat(vaultRes.data.total_gold_grams) || 0);
            setGoldRate(rateRes.data.rate);
            setPurchasedCoins(coinsRes.data);

        } catch (error) {
            console.error("Fetch Data Error:", error);
            toast.error("Failed to load your portfolio data");
        }
    };

    const handleSellGold = async () => {
        if (!amountInr || amountInr <= 0) {
            toast.error("Please enter a valid amount to withdraw");
            return;
        }

        const gramsExpected = amountInr / goldRate;
        if (gramsExpected > vaultBalance) {
            toast.error(`Insufficient gold balance. You need ${gramsExpected.toFixed(4)}g for ₹${amountInr}`);
            return;
        }

        setLoading(true);
        try {
            const response = await AxiosInstance.post("withdraw/sell-gold/", {
                amount: amountInr
            });

            if (response.data.status === "success") {
                toast.success(response.data.message);
                setAmountInr("");
                fetchAllData(); // Refresh everything
                setTimeout(() => navigate("/dashboard"), 2000);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Withdrawal failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePhysicalWithdraw = async () => {
        if (!selectedCoin) {
            toast.error("Please select a physical asset to withdraw");
            return;
        }

        setLoading(true);
        try {
            const response = await AxiosInstance.post("withdraw/physical/", {
                coin_id: selectedCoin.id,
                weight: selectedCoin.weight
            });

            if (response.data.status === "success") {
                toast.success(response.data.message);
                setSelectedCoin(null);
                fetchAllData(); // Refresh everything
                setTimeout(() => navigate("/dashboard"), 2000);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Withdrawal failed");
        } finally {
            setLoading(false);
        }
    };

    const estimatedGrams = amountInr && goldRate ? (amountInr / goldRate).toFixed(4) : "0.0000";

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
                        <div className="withdraw-container">
                            <div className="withdraw-grid">
                                <div className="withdraw-card glass-card emerald-glow">
                                    <h1 className="withdraw-title">Asset Withdrawal</h1>

                                    <div className="balance-card">
                                        <div className="balance-info">
                                            <span className="label">Total Gold Balance</span>
                                            <div className="value">{vaultBalance.toFixed(4)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>grams</span></div>
                                        </div>
                                        <div className="balance-info text-right" style={{ textAlign: 'right' }}>
                                            <span className="label">Estimated Value</span>
                                            <div className="value">₹ {(vaultBalance * (goldRate || 0)).toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="withdraw-tabs">
                                        <button
                                            className={`tab-btn ${activeTab === 'liquidate' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('liquidate')}
                                        >
                                            Withdraw to Account
                                        </button>
                                        <button
                                            className={`tab-btn ${activeTab === 'physical' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('physical')}
                                        >
                                            Physical Delivery
                                        </button>
                                    </div>

                                    {activeTab === 'liquidate' ? (
                                        <div className="withdraw-form animate-fade-in">
                                            <label className="input-label">Enter amount to withdraw (INR)</label>
                                            <div className="withdraw-input-wrapper">
                                                <input
                                                    type="number"
                                                    value={amountInr}
                                                    onChange={(e) => setAmountInr(e.target.value)}
                                                    placeholder="eg. 1000"
                                                />
                                                <span className="unit-tag">INR (₹)</span>
                                            </div>

                                            <div className="calculation-box">
                                                <div className="calc-row">
                                                    <span className="calc-label">Current Selling Rate (24K Gold)</span>
                                                    <span className="calc-value">₹ {goldRate?.toLocaleString()} / g</span>
                                                </div>
                                                <div className="calc-row">
                                                    <span className="calc-label">Gold Weight to be Deducted</span>
                                                    <span className="calc-value">{estimatedGrams} Grams</span>
                                                </div>
                                                <div className="calc-row">
                                                    <span className="calc-label">Total Cash Transfer</span>
                                                    <span className="total-value">₹ {parseFloat(amountInr || 0).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <button
                                                className="withdraw-btn"
                                                onClick={handleSellGold}
                                                disabled={loading || !amountInr || amountInr <= 0}
                                            >
                                                {loading ? "Processing..." : "Confirm"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="withdraw-form animate-fade-in">
                                            <p className="input-label">Your Purchased Assets (Select for delivery)</p>

                                            {purchasedCoins.length === 0 ? (
                                                <div className="empty-state-card" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                                                    <h3 style={{ marginBottom: '0.5rem' }}>No physical coins found</h3>
                                                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Purchase gold coins first to request physical delivery.</p>
                                                    <button
                                                        className="text-emerald"
                                                        onClick={() => navigate("/buy-coins")}
                                                        style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer', marginTop: '1.5rem' }}
                                                    >
                                                        Visit Coin Store
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="coins-grid">
                                                    {purchasedCoins.map((coin, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`coin-item ${selectedCoin?.id === coin.id ? 'selected' : ''}`}
                                                            onClick={() => setSelectedCoin(coin)}
                                                        >
                                                            <div className="coin-icon">🌕</div>
                                                            <div className="coin-name">{coin.name}</div>
                                                            <div className="coin-weight">{coin.weight}g 24K Pure</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '5px' }}>Bought: {new Date(coin.purchase_date).toLocaleDateString()}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {selectedCoin && (
                                                <div className="calculation-box" style={{ marginTop: '2rem' }}>
                                                    <div className="calc-row">
                                                        <span className="calc-label">Asset for Delivery</span>
                                                        <span className="calc-value text-emerald">{selectedCoin.name}</span>
                                                    </div>
                                                    <div className="calc-row">
                                                        <span className="calc-label">Registered Address</span>
                                                        <span className="calc-value">Verified Profile Address</span>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                className="withdraw-btn"
                                                style={{ marginTop: '1rem' }}
                                                onClick={handlePhysicalWithdraw}
                                                disabled={loading || !selectedCoin}
                                            >
                                                {loading ? "Processing..." : "Confirm"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="withdraw-sidebar-grid">
                                    <div className="invest-info-card glass-card">
                                        <h3>Withdrawal Policies</h3>
                                        <ul className="benefits-list">
                                            <li>Instant INR transfer to Bank/Wallet</li>
                                            <li>No hidden fees on liquidation</li>
                                            <li>Secured logistics for physical delivery</li>
                                            <li>Tracking ID provided within 24 hours</li>
                                        </ul>
                                    </div>

                                    <div className="invest-info-card glass-card" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                                        <h3 style={{ color: '#ef4444' }}>Identity Check</h3>
                                        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                            Physical gold delivery requires a valid ID proof compatible with your KYC records at the time of handover.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Withdraw;
