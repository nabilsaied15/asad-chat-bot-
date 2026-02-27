import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { Plus, Trash2, Edit2, Search, Zap } from 'lucide-react';
import LeftNav from '../components/LeftNav';

const QuickReplies = () => {
    const [replies, setReplies] = useState([
        { id: 1, shortcut: '/bonjour', text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?' },
        { id: 2, shortcut: '/au_revoir', text: 'Merci de nous avoir contactés. Bonne journée !' },
        { id: 3, shortcut: '/attente', text: 'Je vérifie cela pour vous, un instant s\'il vous plaît.' }
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentReply, setCurrentReply] = useState({ shortcut: '', text: '' });

    const handleSave = (e) => {
        e.preventDefault();
        if (currentReply.id) {
            setReplies(replies.map(r => r.id === currentReply.id ? currentReply : r));
        } else {
            setReplies([...replies, { ...currentReply, id: Date.now() }]);
        }
        setIsEditing(false);
        setCurrentReply({ shortcut: '', text: '' });
    };

    const deleteReply = (id) => {
        setReplies(replies.filter(r => r.id !== id));
    };

    const filtered = replies.filter(r => r.shortcut.includes(searchTerm) || r.text.includes(searchTerm));

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardNavbar />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                <LeftNav activePage="/quick-replies" />

                <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Zap size={24} color="#00b06b" /> Réponses Rapides
                                </h1>
                                <p style={{ color: '#6b7280', marginTop: '4px' }}>Gérez vos messages pré-enregistrés (macros) pour répondre plus vite.</p>
                            </div>
                            <button
                                onClick={() => { setCurrentReply({ shortcut: '/', text: '' }); setIsEditing(true); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#00b06b', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                            >
                                <Plus size={18} /> Nouvelle Réponse
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un raccourci ou un texte..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <tr>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Raccourci</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Message complet</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(r => (
                                        <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>
                                                <span style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>{r.shortcut}</span>
                                            </td>
                                            <td style={{ padding: '16px', color: '#4b5563' }}>{r.text}</td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <button onClick={() => { setCurrentReply(r); setIsEditing(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '16px' }}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => deleteReply(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Aucune réponse trouvée.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                {/* Edit Modal */}
                {isEditing && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>{currentReply.id ? 'Modifier la réponse' : 'Nouvelle réponse'}</h2>
                            <form onSubmit={handleSave}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>Raccourci (commençant par /)</label>
                                    <input
                                        type="text"
                                        value={currentReply.shortcut}
                                        onChange={(e) => setCurrentReply({ ...currentReply, shortcut: e.target.value })}
                                        placeholder="/merci"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>Message complet</label>
                                    <textarea
                                        value={currentReply.text}
                                        onChange={(e) => setCurrentReply({ ...currentReply, text: e.target.value })}
                                        rows="4"
                                        placeholder="Merci beaucoup d'avoir fait appel à nous !..."
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', resize: 'vertical' }}
                                        required
                                    ></textarea>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        style={{ padding: '10px 16px', border: '1px solid #e5e7eb', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ padding: '10px 16px', border: 'none', backgroundColor: '#00b06b', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickReplies;
