import React from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { MessageSquare, Layout, Activity, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const cards = [
        { title: 'Inbox', desc: 'Manage your chats', icon: MessageSquare, link: '/inbox', color: '#00b06b' },
        { title: 'Visitors', desc: 'Real-time monitoring', icon: Users, link: '/dashboard', color: '#10b981' },
        { title: 'Reports', desc: 'View performance', icon: Activity, link: '/dashboard', color: '#3b82f6' },
        { title: 'Settings', desc: 'Configure asad.to', icon: Layout, link: '/dashboard', color: '#6366f1' }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <DashboardNavbar />

            <main style={{ padding: '60px 0' }}>
                <div className="container">
                    <header style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Welcome back, {user.name}!</h1>
                        <p style={{ color: '#6b7280', fontSize: '16px' }}>Here's what's happening with asad.to today.</p>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        {cards.map((card, i) => (
                            <Link to={card.link} key={i} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '32px',
                                    borderRadius: '24px',
                                    border: '1px solid #e5e7eb',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    cursor: 'pointer'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        backgroundColor: `${card.color}15`,
                                        color: card.color,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <card.icon size={24} />
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{card.title}</h3>
                                    <p style={{ color: '#6b7280', fontSize: '14px' }}>{card.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
