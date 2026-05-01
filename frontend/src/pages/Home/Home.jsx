import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { assets } from "../../assets/assets"
import Footer from "../footer/footer";

function Home() {
  const navigate = useNavigate();

  const [currentGoldRate, setCurrentGoldRate] = useState(7728.00); // Default fallback rate
  const investmentAmount = 2100;
  const goldGrams = investmentAmount / currentGoldRate;

  useEffect(() => {
    // Fetch current gold price from backend
    const fetchGoldPrice = async () => {
      try {
        const response = await fetch('http://localhost:8000/gold-price/');
        const data = await response.json();
        if (data.rate) {
          setCurrentGoldRate(data.rate);
        }
      } catch (error) {
        console.error('Error fetching gold price:', error);
        // Keep using the fallback rate
      }
    };

    fetchGoldPrice();
    // Optionally, refresh the price every hour
    const interval = setInterval(fetchGoldPrice, 3600000); // 1 hour
    return () => clearInterval(interval);
  }, []);

  return (
    <>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Invest in <span className="highlight">Gold</span>
                <br />
                Invest in Your <span className="highlight">Future</span>
              </h1>

              <p className="hero-description">
                Invest in the future that <strong>glitters</strong> over
                digital <strong>24K</strong> gold starting at just
                <strong>₹10</strong>. Fully insured, real-time pricing, and
                invest smartly in your golden future.
              </p>

              <div className="hero-badge">
                <span className="badge-icon">🛡️</span>
                <span>100% secure, and fully insured.</span>
              </div>

              <div className="hero-buttons">
                <button className="btn-primary btn-large">Buy Gold Now</button>
                <button className="btn-outline btn-large">Start Investing</button>
              </div>
            </div>

            {/* Gold Card */}
            <div className="hero-card">
              <div className="gold-live-card">
                <div className="card-header">
                  <span className="card-title">Digital Gold</span>
                  <span className="card-badge">24K • 99.99%</span>
                </div>

                <div className="card-price">
                  <span className="price-label">GOLD</span>
                  <span className="price-value">₹{currentGoldRate.toLocaleString()}/gm</span>
                </div>

                <div className="card-amount">
                  <span className="amount-value">₹ {investmentAmount}</span>
                  <span className="amount-label">~{goldGrams.toFixed(4)}gm</span>
                </div>

                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-val">24K</span>
                    <span className="stat-label">Purity</span>
                  </div>
                  <div className="stat">
                    <span className="stat-val">0.5%</span>
                    <span className="stat-label">Growth</span>
                  </div>
                </div>

                <div className="card-buttons">
                  <button className="card-btn card-btn-primary">
                    Buy/Invest
                  </button>
                  <button className="card-btn card-btn-secondary">
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>



        <div className="scroll-indicator">
          <span>Scroll Down</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">About Us</h2>
          </div>

          <div className="about-content">
            <div className="about-image">
              <img
                src={assets.aboutImg}
                alt="Gold Investment"
              />
              <div className="image-overlay"></div>
            </div>

            <div className="about-text">
              <p className="about-description">
                At <strong>DigitalGold</strong> we strive investing
                <strong>24K</strong> gold simple, transparent, and secure.
                Every investment is backed by real bullion stored in insured,
                high-security vaults across the globe.
              </p>

              <p className="about-description">
                We make gold accessible to everyone through
                <strong>24K 99.9%</strong> pure gold available at your
                fingertips via fractional gold from trusted suppliers.
              </p>

              <button className="btn-outline">Know more</button>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="quote-section">
        <div className="container">
          <div className="quote-content">
            <p className="quote-text">In uncertain times</p>
            <p className="quote-highlight">"Gold shines brightest"</p>
          </div>
        </div>
      </section>

      {/* Why Golden Asset Section */}
      <section id="why-us" className="why-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Digital Gold</h2>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src={assets.Feature_icon}
                  alt="Affordability"
                />
              </div>
              <h3 className="feature-title">Affordability</h3>
              <p className="feature-description">
                Digital Gold offers the best price for all products compared to
                the market.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src={assets.Feature_icon2}
                  alt="Purity"
                />
              </div>
              <h3 className="feature-title">Guaranteed Purity</h3>
              <p className="feature-description">
                We serve you the purest 24k gold products with 99.9% purity
                hallmarks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src={assets.Feature_icon3}
                  alt="Accessibility"
                />
              </div>
              <h3 className="feature-title">Accessibility</h3>
              <p className="feature-description">
                Golden Asset provides all services for customers 24/7 globally.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src={assets.Feature_icon4}
                  alt="Security"
                />
              </div>
              <h3 className="feature-title">Security</h3>
              <p className="feature-description">
                We ensure the best & trusted vault-backed storage with the
                highest security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section id="products" className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trending Products</h2>
          </div>

          <div className="products-grid">
            {/* Product 1 */}
            <div className="product-card">
              <div className="product-image">
                <img
                  src={assets.Product_img1}
                  alt="2 Gram Gold Coin"
                />
              </div>
              <h3 className="product-name">2 Gram Gold Coin</h3>
              <p className="product-price">24K(99.9%)</p>
              <button className="btn-primary btn-product" onClick={() => navigate("/login")}>View Details</button>
            </div>

            {/* Product 2 */}
            <div className="product-card">
              <div className="product-image">
                <img
                  src={assets.Product_img2}
                  alt="5 Gram Gold Coin"
                />
              </div>
              <h3 className="product-name">5 Gram Gold Coin</h3>
              <p className="product-price">24K(99.9%)</p>
              <button className="btn-primary btn-product" onClick={() => navigate("/login")}>View Details</button>
            </div>

            {/* Product 3 */}
            <div className="product-card">
              <div className="product-image">
                <img
                  src={assets.Product_img3}
                  alt="10 Gram Gold Bar"
                />
              </div>
              <h3 className="product-name">10 Gram Gold Bar</h3>
              <p className="product-price">24K(99.9%)</p>
              <button className="btn-primary btn-product" onClick={() => navigate("/login")}>View Details</button>
            </div>

            {/* Product 4 */}
            <div className="product-card">
              <div className="product-image">
                <img
                  src={assets.Product_img4}
                  alt="100 Gram Mint Bar"
                />
              </div>
              <h3 className="product-name">100 Gram 99.9% Mint Bar</h3>
              <p className="product-price">(99.9%)</p>
              <button className="btn-primary btn-product" onClick={() => navigate("/login")}>View Details</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
export default Home;