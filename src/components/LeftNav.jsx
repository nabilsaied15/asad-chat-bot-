import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Users, Activity, Shield, MessageSquare, Zap, Bot, Archive, Contact, Settings } from 'lucide-react';

const LeftNav = ({ activePage, bottomSection }) => {
    const navigate = useNavigate();

    const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;

    const navItems = [
        { id: '/dashboard', icon: Monitor, title: 'Dashboard', adminOnly: true },
        { id: '/inbox', icon: MessageSquare, title: 'Inbox (Messages)' },
        { id: '/monitoring', icon: Users, title: 'Monitoring Visiteurs', adminOnly: true },
        { id: '/contacts', icon: Contact, title: 'Contacts & CRM' },
        { id: '/archives', icon: Archive, title: 'Archives Chats' },
        { id: '/quick-replies', icon: Zap, title: 'Réponses Rapides' },
        { id: '/chatbot', icon: Bot, title: 'Chatbot & Auto', adminOnly: true },
        { id: '/reports', icon: Activity, title: 'Rapports & Stats', adminOnly: true },
        { id: '/personnel', icon: Shield, title: 'Équipe', adminOnly: true },
        { id: '/settings', icon: Settings, title: 'Paramètres' },
    ];

    return (
        <nav style={{ width: '64px', backgroundColor: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '20px', zIndex: 10, overflowY: 'auto' }}>
            {navItems.map(item => {
                if (item.adminOnly && userRole !== 'admin') return null;
                const isActive = activePage === item.id;
                return (
                    <div
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        style={{
                            color: 'white',
                            opacity: isActive ? 1 : 0.6,
                            cursor: 'pointer',
                            borderLeft: isActive ? '3px solid #00b06b' : '3px solid transparent',
                            paddingLeft: isActive ? '11px' : '14px',
                            marginLeft: isActive ? '-11px' : '-14px',
                            transition: 'all 0.2s',
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                        title={item.title}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.opacity = 0.6 }}
                    >
                        <item.icon size={24} />
                    </div>
                );
            })}

            {bottomSection && (
                <div style={{ marginTop: 'auto', marginBottom: '10px' }}>
                    {bottomSection}
                </div>
            )}
        </nav>
    );

};

export default LeftNav;
