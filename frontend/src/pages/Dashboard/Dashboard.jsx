import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatsCards from "./StatsCards";
import GoldPriceCard from "./GoldPriceCard";
import GoldAssetsCard from "./GoldAsset";
import "./dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState({ firstname: "User" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUser({ firstname: storedUsername || "User" });

    // Check for Stripe success redirect
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get("session_id");

    if (sessionId) {
      verifyStripePayment(sessionId);
    }
  }, [location]);

  const verifyStripePayment = async (sessionId) => {
    try {
      const queryParams = new URLSearchParams(location.search);
      const isCoinPurchase = queryParams.get("purchase_type") === "coin";
      const coinWeight = queryParams.get("weight");

      const res = await AxiosInstance.post("invest/verify/", {
        session_id: sessionId
      });

      if (res.data.status === "success") {
        if (isCoinPurchase) {
          toast.success(`Purchase Successful! ${coinWeight}g Gold Coin has been ordered.`);
        } else {
          toast.success("Investment Successful! Gold added to your vault.");
        }
        // Remove the query params from URL
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Payment verification failed.");
    }
  };




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
            <div className="dashboard-top-row">
              <div className="stats-section">
                <StatsCards />
              </div>

              <div className="gold-section">
                <GoldPriceCard />
                <GoldAssetsCard />
              </div>
            </div>


          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
