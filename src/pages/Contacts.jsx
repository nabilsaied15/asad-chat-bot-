import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import LeftNav from '../components/LeftNav';
import { Contact, Search, MapPin, Mail, Clock, Shield } from 'lucide-react';

const Contacts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [contacts] = useState([
        { id: 1, visitorId: 'vis_a1b2c3', email: 'jean.dupont@email.com', name: 'Jean Dupont', location: 'Paris, France', lastVisit: '2026-02-27T10:00:00Z', sessions: 3 },
        { id: 2, visitorId: 'vis_x9y8z7', email: 'marie.martin@email.com', name: 'Marie Martin', location: 'Lyon, France', lastVisit: '2026-02-25T14:30:00Z', sessions: 1 },
        { id: 3, visitorId: 'vis_p4q5r6', email: null, name: 'Visiteur Anonyme', location: 'Bruxelles, Belgique', lastVisit: '2026-02-26T09:15:00Z', sessions: 5 },
    ]);

    const filtered = contacts.filter(c =>
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.visitorId.includes(searchTerm)
    );

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardNavbar />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                <LeftNav activePage="/contacts" />

                <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Contact size={24} color="#3b82f6" /> Contacts & CRM
                                </h1>
                                <p style={{ color: '#6b7280', marginTop: '4px' }}>Répertoire de tous les visiteurs uniques ayant interagi avec le widget.</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom, email ou ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                            </div>
                        </div>

                        {/* Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {filtered.map(contact => (
                                <div key={contact.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: contact.email ? '#ebf8ff' : '#f3f4f6', color: contact.email ? '#3b82f6' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{contact.name}</h3>
                                            <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Shield size={12} /> {contact.visitorId}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#4b5563' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Mail size={14} color="#9ca3af" />
                                            {contact.email ? <a href={`mailto:${contact.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{contact.email}</a> : <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>Non renseigné</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <MapPin size={14} color="#9ca3af" />
                                            {contact.location}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Clock size={14} color="#9ca3af" />
                                            Dernière visite: {new Date(contact.lastVisit).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                                            {contact.sessions} session{contact.sessions > 1 ? 's' : ''}
                                        </span>
                                        <button style={{ background: 'none', border: 'none', color: '#00b06b', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                            Voir l'historique
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6b7280', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                                    Aucun contact ne correspond à votre recherche.
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Contacts;
