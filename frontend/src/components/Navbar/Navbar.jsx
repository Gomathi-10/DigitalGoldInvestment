import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {

  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <div
            className="logo"
            onClick={() => {
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{ cursor: "pointer" }}
          >
            <span className="logo-icon">💎</span>
            <span className="logo-text">Digital Gold</span>
          </div>

          <ul className="nav-menu">
            <li>
              <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                Home
              </Link>
            </li>
            <li><a href="#about">About</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#why-us">Why Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>

          <div className="nav-buttons">
            <button className="btn-secondary" onClick={() => navigate("/login")}>Login</button>
            <button className="btn-primary">Use App</button>
          </div>

          <div className="mobile-menu-toggle">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </nav>
  );
};
