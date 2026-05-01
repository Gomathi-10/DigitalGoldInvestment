import { useState, useEffect } from "react";
import { InfoIcon } from "lucide-react";
import { toast } from "sonner";
import AxiosInstance from "../../AxiosInstance"; // Import Axios
import "./GoldAsset.css";

const GoldAssetsCard = () => {
  const [goldBalance, setGoldBalance] = useState(0);
  const [goldAvailable, setGoldAvailable] = useState(0);
  const [purchasedCoins, setPurchasedCoins] = useState(0);
  const [collectAmount, setCollectAmount] = useState("");

  useEffect(() => {
    fetchGoldBalance();
  }, []);

  const fetchGoldBalance = async () => {
    try {
      const res = await AxiosInstance.get("gold-vault/");
      setGoldBalance(res.data.total_gold_grams || 0);
      setGoldAvailable(res.data.total_gold_grams || 0);
      setPurchasedCoins(res.data.purchased_coins_grams || 0);
    } catch (error) {
      console.error("Error fetching gold balance", error);
    }
  };

  const handleCollect = () => {
    if (!collectAmount || parseFloat(collectAmount) <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid amount to collect.",
      });
      return;
    }


    if (parseFloat(collectAmount) > goldAvailable) {
      toast.error("Insufficient balance", {
        description: "You don't have enough gold available for collection.",
      });
      return;
    }

    toast.success("Collection request submitted", {
      description: `Collecting ${collectAmount}g of gold.`,
    });

    setCollectAmount("");
  };

  return (
    <div className="gold-assets-card">
      <div className="gold-assets-header">
        <h3 className="gold-assets-title">
          Gold Assets <InfoIcon className="info-icon" />
        </h3>
      </div>

      <div className="gold-assets-content">
        <div className="assets-grid">
          <div className="asset-box">
            <p className="asset-label">Gold Balance</p>
            <p className="asset-value">{goldBalance}g</p>
          </div>

          <div className="asset-box">
            <p className="asset-label">Available</p>
            <p className="asset-value primary">{goldAvailable}g</p>
          </div>

          <div className="asset-box">
            <p className="asset-label">Gold Coins</p>
            <p className="asset-value" style={{ color: '#f59e0b' }}>{purchasedCoins}g</p>
          </div>
        </div>

        <div className="collect-section">
          <input
            type="number"
            placeholder="Enter amount (g)"
            value={collectAmount}
            onChange={(e) => setCollectAmount(e.target.value)}
            className="collect-input"
          />

          <button className="collect-button" onClick={handleCollect}>
            Collect Gold
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoldAssetsCard;
