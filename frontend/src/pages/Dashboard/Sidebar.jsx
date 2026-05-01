import {
  Home,
  History,
  Briefcase,
  TrendingUp,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  User,
  HelpCircle,
  Mail,
  LogOut,
  X,
  Coins,
  ShieldCheck
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import "./Sidebar.css";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Briefcase, label: "Invest", path: "/invest" },
    { icon: Coins, label: "Buy Gold Coin", path: "/buy-coins" },
    { icon: ShieldCheck, label: "KYC", path: "/kyc" },
    { icon: ArrowUpCircle, label: "Withdraw", path: "/withdraw" },
    { icon: History, label: "Transaction History", path: "/transaction-history" }
  ];

  const bottomMenuItems = [
    { icon: User, label: "Profile", path: "/profile" },
    { icon: HelpCircle, label: "Resources", path: "/resources" },
    { icon: Mail, label: "Contact Us", path: "/contact" },
    { icon: LogOut, label: "Log Out" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const handleBottomMenuClick = (label, path) => {
    if (label === "Log Out") {
      handleLogout();
    } else if (path) {
      navigate(path);
    } else {
      console.log(`Clicked ${label}`);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar-container ${isOpen ? "open" : ""}`}>

        {/* Logo */}
        <div className="sidebar-header">
          <div
            className="sidebar-logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <span className="logo-icon">💎</span>
            <span className="logo-text">Digital Gold</span>

          </div>

          {/* Close button (mobile only) */}
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Main menu */}
        <nav className="sidebar-menu">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  className={`sidebar-btn ${location.pathname === item.path ? "active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom menu */}
        <div className="sidebar-bottom">
          <ul>
            {bottomMenuItems.map((item, index) => (
              <li key={index}>
                <button
                  className="sidebar-btn"
                  onClick={() => handleBottomMenuClick(item.label, item.path)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
