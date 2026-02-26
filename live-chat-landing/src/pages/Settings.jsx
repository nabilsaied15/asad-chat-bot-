import React, { useState, useEffect } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Settings as SettingsIcon,
    Palette,
    Bell,
    Link as LinkIcon,
    Save,
    CheckCircle,
    Monitor,
    Users,
    TrendingUp,
    Shield,
    MessageSquare,
    Globe,
    Zap,
    Mail,
    Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../config';

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [activeTab, setActiveTab] = useState('profile');
    const [status, setStatus] = useState({ type: '', msg: '' });

    // Profile State
    const [name, setName] = useState(user.name || '');
    const [email, setEmail] = useState(user.email || '');

    // Widget State (Mock)
    const [primaryColor, setPrimaryColor] = useState('#00b06b');
    const [welcomeMsg, setWelcomeMsg] = useState('Bonjour ! Comment pouvons-nous vous aider ?');

    // Notification State (Mock)
    const [emailNotif, setEmailNotif] = useState(true);
    const [whatsappNotif, setWhatsappNotif] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
    }, [navigate]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', msg: 'Enregistrement...' });

        try {
            const response = await fetch(`${config.API_URL}/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });

            if (response.ok) {
                const updatedUser = { ...user, name, email };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setStatus({ type: 'success', msg: 'Profil mis à jour avec succès !' });
            } else {
                setStatus({ type: 'error', msg: 'Erreur lors de la mise à jour.' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Erreur serveur.' });
        }

        setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    };

    const tabs = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'widget', label: 'Widget Chat', icon: Palette },
        { id: 'notifs', label: 'Notifications', icon: Bell },
        { id: 'integration', label: 'Intégration', icon: LinkIcon },
    ];

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
            <DashboardNavbar />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Rail */}
                <nav style={{ width: '64px', backgroundColor: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: '24px', zIndex: 10 }}>
                    <div onClick={() => navigate('/dashboard')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Dashboard"><Monitor size={20} /></div>
                    <div onClick={() => navigate('/monitoring')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Monitoring"><Users size={20} /></div>
                    <div onClick={() => navigate('/reports')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Reports"><TrendingUp size={20} /></div>
                    <div onClick={() => navigate('/personnel')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Personnel"><Shield size={20} /></div>
                    <div onClick={() => navigate('/inbox')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Inbox"><MessageSquare size={20} /></div>
                </nav>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    <header style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em' }}>Paramètres</h1>
                        <p style={{ color: '#6b7280', fontSize: '16px', marginTop: '4px' }}>Gérez votre compte et personnalisez votre expérience.</p>
                    </header>

                    <div style={{ display: 'flex', gap: '40px' }}>
                        {/* Settings Navigation */}
                        <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        backgroundColor: activeTab === tab.id ? '#00b06b10' : 'transparent',
                                        color: activeTab === tab.id ? '#00b06b' : '#6b7280',
                                        fontWeight: activeTab === tab.id ? '700' : '600',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <tab.icon size={20} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Settings Content */}
                        <div style={{ flex: 1, maxWidth: '800px', backgroundColor: 'white', borderRadius: '24px', padding: '40px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <AnimatePresence mode="wait">
                                {activeTab === 'profile' && (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Informations du Profil</h2>
                                        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#374151' }}>Nom Complet</label>
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#374151' }}>Adresse Email</label>
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px' }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                                <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#111827', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                                                    <Save size={18} /> Enregistrer les modifications
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {activeTab === 'widget' && (
                                    <motion.div
                                        key="widget"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Personnalisation du Widget</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#374151' }}>Couleur de marque</label>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    {['#00b06b', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#111827'].map(color => (
                                                        <div
                                                            key={color}
                                                            onClick={() => setPrimaryColor(color)}
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                backgroundColor: color,
                                                                borderRadius: '10px',
                                                                cursor: 'pointer',
                                                                border: primaryColor === color ? '3px solid white' : 'none',
                                                                boxShadow: primaryColor === color ? `0 0 0 2px ${color}` : 'none',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#374151' }}>Message de bienvenue</label>
                                                <textarea
                                                    value={welcomeMsg}
                                                    onChange={(e) => setWelcomeMsg(e.target.value)}
                                                    rows={3}
                                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px', resize: 'none' }}
                                                />
                                            </div>

                                            <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '16px', border: '1px dashed #e5e7eb' }}>
                                                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Globe size={16} /> Aperçu du Widget
                                                </h4>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <div style={{
                                                        width: '260px',
                                                        height: '140px',
                                                        backgroundColor: 'white',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                                        overflow: 'hidden',
                                                        border: '1px solid #eee'
                                                    }}>
                                                        <div style={{ backgroundColor: primaryColor, height: '40px', padding: '0 12px', display: 'flex', alignItems: 'center', color: 'white', fontSize: '12px', fontWeight: '700' }}>
                                                            Live Chat asad.to
                                                        </div>
                                                        <div style={{ padding: '12px' }}>
                                                            <div style={{ backgroundColor: '#f3f4f6', padding: '8px 12px', borderRadius: '12px 12px 12px 2px', fontSize: '11px', maxWidth: '80%' }}>
                                                                {welcomeMsg}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'notifs' && (
                                    <motion.div
                                        key="notifs"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Préférences de Notification</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {[
                                                { id: 'email', label: 'Alertes par Email', sub: 'Recevoir un email pour chaque nouveau message.', icon: Mail, value: emailNotif, setter: setEmailNotif },
                                                { id: 'whatsapp', label: 'Notifications WhatsApp', sub: 'Recevoir des alertes sur votre mobile (Bêta).', icon: Smartphone, value: whatsappNotif, setter: setWhatsappNotif },
                                            ].map(item => (
                                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: '16px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }}>
                                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                        <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                                                            <item.icon size={20} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{item.label}</div>
                                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.sub}</div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        onClick={() => item.setter(!item.value)}
                                                        style={{
                                                            width: '48px',
                                                            height: '24px',
                                                            backgroundColor: item.value ? '#00b06b' : '#e5e7eb',
                                                            borderRadius: '12px',
                                                            position: 'relative',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.3s'
                                                        }}
                                                    >
                                                        <motion.div
                                                            animate={{ x: item.value ? 26 : 2 }}
                                                            style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', marginTop: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'integration' && (
                                    <motion.div
                                        key="integration"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Intégration WordPress</h2>
                                        <div style={{ backgroundColor: '#f0fdf4', padding: '24px', borderRadius: '20px', border: '1px solid #bbf7d0', marginBottom: '32px' }}>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                                <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b06b', border: '1px solid #bbf7d0' }}>
                                                    <Zap size={20} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#166534', marginBottom: '4px' }}>Connectez votre site</h3>
                                                    <p style={{ fontSize: '14px', color: '#166534', opacity: 0.8 }}>Utilisez votre clé unique pour activer le chat en direct sur votre installation WordPress.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '32px' }}>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#374151' }}>Votre Site Key</label>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={`asad_key_${user.id}_live`}
                                                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontFamily: 'monospace', fontSize: '14px', color: '#111827' }}
                                                />
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(`asad_key_${user.id}_live`)}
                                                    style={{ padding: '12px 24px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                                                >
                                                    Copier
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
                                            <p>Suivez ces étapes :</p>
                                            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <li>Installez le plugin **asad.to** sur WordPress.</li>
                                                <li>Allez dans Réglages &gt; asad.to Chat.</li>
                                                <li>Collez votre Site Key et enregistrez.</li>
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {status.msg && status.type !== 'loading' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        marginTop: '32px',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        backgroundColor: status.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                        color: status.type === 'success' ? '#10b981' : '#ef4444',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    {status.type === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
                                    {status.msg}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;
