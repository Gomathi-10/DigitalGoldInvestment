import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import AxiosInstance from "../../AxiosInstance";
import { toast } from "sonner";
import "./BuyCoins.css";

const BuyCoins = () => {
    const [coins, setCoins] = useState([]);
    const [userBalance, setUserBalance] = useState(0);
    const [userInrBalance, setUserInrBalance] = useState(0);
    const [purchasedCoinsGrams, setPurchasedCoinsGrams] = useState(0);
    const [loading, setLoading] = useState(true);
    const [kycStatus, setKycStatus] = useState("loading");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const user = { firstname: localStorage.getItem("username") || "User" };
    const navigate = useNavigate();

    useEffect(() => {
        checkKYCAndFetchCoins();
    }, []);

    const checkKYCAndFetchCoins = async () => {
        try {
            const kycRes = await AxiosInstance.get("kyc/status/");
            const status = (kycRes.data.status || "not_submitted").toLowerCase();
            setKycStatus(status);
            if (status === "approved") {
                await fetchCoins();
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("KYC check error:", error);
            setKycStatus("error");
            setLoading(false);
        }
    };

    const fetchCoins = async () => {
        try {
            const res = await AxiosInstance.get("coin-products/");
            setCoins(res.data.coins);
            setUserBalance(res.data.user_balance);
            setUserInrBalance(res.data.total_invested_inr || 0);
            setPurchasedCoinsGrams(res.data.purchased_coins_grams || 0);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching coins:", error);
            if (error.response?.status === 403) {
                const backendStatus = error.response?.data?.kyc_status || "not_submitted";
                setKycStatus(backendStatus);
            } else {
                toast.error("Failed to load gold coins");
            }
            setLoading(false);
        }
    };

    // Stripe payment — redirects to Stripe checkout page
    const handleStripePayment = async (coin) => {
        try {
            toast.loading("Preparing Stripe checkout...");
            const res = await AxiosInstance.post("coin-purchase/", {
                coin_id: coin.id,
                weight: coin.weight,
                use_balance: false,
                is_mock: false
            });
            toast.dismiss();

            if (res.data.checkout_url) {
                // Redirect to Stripe hosted checkout
                window.location.href = res.data.checkout_url;
            } else {
                toast.error("Could not get Stripe checkout URL");
            }
        } catch (error) {
            toast.dismiss();
            console.error("Stripe error:", error);
            toast.error(error.response?.data?.error || "Stripe payment failed");
        }
    };

    // Mock payment — instant mock gateway
    const handleMockPayment = async (coin) => {
        try {
            toast.loading("Processing Mock Purchase...");
            const res = await AxiosInstance.post("coin-purchase/", {
                coin_id: coin.id,
                weight: coin.weight,
                use_balance: false,
                is_mock: true
            });
            toast.dismiss();
            if (res.data.status === "success") {
                toast.success(res.data.message);
                fetchCoins();
            } else {
                toast.error("Mock purchase failed");
            }
        } catch (error) {
            toast.dismiss();
            console.error("Mock Purchase error:", error);
            toast.error(error.response?.data?.error || "Mock transaction failed");
        }
    };

    if (kycStatus === "loading" || loading) {
        return (
            <div className="dashboard-container">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="dashboard-main">
                    <Header user={user} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                    <main className="dashboard-content">
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
                            <div className="loading">Checking KYC Status...</div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="dashboard-main">
                <Header
                    user={user}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                <main className="dashboard-content">
                    <div className="buy-coins-container">

                        {/* KYC Gate */}
                        {kycStatus !== "approved" ? (
                            <div className="kyc-warning-card glass-card">
                                <div className="kyc-warning-icon">🔒</div>
                                <h2>KYC Verification Required</h2>
                                {kycStatus === "not_submitted" && (
                                    <>
                                        <p>You must complete KYC verification before purchasing gold coins.</p>
                                        <p>Submit your KYC and wait for admin approval to unlock gold purchases.</p>
                                    </>
                                )}
                                {kycStatus === "pending" && (
                                    <>
                                        <p>Your KYC is currently <strong>under review</strong> by the admin.</p>
                                        <p>You will be able to purchase gold coins once your KYC is approved.</p>
                                    </>
                                )}
                                {kycStatus === "rejected" && (
                                    <>
                                        <p>Your KYC was <strong>rejected</strong> by the admin.</p>
                                        <p>Please go to the KYC page, review the rejection reason, and re-submit with correct information.</p>
                                    </>
                                )}
                                <p>
                                    Current Status:{" "}
                                    <span className={`status-badge status-${kycStatus}`}>
                                        {kycStatus.replace("_", " ").toUpperCase()}
                                    </span>
                                </p>
                                <button
                                    className="buy-btn btn-stripe"
                                    style={{ marginTop: "1rem" }}
                                    onClick={() => navigate("/kyc")}
                                >
                                    {kycStatus === "rejected" ? "🔄 Re-submit KYC" : "Go to KYC Page"}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="buy-coins-header">
                                    <h1 className="buy-coins-title">Physical Gold Coins</h1>
                                    <p className="buy-coins-subtitle">Mint your digital gold into physical 24K 99.9% pure coins.</p>
                                </div>

                                {/* Vault Balance Card */}
                                <div className="balance-card">
                                    <div className="balance-info">
                                        <h3>Your Digital Wealth</h3>
                                        <div className="balance-row">
                                            <div className="balance-item">
                                                <span className="balance-label">Vault Gold:</span>
                                                <span className="balance-amount">{Math.max(0, userBalance).toFixed(4)}g</span>
                                            </div>
                                            <div className="balance-divider"></div>
                                            <div className="balance-item">
                                                <span className="balance-label">Gold Coins:</span>
                                                <span className="balance-amount" style={{ color: '#f59e0b' }}>{purchasedCoinsGrams.toFixed(4)}g</span>
                                            </div>
                                            <div className="balance-divider"></div>
                                            <div className="balance-item">
                                                <span className="balance-label">Portfolio Value:</span>
                                                <span className="balance-amount">₹{userInrBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="balance-badge">
                                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Verified 24K Gold Assets</span>
                                    </div>
                                </div>

                                <div className="coins-grid">
                                    {coins.map((coin) => (
                                        <div className="coin-card" key={coin.id}>
                                            <div className="coin-image-container">
                                                <div className="coin-img-wrapper">
                                                    <img
                                                        src={coin.image}
                                                        alt={coin.name}
                                                        className="coin-real-img"
                                                    />
                                                    <div className="coin-glow"></div>
                                                </div>
                                            </div>

                                            <div className="coin-info">
                                                <div className="coin-header-inline">
                                                    <h2 className="coin-name">{coin.name}</h2>
                                                    <div className="coin-price">₹{coin.price_inr.toLocaleString()}</div>
                                                </div>
                                                <p className="coin-weight">Purity: 24K (99.9% Pure) • Weight: {coin.weight}g</p>

                                                <div className="coin-actions">
                                                    {coin.can_afford ? (
                                                        <div className="coin-actions-group">
                                                            <div className="purchase-buttons-row">
                                                                <button
                                                                    className="buy-btn btn-stripe"
                                                                    onClick={() => handleStripePayment(coin)}
                                                                >
                                                                    💳 Buy with Stripe
                                                                </button>
                                                                <button
                                                                    className="buy-btn btn-mock"
                                                                    onClick={() => handleMockPayment(coin)}
                                                                >
                                                                    Mock
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="insufficient-block">
                                                            <div className="insufficient-block-icon">⚠️</div>
                                                            <div className="insufficient-block-body">
                                                                <p className="insufficient-block-title">Insufficient Portfolio</p>
                                                                <p className="insufficient-block-desc">
                                                                    Your portfolio value (₹{userInrBalance.toLocaleString()}) is below the coin price (₹{coin.price_inr.toLocaleString()}).
                                                                    Invest <strong className="shortfall">₹{coin.funds_needed_inr.toLocaleString()}</strong> more to unlock this coin.
                                                                </p>
                                                            </div>
                                                            <button
                                                                className="buy-btn btn-invest-now"
                                                                onClick={() => navigate("/invest")}
                                                            >
                                                                📈 Invest Now
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BuyCoins;
