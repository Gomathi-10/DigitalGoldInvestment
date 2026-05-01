import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, Download } from "lucide-react";
import Sidebar from "../Dashboard/Sidebar";
import Header from "../Dashboard/Header";
import AxiosInstance from "../../AxiosInstance";
import "./TransactionHistory.css";

const TransactionHistory = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterMonth, setFilterMonth] = useState("");
    
    const user = { firstname: localStorage.getItem("username") || "User" };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await AxiosInstance.get("investments/");
            // Map backend fields to frontend expected fields
            const formattedTxns = res.data.map(item => {
                const amountInr = parseFloat(item.amount_inr);
                const grams = parseFloat(item.gold_grams);
                const orderId = item.razorpay_order_id;
                const dateObj = new Date(item.created_at);

                // Determine transaction type based on ID prefix or amount
                let type = "Gold Investment";
                if (orderId.startsWith("sell_")) {
                    type = "Gold Sale (Redemption)";
                } else if (orderId.startsWith("withdraw_") || orderId.startsWith("coin_")) {
                    type = "Physical Withdrawal";
                } else if (amountInr < 0 || grams < 0) {
                    type = "Asset Redemption";
                }

                return {
                    id: orderId.substring(0, 16),
                    full_id: orderId,
                    type: type,
                    date: dateObj.toLocaleDateString(),
                    rawDate: dateObj, // Store raw date for filtering
                    time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    displayAmount: Math.abs(amountInr),
                    displayGrams: Math.abs(grams),
                    unit: amountInr !== 0 ? "₹" : "g",
                    status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
                    method: orderId.startsWith('cs_') ? "Stripe" : (orderId.includes('mock') ? "Mock Gateway" : "Vault Balance")
                };
            });
            setTransactions(formattedTxns);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "success":
                return "status-completed";
            case "pending":
                return "status-pending";
            case "failed":
                return "status-failed";
            default:
                return "";
        }
    };

    const getIcon = (type) => {
        const isOuttake = type.includes("Sale") || type.includes("Withdrawal") || type.includes("Redemption");
        return isOuttake ? (
            <ArrowUpRight className="txn-icon outtake" />
        ) : (
            <ArrowDownLeft className="txn-icon intake" />
        );
    };

    // Filter Logic
    const filteredTransactions = transactions.filter(txn => {
        const matchesSearch = 
            txn.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.full_id.toLowerCase().includes(searchQuery.toLowerCase());
        
        const dateObj = txn.rawDate;
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        const formattedMonth = `${year}-${month}`;

        const matchesDate = filterDate ? formattedDate === filterDate : true;
        const matchesMonth = filterMonth ? formattedMonth === filterMonth : true;

        return matchesSearch && matchesDate && matchesMonth;
    });

    const clearFilters = () => {
        setSearchQuery("");
        setFilterDate("");
        setFilterMonth("");
    };

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activePage="Transaction History" />

            <div className="dashboard-main">
                <Header
                    user={user}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                <main className="dashboard-content">
                    <div className="dashboard-content-inner">
                        <div className="history-header">
                            <h1 className="page-title">Transaction History</h1>
                            <div className="history-actions">
                                <div className="search-box">
                                    <Search size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="filter-group">
                                    <div className="filter-item">
                                        <input 
                                            type="date" 
                                            value={filterDate}
                                            onChange={(e) => {
                                                setFilterDate(e.target.value);
                                                setFilterMonth(""); // Clear month if date is picked
                                            }}
                                            title="Filter by specific date"
                                        />
                                    </div>
                                    <div className="filter-item">
                                        <input 
                                            type="month" 
                                            value={filterMonth}
                                            onChange={(e) => {
                                                setFilterMonth(e.target.value);
                                                setFilterDate(""); // Clear date if month is picked
                                            }}
                                            title="Filter by month"
                                        />
                                    </div>
                                    {(searchQuery || filterDate || filterMonth) && (
                                        <button className="clear-filter-btn" onClick={clearFilters}>
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="history-table-container">
                            {loading ? (
                                <div className="loading-state">Loading transactions...</div>
                            ) : filteredTransactions.length === 0 ? (
                                <div className="empty-state">No transactions found matching your filters.</div>
                            ) : (
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Transaction ID</th>
                                            <th>Date & Time</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Method</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.map((txn, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="txn-type">
                                                        <div className="txn-icon-wrapper">
                                                            {getIcon(txn.type)}
                                                        </div>
                                                        <span>{txn.type}</span>
                                                    </div>
                                                </td>
                                                <td className="txn-id" title={txn.full_id}>{txn.id}...</td>
                                                <td>
                                                    <div className="txn-date">
                                                        <span className="date">{txn.date}</span>
                                                        <span className="time">{txn.time}</span>
                                                    </div>
                                                </td>
                                                <td className={`txn-amount ${txn.type.includes("Purchase") ? "negative" : "positive"}`}>
                                                    {txn.type.includes("Purchase") ? "-" : "+"}
                                                    {txn.unit === "₹" ? `₹${txn.displayAmount.toLocaleString()}` : `${txn.displayGrams}g`}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${getStatusColor(txn.status)}`}>
                                                        {txn.status === "Success" ? "Completed" : txn.status}
                                                    </span>
                                                </td>
                                                <td>{txn.method}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TransactionHistory;

