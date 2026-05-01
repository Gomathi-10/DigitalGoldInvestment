import React from "react";
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="footer-container">
                <div className="logo" style={{ marginBottom: "1.5rem" }}>
                    <span className="logo-icon">💎</span>
                    <span className="logo-text">Digital Gold</span>
                </div>
                <p className="footer-text">Your trusted partner in digital gold investment</p>
                <ul className="footer-links">
                    <li><a href="#">Terms of Service</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">FAQ</a></li>
                </ul>
                <div className="contact-info">
                    <p>Email: support@digitalgold.com</p>
                    <p>Phone: +91 98765 43210</p>
                    <p>Address: 123 Gold Street, Mumbai, India</p>
                </div>
                <p className="footer-text">© 2025 Digital Gold. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
