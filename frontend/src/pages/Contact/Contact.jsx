import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import Sidebar from '../Dashboard/Sidebar';
import Header from '../Dashboard/Header';
import { toast } from 'sonner';
import './Contact.css';

import AxiosInstance from '../../AxiosInstance';

const Contact = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const user = {
        firstname: localStorage.getItem('username') || 'User',
        email: localStorage.getItem('email') || ''
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await AxiosInstance.post('contact/submit/', formData);
            toast.success("Message sent successfully! We'll get back to you shortly.");
            setFormData({ name: '', email: '', message: '' });
            e.target.reset();
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="dashboard-main">
                <Header user={user} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="dashboard-content">
                    <div className="contact-container">
                        <div className="contact-header">
                            <h1>Get in Touch</h1>
                            <p>Our experts are here to help you with your gold investment journey</p>
                        </div>

                        <div className="contact-grid">
                            <div className="contact-info-panel">
                                <h2>Contact Information</h2>
                                <div className="info-list">
                                    <div className="info-item">
                                        <div className="info-icon"><Mail size={20} /></div>
                                        <div>
                                            <h3>Email Us</h3>
                                            <p>support@digigold.com</p>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon"><Phone size={20} /></div>
                                        <div>
                                            <h3>Call Us</h3>
                                            <p>+91 1800-GOLD-123</p>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon"><Clock size={20} /></div>
                                        <div>
                                            <h3>Support Hours</h3>
                                            <p>Mon - Sat: 9:00 AM - 6:00 PM</p>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon"><MapPin size={20} /></div>
                                        <div>
                                            <h3>Headquarters</h3>
                                            <p>Prestige Trade Towers, Bangalore, KA 560001</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form className="contact-form" onSubmit={handleSubmit}>
                                <h2>Send a Message</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Your Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Write your message here..."
                                            rows="6"
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="submit-btn" disabled={loading}>
                                        {loading ? "Sending..." : (
                                            <>
                                                <span>Send Message</span>
                                                <Send size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Contact;
