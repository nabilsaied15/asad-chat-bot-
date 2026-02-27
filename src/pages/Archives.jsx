import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import LeftNav from '../components/LeftNav';
import { Archive, Search, Download, Trash2, ExternalLink } from 'lucide-react';

const Archives = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [archives] = useState([
        { id: 101, visitorId: 'vis_a1b2c3', date: '2026-02-25T14:30:00Z', messages: 14, resolution: 'Résolu', agent: 'Nabil' },
        { id: 102, visitorId: 'vis_x9y8z7', date: '2026-02-24T09:15:00Z', messages: 6, resolution: 'Abandon', agent: 'Agent1' },
        { id: 103, visitorId: 'vis_p4q5r6', date: '2026-02-20T16:45:00Z', messages: 2, resolution: 'Transféré', agent: 'Bot' },
    ]);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardNavbar />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                <LeftNav activePage="/archives" />

                <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Archive size={24} color="#6b7280" /> Téléchargements & Archives
                                </h1>
                                <p style={{ color: '#6b7280', marginTop: '4px' }}>Consultez et exportez l'historique complet de vos anciennes conversations.</p>
                            </div>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: '#374151', border: '1px solid #e5e7eb', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                <Download size={18} /> Exporter en CSV
                            </button>
                        </div>

                        {/* Filters */}
                        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '16px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    placeholder="Rechercher par ID Visiteur, mot clé..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                            </div>
                            <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', backgroundColor: 'white', color: '#374151', fontWeight: '500' }}>
                                <option value="all">Toutes les dates</option>
                                <option value="7d">7 derniers jours</option>
                                <option value="30d">30 derniers jours</option>
                            </select>
                        </div>

                        {/* List */}
                        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <tr>
                                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Visiteur ID</th>
                                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Agent</th>
                                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Messages</th>
                                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Statut</th>
                                        <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {archives.map(arch => (
                                        <tr key={arch.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>
                                                {new Date(arch.date).toLocaleDateString()} {new Date(arch.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: '600', color: '#111827', fontSize: '14px' }}>{arch.visitorId}</td>
                                            <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>{arch.agent}</td>
                                            <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>{arch.messages} msg</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                                                    backgroundColor: arch.resolution === 'Résolu' ? '#dcfce7' : arch.resolution === 'Abandon' ? '#fee2e2' : '#f3f4f6',
                                                    color: arch.resolution === 'Résolu' ? '#166534' : arch.resolution === 'Abandon' ? '#991b1b' : '#374151'
                                                }}>
                                                    {arch.resolution}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00b06b', marginRight: '16px' }} title="Lire la transcription">
                                                    <ExternalLink size={18} />
                                                </button>
                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Supprimer">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Archives;
