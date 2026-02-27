import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import LeftNav from '../components/LeftNav';
import { Bot, Save, MessageSquare, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

const ChatbotConfig = () => {
    const [config, setConfig] = useState({
        enabled: true,
        welcomeMessage: 'Bonjour ! Bienvenue sur notre site. Comment pouvons-nous vous aider aujourd\'hui ?',
        offlineMessage: 'Nous sommes actuellement absents. Laissez votre message et nous vous répondrons dès que possible.',
        autoReplyDelay: 5,
        collectEmail: true
    });

    const handleSave = (e) => {
        e.preventDefault();
        // TODO: Save to backend
        alert('Configuration du Chatbot enregistrée (Simulation)');
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardNavbar />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                <LeftNav activePage="/chatbot" />

                <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Bot size={24} color="#00b06b" /> Configuration du Chatbot
                                </h1>
                                <p style={{ color: '#6b7280', marginTop: '4px' }}>Automatisez l'accueil et la récolte d'informations pendant votre absence.</p>
                            </div>
                            <button
                                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: config.enabled ? '#ecfdf5' : '#fef2f2', color: config.enabled ? '#059669' : '#dc2626', border: '1px solid ' + (config.enabled ? '#a7f3d0' : '#fecaca'), padding: '8px 16px', borderRadius: '30px', cursor: 'pointer', fontWeight: '700' }}
                            >
                                {config.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                {config.enabled ? 'Chatbot Activé' : 'Chatbot Désactivé'}
                            </button>
                        </div>

                        <form onSubmit={handleSave} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                                    <MessageSquare size={18} color="#6b7280" /> Message de bienvenue automatique
                                </label>
                                <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>Envoyé immédiatement lorsqu'un visiteur ouvre la bulle de chat.</p>
                                <textarea
                                    value={config.welcomeMessage}
                                    onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                                    rows="3"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                                    <Clock size={18} color="#6b7280" /> Message d'absence (hors ligne)
                                </label>
                                <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>Envoyé si aucun agent n'est connecté sur ce Dashboard.</p>
                                <textarea
                                    value={config.offlineMessage}
                                    onChange={(e) => setConfig({ ...config, offlineMessage: e.target.value })}
                                    rows="3"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#374151' }}>Demander l'email du visiteur</h3>
                                    <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>Le bot demandera une adresse email avant l'envoi du premier message.</p>
                                </div>
                                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.collectEmail}
                                        onChange={(e) => setConfig({ ...config, collectEmail: e.target.checked })}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: config.collectEmail ? '#00b06b' : '#ccc', transition: '.4s', borderRadius: '24px' }}>
                                        <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: config.collectEmail ? '26px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                                    </span>
                                </label>
                            </div>

                            <button type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#00b06b', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 176, 107, 0.2)' }}>
                                <Save size={20} /> Enregistrer la configuration
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ChatbotConfig;
