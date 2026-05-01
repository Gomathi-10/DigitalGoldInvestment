import React from 'react';
import { BookOpen, FileText, Video, ExternalLink, Download } from 'lucide-react';
import Sidebar from '../Dashboard/Sidebar';
import Header from '../Dashboard/Header';
import './Resources.css';

const Resources = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const user = { firstname: localStorage.getItem('username') || 'User' };

    const sections = [
        {
            title: "Educational Guides",
            icon: <BookOpen className="section-icon" />,
            items: [
                { name: "Digital Gold Investing 101", type: "PDF", size: "2.4 MB" },
                { name: "Market Volatility Management", type: "PDF", size: "1.8 MB" },
                { name: "Understanding 24K Purity", type: "Guide", size: "15 min read" }
            ]
        },
        {
            title: "Market Reports",
            icon: <FileText className="section-icon" />,
            items: [
                { name: "Annual Gold Performance 2025", type: "Report", size: "5.2 MB" },
                { name: "Quarterly Investment Outlook", type: "Report", size: "3.1 MB" },
                { name: "Global Economic Impact on Gold", type: "PDF", size: "2.7 MB" }
            ]
        },
        {
            title: "Tutorial Videos",
            icon: <Video className="section-icon" />,
            items: [
                { name: "How to Withdraw Physical Gold", type: "Video", size: "8:45" },
                { name: "Setting up Recurring Investments", type: "Video", size: "5:20" },
                { name: "KYC Verification Walkthrough", type: "Video", size: "4:15" }
            ]
        }
    ];

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="dashboard-main">
                <Header user={user} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="dashboard-content">
                    <div className="resources-container">
                        <div className="resources-header">
                            <h1>Investor Resources</h1>
                            <p>Everything you need to master your digital gold portfolio</p>
                        </div>

                        <div className="resources-grid">
                            {sections.map((section, idx) => (
                                <div key={idx} className="resource-card">
                                    <div className="resource-card-header">
                                        {section.icon}
                                        <h2>{section.title}</h2>
                                    </div>
                                    <div className="resource-list">
                                        {section.items.map((item, i) => (
                                            <div key={i} className="resource-item">
                                                <div className="item-info">
                                                    <span className="item-name">{item.name}</span>
                                                    <span className="item-meta">{item.type} • {item.size}</span>
                                                </div>
                                                <button className="download-btn">
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Resources;
