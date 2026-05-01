import { Menu, Bell, Search } from "lucide-react";
import "./Header.css";

const Header = ({ user, toggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-inner">

        {/* LEFT SECTION */}
        <div className="header-left">
          {/* Mobile Menu Button */}
          <button className="header-menu-btn" onClick={toggleSidebar}>
            <Menu size={22} />
          </button>

          {/* Greeting */}
          <div>
            <h1 className="header-title">Hello, {user?.firstname}</h1>
            <p className="header-subtitle">Welcome back to your dashboard</p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="header-right">

          {/* Search (hidden on mobile) */}
          <div className="header-search">
            <Search className="header-search-icon" size={16} />
            <input
              type="search"
              placeholder="Search..."
              className="header-search-input"
            />
          </div>

          {/* Notifications */}
          <div className="header-notification">
            <button className="header-icon-btn">
              <Bell size={20} />
              <span className="header-badge">3</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
