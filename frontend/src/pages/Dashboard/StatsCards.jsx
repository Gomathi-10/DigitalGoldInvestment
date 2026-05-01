import { useState, useEffect } from "react";
import { DollarSign, Coins, Building2, TrendingUp, Loader2 } from "lucide-react";
import AxiosInstance from "../../AxiosInstance";
import "./StatsCards.css";

const StatsCards = () => {
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [goldValue, setGoldValue] = useState(0);
  const [purchasedCoins, setPurchasedCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [digitalAssetsValue] = useState(0);
  const [fiatValue] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await AxiosInstance.get("gold-vault/");
        setPortfolioValue(response.data.total_invested_inr);
        setGoldValue(response.data.total_gold_grams);
        setPurchasedCoins(response.data.purchased_coins_grams || 0);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      title: "Portfolio Value",
      value: loading ? "..." : `₹${portfolioValue.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      gradient: true,
      large: true
    },
    {
      title: "Gold",
      value: loading ? "..." : `${goldValue.toLocaleString()} g`,
      icon: Coins,
      type: "gold"
    },
    {
      title: "Gold Coins",
      value: loading ? "..." : `${purchasedCoins.toLocaleString()} g`,
      icon: Coins,
      type: "gold"
    },
    {
      title: "Other Digital Assets",
      value: digitalAssetsValue.toLocaleString(),
      icon: Building2,
      type: "digital"
    },
    {
      title: "Fiat",
      value: fiatValue.toLocaleString(),
      icon: TrendingUp,
      type: "fiat"
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`stat-card ${stat.gradient ? "gradient-card" : stat.type} ${stat.large ? "large-card" : ""
            }`}
        >
          <div className="stat-header">
            <h3 className={`stat-title ${stat.gradient ? "white-text" : ""}`}>
              {stat.title}
            </h3>
            <div className="stat-icon-container">
              <stat.icon className="stat-icon" />
            </div>
          </div>

          <div className={`stat-value ${stat.large ? "big-text" : ""}`}>
            {stat.value}
          </div>

          {stat.large && (
            <p className="growth-text">0% from last month</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
