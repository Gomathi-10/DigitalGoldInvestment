import { useState } from "react";
import { InfoIcon } from "lucide-react";
import { toast } from "sonner";
import "./GoldPriceCard.css";

const GoldPriceCard = () => {
  const [buyPrice] = useState(9236.0);
  const [sellPrice] = useState(9136.0);

  const handleTrade = (type) => {
    toast.success(`${type} order initiated`, {
      description: `Processing your ${type.toLowerCase()} request for gold.`,
    });
  };

  return (
    <div className="gold-card">
      <div className="gold-card-header">
        <h3 className="gold-card-title">
          Current Gold Price <InfoIcon className="info-icon" />
        </h3>
      </div>

      <div className="gold-card-content">
        <div className="price-grid">

          <div className="price-box">
            <p className="price-label">Buy (INR/oz)</p>
            <p className="price-value primary">₹{buyPrice.toFixed(2)}</p>
          </div>

          <div className="price-box">
            <p className="price-label">Sell (INR/oz)</p>
            <p className="price-value destructive">₹{sellPrice.toFixed(2)}</p>
          </div>

        </div>

        <button className="trade-button" onClick={() => handleTrade("Trade")}>
          Trade
        </button>
      </div>
    </div>
  );
};

export default GoldPriceCard;
