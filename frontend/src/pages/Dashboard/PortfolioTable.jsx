import { useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, InfoIcon } from "lucide-react";
import { toast } from "sonner";
import "./PortfolioTable.css";

const PortfolioTable = () => {
  const [activeTab, setActiveTab] = useState("all");

  const portfolioData = [
    {
      asset: "Gold",
      icon: "🪙",
      available: 0,
      pendingSettlement: 0,
      pendingWithdrawal: 0,
      pendingDeposit: 0,
      total: 0,
      unitPrice: 6994.7034,
      fccy: 0,
      type: "digital",
    },
    {
      asset: "Silver",
      icon: "⚪",
      available: 0,
      pendingSettlement: 0,
      pendingWithdrawal: 0,
      pendingDeposit: 0,
      total: 0,
      unitPrice: 23.55,
      fccy: 0,
      type: "digital",
    },
    {
      asset: "Indian Rupee",
      icon: "₹",
      available: 0,
      pendingSettlement: 0,
      pendingWithdrawal: 0,
      pendingDeposit: 0,
      total: 0,
      unitPrice: 1.0,
      fccy: 0,
      type: "fiat",
    },
  ];

  const filteredData =
    activeTab === "all"
      ? portfolioData
      : activeTab === "digital"
        ? portfolioData.filter((item) => item.type === "digital")
        : portfolioData.filter((item) => item.type === "fiat");

  const handleAction = (action) => {
    toast.success(`${action} action initiated`, {
      description: `Processing your ${action.toLowerCase()} request.`,
    });
  };

  return (
    <div className="portfolio-card">
      <div className="portfolio-header">
        <h2 className="portfolio-title">Portfolio</h2>

        <div className="portfolio-actions">
          <button className="action-btn" onClick={() => handleAction("Transfer")}>
            <RefreshCw className="icon" /> Transfer
          </button>

          <button className="action-btn" onClick={() => handleAction("Deposit")}>
            <ArrowDownCircle className="icon" /> Deposit
          </button>

          <button className="action-btn" onClick={() => handleAction("Withdraw")}>
            <ArrowUpCircle className="icon" /> Withdraw
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>

        <button
          className={`tab-btn ${activeTab === "digital" ? "active" : ""}`}
          onClick={() => setActiveTab("digital")}
        >
          Digital Assets
        </button>

        <button
          className={`tab-btn ${activeTab === "fiat" ? "active" : ""}`}
          onClick={() => setActiveTab("fiat")}
        >
          Fiat
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="portfolio-table">
          <thead>
            <tr>
              <th>Assets</th>
              <th>
                <div className="header-flex">
                  Available <InfoIcon className="info-small" />
                </div>
              </th>
              <th>
                <div className="header-flex">
                  Pending Settlement <InfoIcon className="info-small" />
                </div>
              </th>
              <th>
                <div className="header-flex">
                  Pending Withdrawal <InfoIcon className="info-small" />
                </div>
              </th>
              <th>
                <div className="header-flex">
                  Pending Deposit <InfoIcon className="info-small" />
                </div>
              </th>
              <th>Total</th>
              <th>
                <div className="header-flex">
                  Unit Price <InfoIcon className="info-small" />
                </div>
              </th>
              <th>
                <div className="header-flex">
                  FCCY Value <InfoIcon className="info-small" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td>
                  <div className="asset-flex">
                    <div className="asset-icon">{item.icon}</div>
                    <span>{item.asset}</span>

                    {item.type === "digital" && (
                      <span className="badge">Digital</span>
                    )}
                  </div>
                </td>

                <td className="mono">{item.available.toFixed(4)}</td>
                <td className="mono">{item.pendingSettlement.toFixed(4)}</td>
                <td className="mono">{item.pendingWithdrawal.toFixed(4)}</td>
                <td className="mono">{item.pendingDeposit.toFixed(4)}</td>
                <td className="mono bold">{item.total.toFixed(4)}</td>
                <td className="mono">{item.unitPrice.toFixed(4)}</td>
                <td className="mono bold primary">{item.fccy.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;
