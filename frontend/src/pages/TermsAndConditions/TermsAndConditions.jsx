import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../../AxiosInstance';
import './TermsAndConditions.css';

const TermsAndConditions = () => {
    const [accepted, setAccepted] = useState(false);
    const navigate = useNavigate();

    const handleAccept = async () => {
        try {
            await AxiosInstance.post('accept-tc/');
            localStorage.setItem('has_accepted_tc', 'true');
            navigate('/dashboard');
        } catch (error) {
            console.error("Error accepting T&C", error);
            alert("Failed to accept Terms and Conditions. Please try again.");
        }
    };

    const handleDecline = () => {
        // Clear everything and go home
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="tc-overlay">
            <div className="tc-container">
                <div className="tc-header">
                    <h2>Terms and Conditions</h2>
                    <p>Please read and accept our Terms and Conditions to continue.</p>
                </div>

                <div className="tc-content">
                    <h3>1. Introduction</h3>
                    <p>Welcome to DigiGold. By accessing or using our platform, you agree to be bound by these Terms and Conditions. These terms govern your purchase, storage, and redemption of 24K Digital Gold through our platform.</p>

                    <h3>2. Investment Risks & Market Volatility</h3>
                    <p>Digital gold investments are subject to market risks. The price of gold fluctuates based on global market conditions, currency exchange rates, and economic factors. DigiGold does not guarantee any specific returns, and users acknowledge that the value of their holdings may increase or decrease.</p>

                    <h3>3. KYC and Regulatory Compliance</h3>
                    <p>In accordance with the Prevention of Money Laundering Act (PMLA) and other applicable Indian regulations, users must complete the mandatory Know Your Customer (KYC) process before making any significant investments. You agree to provide accurate and updated documentation, including Aadhar and PAN details, for verification.</p>

                    <h3>4. Storage and Custody</h3>
                    <p>All digital gold purchased through DigiGold is backed by physical gold of the specified purity (99.9% / 24K). This gold is stored in secure, insured vaults managed by professional third-party custodians. DigiGold maintains a 1:1 ratio between the digital gold owned by users and the physical gold held in custody.</p>

                    <h3>5. Buyback and Redemption</h3>
                    <p>Users have the option to sell back their digital gold at the prevailing live market rates displayed on the platform. Alternatively, users may request physical delivery of their gold in the form of certified coins or bars, subject to applicable making charges, delivery fees, and minimum weight requirements.</p>

                    <h3>6. Governing Law & Jurisdiction</h3>
                    <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or in connection with the use of the DigiGold platform shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.</p>

                    <h3>7. Limitation of Liability</h3>
                    <p>DigiGold shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service, including but not limited to loss of profits or data. We reserve the right to modify or terminate services in the event of technical failures or regulatory changes.</p>
                </div>

                <div className="tc-footer">
                    <div className="checkbox-container">
                        <input
                            type="checkbox"
                            id="accept-checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                        />
                        <label htmlFor="accept-checkbox">I have read and agree to the Terms and Conditions</label>
                    </div>
                    <div className="btn-group">
                        <button className="btn-decline" onClick={handleDecline}>Decline</button>
                        <button
                            className={`btn-accept ${!accepted ? 'disabled' : ''}`}
                            onClick={handleAccept}
                            disabled={!accepted}
                        >
                            Accept & Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
