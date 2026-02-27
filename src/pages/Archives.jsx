import React, { useState, useEffect } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import LeftNav from '../components/LeftNav';
import { Archive, Search, Download, Trash2, ExternalLink, RefreshCcw } from 'lucide-react';
import config from '../config';
import { useNavigate } from 'react-router-dom';

const Archives = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [archives, setArchives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchArchives();
    }, []);

    const fetchArchives = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${config.API_URL}/api/conversations?status=all`);
            if (res.ok) {
                const data = await res.json();
                console.log("Archives data received:", data);
                setArchives(data);
            }
        } catch (err) {
            console.error("Erreur chargement archives:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await fetch(`${config.API_URL}/api/conversations/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setArchives(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            }
        } catch (err) {
            console.error("Erreur mise à jour statut:", err);
        }
    };

    const deleteConversation = async (id) => {
        if (!window.confirm("Supprimer définitivement cette conversation et son historique ?")) return;
        try {
            const res = await fetch(`${config.API_URL}/api/conversations/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setArchives(prev => prev.filter(a => a.id !== id));
            }
        } catch (err) {
            console.error("Erreur suppression:", err);
        }
    };

    const handleExportCSV = () => {
        window.open(`${config.API_URL}/api/conversations/export/csv`, '_blank');
    };

    const filtered = (archives || []).filter(arch => {
        const matchesSearch =
            (arch.visitor_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (arch.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (arch.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (arch.problem || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (dateFilter === 'all') return matchesSearch;

        const date = new Date(arch.created_at);
        const now = new Date();
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);

        if (dateFilter === '7d') return matchesSearch && diffDays <= 7;
        if (dateFilter === '30d') return matchesSearch && diffDays <= 30;

        return matchesSearch;
    });

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
            case 'résolu':
                return { bg: '#dcfce7', text: '#166534' };
            case 'open':
            case 'ouvert':
                return { bg: '#dbeafe', text: '#1e40af' };
            case 'abandoned':
            case 'abandon':
            case 'closed':
                return { bg: '#fee2e2', text: '#991b1b' };
            case 'pending':
            case 'attente':
                return { bg: '#fef3c7', text: '#92400e' };
            default:
                return { bg: '#f3f4f6', text: '#374151' };
        }
    };

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
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={fetchArchives}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: '#374151', border: '1px solid #e5e7eb', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> Actualiser
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#00b06b', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    <Download size={18} /> Exporter en CSV
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '16px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    placeholder="Rechercher par ID Visiteur, nom, problème..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                            </div>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', backgroundColor: 'white', color: '#374151', fontWeight: '500' }}
                            >
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
                                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Visiteur / Nom</th>
                                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Messages</th>
                                        <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Statut</th>
                                        <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center' }}>Chargement...</td></tr>
                                    ) : filtered.length > 0 ? filtered.map(arch => {
                                        const statusStyle = getStatusStyle(arch.status);
                                        return (
                                            <tr key={arch.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>
                                                    {new Date(arch.created_at).toLocaleDateString()} {new Date(arch.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '14px' }}>
                                                    <div style={{ fontWeight: '600', color: '#111827' }}>{arch.visitor_id}</div>
                                                    <div style={{ color: '#6b7280', fontSize: '12px' }}>{arch.first_name} {arch.last_name}</div>
                                                </td>
                                                <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>{arch.message_count || 0} msg</td>
                                                <td style={{ padding: '16px' }}>
                                                    <select
                                                        value={arch.status?.toLowerCase()}
                                                        onChange={(e) => handleStatusChange(arch.id, e.target.value)}
                                                        style={{
                                                            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                                                            backgroundColor: statusStyle.bg,
                                                            color: statusStyle.text,
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            outline: 'none'
                                                        }}
                                                    >
                                                        <option value="open">Ouvert</option>
                                                        <option value="resolved">Résolu</option>
                                                        <option value="pending">En attente</option>
                                                        <option value="abandoned">Abandonné</option>
                                                        <option value="transferred">Transféré</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => navigate(`/inbox?visitorId=${arch.visitor_id}`)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00b06b', marginRight: '16px' }}
                                                        title="Lire la transcription"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteConversation(arch.id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                        title="Supprimer définitivement"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Aucune conversation archivée.</td></tr>
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

export default Archives;
