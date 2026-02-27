import React, { useState, useEffect, useRef } from 'react';
import { Users, Globe, Clock, Monitor, MessageCircle, ExternalLink, Shield, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import DashboardNavbar from '../components/DashboardNavbar';
import LeftNav from '../components/LeftNav';
import config from '../config';

const MonitoringPage = () => {
    const navigate = useNavigate();
    const [visitors, setVisitors] = useState([]);
    const socketRef = useRef();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(user);
        if (userData.role && userData.role !== 'admin') {
            navigate('/inbox');
            return;
        }

        // Connect to socket as agent to get the visitor list
        socketRef.current = io(`${config.API_URL}`);
        socketRef.current.emit('register_agent', { agentId: userData.id });

        socketRef.current.on('visitor_list', (list) => {
            setVisitors(list);
        });

        return () => socketRef.current.disconnect();
    }, [navigate]);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
            <DashboardNavbar />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <LeftNav activePage="/monitoring" />

                {/* Main Content */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <header style={{ padding: '24px 32px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>Tableau de bord de surveillance</h1>
                        <p style={{ color: '#6b7280', marginTop: '4px' }}>Surveillez et interagissez avec les visiteurs en temps réel.</p>
                    </header>

                    <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <tr>
                                        <th style={{ padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Visiteur</th>
                                        <th style={{ padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Localisation</th>
                                        <th style={{ padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Page Active</th>
                                        <th style={{ padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Dernière Activité</th>
                                        <th style={{ padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Durée</th>
                                        <th style={{ padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visitors.map(v => (
                                        <tr key={v.socketId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Monitor size={16} color="#6b7280" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            Visitor {v.visitorId.substring(0, 6)}
                                                            {v.isBotActive && (
                                                                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                                    Chatbot
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{v.socketId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563' }}>
                                                    <Globe size={16} />
                                                    <span>France (Simulation)</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                                                    {v.title || 'Sans titre'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <ExternalLink size={12} />
                                                    {v.url ? new URL(v.url).pathname : '/'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                {v.lastMessage && v.lastMessage.text ? (
                                                    <div style={{ fontSize: '13px', color: '#4b5563', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{
                                                            fontSize: '10px',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: v.lastMessage.sender === 'bot' ? '#f0f9f4' : '#f3f4f6',
                                                            color: v.lastMessage.sender === 'bot' ? '#00b06b' : '#6b7280',
                                                            fontWeight: 'bold',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {v.lastMessage.sender === 'bot' ? 'Bot' : 'Visiteur'}
                                                        </span>
                                                        {v.lastMessage.text}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic' }}>Aucune activité</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563' }}>
                                                    <Clock size={16} />
                                                    <span>
                                                        {v.joinedAt ?
                                                            `${Math.floor((Date.now() - v.joinedAt) / 60000)}m ${Math.floor(((Date.now() - v.joinedAt) % 60000) / 1000)}s`
                                                            : '0s'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <button
                                                    onClick={() => navigate(`/inbox?visitorId=${v.visitorId}`)}
                                                    style={{ backgroundColor: '#00b06b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                                                >
                                                    Ouvrir Chat
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {visitors.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                                                Aucun visiteur connecté pour le moment.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MonitoringPage;
