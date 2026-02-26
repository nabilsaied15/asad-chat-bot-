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
    Smartphone,
    X,
    Lock,
    Eye,
    EyeOff,
    Copy,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../config';

const COLORS = {
    primary: '#00b06b',
    primaryDark: '#008f56',
    secondary: '#111827',
    gray: '#6b7280',
    lightGray: '#f3f4f6',
    border: '#eef2f6',
    white: '#ffffff',
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    glass: 'rgba(255, 255, 255, 0.7)'
};

const SectionHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: COLORS.secondary, letterSpacing: '-0.02em', marginBottom: '8px' }}>{title}</h2>
        <p style={{ color: COLORS.gray, fontSize: '15px' }}>{subtitle}</p>
    </div>
);

const InputField = ({ label, value, onChange, type = 'text', placeholder, icon: Icon, desc }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: '700', color: COLORS.secondary, marginLeft: '4px' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            {Icon && <Icon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: COLORS.gray }} />}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: Icon ? '14px 16px 14px 48px' : '14px 16px',
                    borderRadius: '16px',
                    border: '1px solid #eef2f6',
                    backgroundColor: COLORS.lightGray,
                    outline: 'none',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    fontWeight: '500'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = COLORS.primary;
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = `0 0 0 4px ${COLORS.primary}10`;
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = '#eef2f6';
                    e.target.style.backgroundColor = COLORS.lightGray;
                    e.target.style.boxShadow = 'none';
                }}
            />
        </div>
        {desc && <p style={{ fontSize: '12px', color: COLORS.gray, marginLeft: '4px', marginTop: '4px', fontWeight: '500' }}>{desc}</p>}
    </div>
);

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [activeTab, setActiveTab] = useState('profile');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(true);

    // Profile State
    const [name, setName] = useState(user.name || '');
    const [email, setEmail] = useState(user.email || '');

    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);

    // Widget & Notif State
    const [settings, setSettings] = useState({
        primary_color: '#00b06b',
        welcome_message: 'Bonjour ! Comment pouvons-nous vous aider ?',
        email_notifications: true,
        whatsapp_notifications: false,
        whatsapp_number: ''
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${config.API_URL}/api/settings/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    ...data,
                    email_notifications: !!data.email_notifications,
                    whatsapp_notifications: !!data.whatsapp_notifications,
                    whatsapp_number: data.whatsapp_number || ''
                });
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
        } finally {
            setLoading(false);
        }
    };

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

    const handleSaveSettings = async () => {
        setStatus({ type: 'loading', msg: 'Enregistrement...' });
        try {
            const response = await fetch(`${config.API_URL}/api/settings/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...settings,
                    email_notifications: settings.email_notifications ? 1 : 0,
                    whatsapp_notifications: settings.whatsapp_notifications ? 1 : 0
                })
            });

            if (response.ok) {
                setStatus({ type: 'success', msg: 'Paramètres sauvegardés !' });
            } else {
                setStatus({ type: 'error', msg: 'Erreur lors de la sauvegarde.' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Erreur réseau.' });
        }
        setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return setStatus({ type: 'error', msg: 'Les mots de passe ne correspondent pas.' });
        }
        if (passwords.new.length < 6) {
            return setStatus({ type: 'error', msg: 'Le nouveau mot de passe doit faire au moins 6 caractères.' });
        }

        setStatus({ type: 'loading', msg: 'Vérification...' });
        try {
            const response = await fetch(`${config.API_URL}/api/users/${user.id}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', msg: 'Mot de passe modifié avec succès !' });
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                setStatus({ type: 'error', msg: data.error || 'Erreur lors de la modification.' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Erreur réseau.' });
        }
        setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    };

    const tabs = [
        { id: 'profile', label: 'Mon Profil', icon: User, desc: 'Infos personnelles et compte' },
        { id: 'widget', label: 'Widget & Design', icon: Palette, desc: 'Apparence du salon de chat' },
        { id: 'notifs', label: 'Notifications', icon: Bell, desc: 'Email, WhatsApp et alertes' },
        { id: 'security', label: 'Sécurité', icon: Shield, desc: 'Mot de passe et authentification' },
        { id: 'integration', label: 'Intégration', icon: LinkIcon, desc: 'WordPress et API Keys' },
    ];

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            fontFamily: '"Outfit", "Inter", sans-serif'
        }}>
            <DashboardNavbar />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Modern Sidebar Rail */}
                <nav style={{
                    width: '72px',
                    backgroundColor: COLORS.secondary,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '24px 0',
                    gap: '24px',
                    zIndex: 20,
                    boxShadow: '4px 0 20px rgba(0,0,0,0.05)'
                }}>
                    <motion.div whileHover={{ scale: 1.1 }} onClick={() => navigate('/dashboard')} style={{ color: 'white', opacity: 0.5, cursor: 'pointer', padding: '12px' }} title="Dashboard"><Monitor size={22} /></motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} onClick={() => navigate('/monitoring')} style={{ color: 'white', opacity: 0.5, cursor: 'pointer', padding: '12px' }} title="Monitoring"><Users size={22} /></motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} onClick={() => navigate('/reports')} style={{ color: 'white', opacity: 0.5, cursor: 'pointer', padding: '12px' }} title="Reports"><TrendingUp size={22} /></motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} onClick={() => navigate('/inbox')} style={{ color: 'white', opacity: 0.5, cursor: 'pointer', padding: '12px' }} title="Inbox"><MessageSquare size={22} /></motion.div>
                    <div style={{ marginTop: 'auto', width: '3px', height: '24px', backgroundColor: COLORS.primary, borderRadius: '0 4px 4px 0', position: 'absolute', left: 0, transform: 'translateY(280px)' }}></div>
                    <motion.div style={{ color: COLORS.primary, cursor: 'pointer', padding: '12px', backgroundColor: `${COLORS.primary}15`, borderRadius: '12px' }} title="Settings"><SettingsIcon size={22} /></motion.div>
                </nav>

                <main style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.primary, fontWeight: '700', fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <SettingsIcon size={14} /> Espace Administration
                                </div>
                                <h1 style={{ fontSize: '40px', fontWeight: '900', color: COLORS.secondary, letterSpacing: '-0.04em', lineHeight: 1 }}>Configuration</h1>
                                <p style={{ color: COLORS.gray, fontSize: '17px', marginTop: '12px', fontWeight: '500' }}>Optimisez votre plateforme de chat asad.to.</p>
                            </div>

                            {status.msg && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    style={{
                                        padding: '12px 20px',
                                        borderRadius: '16px',
                                        backgroundColor: status.type === 'success' ? `${COLORS.success}15` : status.type === 'loading' ? `${COLORS.secondary}05` : `${COLORS.danger}10`,
                                        color: status.type === 'success' ? COLORS.success : status.type === 'loading' ? COLORS.secondary : COLORS.danger,
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        border: `1px solid ${status.type === 'success' ? COLORS.success + '20' : '#ddd'}`
                                    }}
                                >
                                    {status.type === 'loading' ? <div className="spinner-small" /> : status.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
                                    {status.msg}
                                </motion.div>
                            )}
                        </header>

                        <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
                            {/* Navigation Tabs - Glassmorphism */}
                            <div style={{
                                width: '280px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                position: 'sticky',
                                top: '0'
                            }}>
                                {tabs.map(tab => (
                                    <motion.button
                                        key={tab.id}
                                        whileHover={{ x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            padding: '16px 20px',
                                            borderRadius: '20px',
                                            border: '1px solid',
                                            borderColor: activeTab === tab.id ? `${COLORS.primary}20` : 'transparent',
                                            backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                                            color: activeTab === tab.id ? COLORS.primary : COLORS.gray,
                                            boxShadow: activeTab === tab.id ? '0 10px 15px -3px rgba(0, 176, 107, 0.1)' : 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        <div style={{
                                            padding: '8px',
                                            borderRadius: '10px',
                                            backgroundColor: activeTab === tab.id ? `${COLORS.primary}10` : 'transparent',
                                            color: activeTab === tab.id ? COLORS.primary : COLORS.gray
                                        }}>
                                            <tab.icon size={20} weight={activeTab === tab.id ? 'bold' : 'regular'} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '15px' }}>{tab.label}</div>
                                            <div style={{ fontSize: '11px', opacity: 0.7, fontWeight: '600' }}>{tab.desc}</div>
                                        </div>
                                        {activeTab === tab.id && <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Content Side */}
                            <div style={{
                                flex: 1,
                                backgroundColor: COLORS.white,
                                borderRadius: '32px',
                                padding: '48px',
                                border: `1px solid ${COLORS.border}`,
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.02), 0 10px 10px -5px rgba(0,0,0,0.01)',
                                minHeight: '600px',
                                position: 'relative'
                            }}>
                                {loading ? (
                                    <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div className="loader-orbit" />
                                    </div>
                                ) : (
                                    <AnimatePresence mode="wait">
                                        {/* PROFILE SECTION */}
                                        {activeTab === 'profile' && (
                                            <motion.div
                                                key="profile"
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -15 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <SectionHeader
                                                    title="Identité & Profil"
                                                    subtitle="Gérez vos informations de compte et l'adresse email de contact."
                                                />
                                                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <InputField
                                                            label="Nom Complet"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            icon={User}
                                                            placeholder="Votre nom"
                                                        />
                                                        <InputField
                                                            label="Adresse Email"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            icon={Mail}
                                                            placeholder="votre@email.com"
                                                        />
                                                    </div>

                                                    <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #eef2f6' }}>
                                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                            <div style={{ width: '44px', height: '44px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.gray, boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                                                                <Globe size={20} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '800', fontSize: '15px', color: COLORS.secondary }}>Rôle du compte</div>
                                                                <div style={{ fontSize: '13px', color: COLORS.primary, fontWeight: '700', textTransform: 'uppercase' }}>{user.role || 'Agent'} Administrateur</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            type="submit"
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                backgroundColor: COLORS.secondary,
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '16px 32px',
                                                                borderRadius: '20px',
                                                                fontWeight: '800',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                                            }}
                                                        >
                                                            <Save size={20} /> Mettre à jour le profil
                                                        </motion.button>
                                                    </div>
                                                </form>
                                            </motion.div>
                                        )}

                                        {/* WIDGET SECTION */}
                                        {activeTab === 'widget' && (
                                            <motion.div
                                                key="widget"
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -15 }}
                                            >
                                                <SectionHeader
                                                    title="Design du Widget"
                                                    subtitle="Personnalisez l'apparence de votre fenêtre de chat pour vos clients."
                                                />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '15px', fontWeight: '800', marginBottom: '16px', color: COLORS.secondary }}>Couleur Principale</label>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                                                {['#00b06b', '#2563eb', '#7c3aed', '#db2777', '#f59e0b', '#111827'].map(color => (
                                                                    <motion.div
                                                                        key={color}
                                                                        whileHover={{ scale: 1.15 }}
                                                                        onClick={() => setSettings({ ...settings, primary_color: color })}
                                                                        style={{
                                                                            width: '44px',
                                                                            height: '44px',
                                                                            backgroundColor: color,
                                                                            borderRadius: '14px',
                                                                            cursor: 'pointer',
                                                                            position: 'relative',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            boxShadow: settings.primary_color === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : '0 4px 6px -1px rgba(0,0,0,0.05)'
                                                                        }}
                                                                    >
                                                                        {settings.primary_color === color && <CheckCircle size={20} color="white" />}
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '15px', fontWeight: '800', marginBottom: '12px', color: COLORS.secondary }}>Phrase d'accueil</label>
                                                            <textarea
                                                                value={settings.welcome_message}
                                                                onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                                                                rows={4}
                                                                placeholder="Écrivez le message qui accueillera vos visiteurs..."
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '16px',
                                                                    borderRadius: '20px',
                                                                    border: '1px solid #eef2f6',
                                                                    backgroundColor: COLORS.lightGray,
                                                                    outline: 'none',
                                                                    fontSize: '15px',
                                                                    resize: 'none',
                                                                    fontWeight: '500',
                                                                    lineHeight: 1.6
                                                                }}
                                                            />
                                                        </div>

                                                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                onClick={handleSaveSettings}
                                                                style={{
                                                                    backgroundColor: COLORS.primary,
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '16px 32px',
                                                                    borderRadius: '20px',
                                                                    fontWeight: '800',
                                                                    cursor: 'pointer',
                                                                    boxShadow: `0 10px 15px -3px ${COLORS.primary}30`
                                                                }}
                                                            >
                                                                Appliquer au Widget
                                                            </motion.button>
                                                        </div>
                                                    </div>

                                                    {/* Live Preview UI */}
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <label style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', color: COLORS.gray, textTransform: 'uppercase' }}>Aperçu en temps réel</label>
                                                        <div style={{
                                                            flex: 1,
                                                            border: '2px dashed #eef2f6',
                                                            borderRadius: '24px',
                                                            backgroundColor: '#f8fafc',
                                                            padding: '24px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'flex-end',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            minHeight: '350px'
                                                        }}>
                                                            <motion.div
                                                                animate={{ y: 0, opacity: 1 }}
                                                                initial={{ y: 20, opacity: 0 }}
                                                                style={{
                                                                    width: '240px',
                                                                    backgroundColor: 'white',
                                                                    borderRadius: '20px',
                                                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                                                    overflow: 'hidden',
                                                                    border: '1px solid #eee'
                                                                }}
                                                            >
                                                                <div style={{
                                                                    backgroundColor: settings.primary_color,
                                                                    padding: '16px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '10px',
                                                                    color: 'white'
                                                                }}>
                                                                    <div style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '6px', color: settings.primary_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' }}>a.</div>
                                                                    <div style={{ fontSize: '14px', fontWeight: '800' }}>Support Direct</div>
                                                                </div>
                                                                <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                    <div style={{
                                                                        backgroundColor: '#f1f5f9',
                                                                        padding: '10px 14px',
                                                                        borderRadius: '16px 16px 16px 4px',
                                                                        fontSize: '12px',
                                                                        maxWidth: '85%',
                                                                        fontWeight: '600',
                                                                        color: '#334155'
                                                                    }}>
                                                                        {settings.welcome_message}
                                                                    </div>
                                                                </div>
                                                                <div style={{ height: '50px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                                                                    <div style={{ height: '32px', flex: 1, backgroundColor: '#f8fafc', borderRadius: '10px' }}></div>
                                                                </div>
                                                            </motion.div>
                                                            <div style={{
                                                                width: '48px',
                                                                height: '48px',
                                                                borderRadius: '50%',
                                                                backgroundColor: settings.primary_color,
                                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white'
                                                            }}>
                                                                <MessageSquare size={20} fill="currentColor" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* SECURITY SECTION */}
                                        {activeTab === 'security' && (
                                            <motion.div
                                                key="security"
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -15 }}
                                            >
                                                <SectionHeader
                                                    title="Sécurité du Compte"
                                                    subtitle="Changez votre mot de passe et activez la protection de vos données."
                                                />
                                                <form onSubmit={handlePasswordChange} style={{ maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                    <InputField
                                                        label="Mot de passe actuel"
                                                        type={showPass ? 'text' : 'password'}
                                                        value={passwords.current}
                                                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                        icon={Lock}
                                                    />
                                                    <InputField
                                                        label="Nouveau mot de passe"
                                                        type={showPass ? 'text' : 'password'}
                                                        value={passwords.new}
                                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                        icon={Zap}
                                                    />
                                                    <InputField
                                                        label="Confirmer le mot de passe"
                                                        type={showPass ? 'text' : 'password'}
                                                        value={passwords.confirm}
                                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                        icon={ChevronRight}
                                                    />
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setShowPass(!showPass)}>
                                                        {showPass ? <EyeOff size={16} color={COLORS.gray} /> : <Eye size={16} color={COLORS.gray} />}
                                                        <span style={{ fontSize: '13px', color: COLORS.gray, fontWeight: '700' }}>Afficher les mots de passe</span>
                                                    </div>

                                                    <div style={{ paddingTop: '12px' }}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            type="submit"
                                                            style={{
                                                                backgroundColor: COLORS.secondary,
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '16px 32px',
                                                                borderRadius: '20px',
                                                                fontWeight: '800',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Mettre à jour la sécurité
                                                        </motion.button>
                                                    </div>
                                                </form>
                                            </motion.div>
                                        )}

                                        {/* NOTIFICATIONS SECTION */}
                                        {activeTab === 'notifs' && (
                                            <motion.div
                                                key="notifs"
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -15 }}
                                            >
                                                <SectionHeader
                                                    title="Notifications & Alertes"
                                                    subtitle="Choisissez comment vous souhaitez être informé des nouveaux messages."
                                                />
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                    {[
                                                        { id: 'email', label: 'Alertes par Email', sub: 'Recevoir un descriptif pour chaque nouveau message visiteur.', icon: Mail, value: settings.email_notifications, key: 'email_notifications' },
                                                        { id: 'whatsapp', label: 'Notifications WhatsApp', sub: 'Recevoir des alertes directes sur votre mobile (Bêta).', icon: Smartphone, value: settings.whatsapp_notifications, key: 'whatsapp_notifications' },
                                                    ].map(item => (
                                                        <motion.div
                                                            key={item.id}
                                                            whileHover={{ scale: 1.01 }}
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '16px',
                                                                padding: '24px',
                                                                borderRadius: '24px',
                                                                backgroundColor: '#f8fafc',
                                                                border: '1px solid #eef2f6'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                                    <div style={{ width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.gray, border: '1px solid #eef2f6' }}>
                                                                        <item.icon size={22} />
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontSize: '17px', fontWeight: '800', color: COLORS.secondary }}>{item.label}</div>
                                                                        <div style={{ fontSize: '13px', color: COLORS.gray, fontWeight: '500', marginTop: '2px' }}>{item.sub}</div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    onClick={() => setSettings({ ...settings, [item.key]: !item.value })}
                                                                    style={{
                                                                        width: '56px',
                                                                        height: '30px',
                                                                        backgroundColor: item.value ? COLORS.primary : '#e5e7eb',
                                                                        borderRadius: '20px',
                                                                        position: 'relative',
                                                                        cursor: 'pointer',
                                                                        transition: 'background 0.3s'
                                                                    }}
                                                                >
                                                                    <motion.div
                                                                        animate={{ x: item.value ? 28 : 2 }}
                                                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                                        style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%', marginTop: '3px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {item.id === 'whatsapp' && item.value && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #eee' }}
                                                                >
                                                                    <InputField
                                                                        label="Numéro WhatsApp de destination"
                                                                        placeholder="Ex: 33612345678"
                                                                        value={settings.whatsapp_number}
                                                                        onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                                                                        icon={Smartphone}
                                                                        desc="Format international sans +, sans espaces (ex: 33600...)"
                                                                    />
                                                                    <p style={{ fontSize: '12px', color: COLORS.gray, marginTop: '8px', fontWeight: '500' }}>
                                                                        C'est le numéro qui recevra les alertes par un lien WhatsApp.
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                        </motion.div>
                                                    ))}

                                                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={handleSaveSettings}
                                                            style={{ backgroundColor: COLORS.secondary, color: 'white', border: 'none', padding: '16px 32px', borderRadius: '20px', fontWeight: '800', cursor: 'pointer' }}
                                                        >
                                                            Enregistrer les préférences
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* INTEGRATION SECTION */}
                                        {activeTab === 'integration' && (
                                            <motion.div
                                                key="integration"
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -15 }}
                                            >
                                                <SectionHeader
                                                    title="Intégration & API"
                                                    subtitle="Utilisez ces identifiants pour connecter asad.to à votre site web."
                                                />
                                                <div style={{ backgroundColor: `${COLORS.primary}10`, padding: '32px', borderRadius: '24px', border: `1px solid ${COLORS.primary}20`, marginBottom: '40px', position: 'relative', overflow: 'hidden' }}>
                                                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                                        <div style={{ width: '48px', height: '48px', backgroundColor: COLORS.white, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.primary, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                                            <LinkIcon size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: COLORS.secondary, marginBottom: '8px' }}>Prêt pour le déploiement ?</h3>
                                                            <p style={{ fontSize: '15px', color: COLORS.secondary, opacity: 0.7, lineHeight: 1.5 }}>Téléchargez le plugin WordPress et utilisez votre clé API pour commencer à discuter avec vos clients en moins de 2 minutes.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ marginBottom: '40px' }}>
                                                    <label style={{ display: 'block', fontSize: '15px', fontWeight: '800', marginBottom: '16px', color: COLORS.secondary }}>Votre Site Key Unique</label>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <div style={{
                                                            flex: 1,
                                                            padding: '16px 20px',
                                                            borderRadius: '20px',
                                                            border: '1px solid #eef2f6',
                                                            backgroundColor: '#f8fafc',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px'
                                                        }}>
                                                            <Smartphone size={18} color={COLORS.gray} />
                                                            <span style={{ fontFamily: '"Fira Code", monospace', fontSize: '14px', fontWeight: '700', color: COLORS.secondary }}>
                                                                asad_key_{user.id}_live
                                                            </span>
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`asad_key_${user.id}_live`);
                                                                setStatus({ type: 'success', msg: 'Clé copiée !' });
                                                                setTimeout(() => setStatus({ type: '', msg: '' }), 2000);
                                                            }}
                                                            style={{
                                                                padding: '0 24px',
                                                                backgroundColor: COLORS.white,
                                                                color: COLORS.secondary,
                                                                border: '1px solid #eef2f6',
                                                                borderRadius: '20px',
                                                                fontSize: '14px',
                                                                fontWeight: '800',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
                                                            }}
                                                        >
                                                            <Copy size={18} /> Copier
                                                        </motion.button>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    backgroundColor: COLORS.white,
                                                    padding: '28px',
                                                    borderRadius: '24px',
                                                    border: '1px solid #f1f5f9',
                                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.01)'
                                                }}>
                                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: COLORS.secondary, marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Guide d'installation rapide</h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                        {[
                                                            { step: 1, text: "Téléchargez le plugin **asad-chat.zip** depuis votre espace client." },
                                                            { step: 2, text: "Dans votre admin WordPress, allez dans **Plugins > Ajouter** et cliquez sur **Téléverser**." },
                                                            { step: 3, text: "Activez le plugin, puis allez dans **Réglages > asad.to Chat**." },
                                                            { step: 4, text: "Collez votre **Site Key** ci-dessus et enregistrez les modifications." }
                                                        ].map(item => (
                                                            <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                                                <div style={{ width: '24px', height: '24px', backgroundColor: COLORS.lightGray, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: COLORS.gray, flexShrink: 0 }}>{item.step}</div>
                                                                <p style={{ fontSize: '14px', color: COLORS.gray, lineHeight: 1.6, marginTop: '2px' }}>{item.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: COLORS.secondary }}>{part}</strong> : part)}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                .spinner-small {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(0,0,0,0.1);
                    border-top-color: currentColor;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                
                .loader-orbit {
                    width: 48px;
                    height: 48px;
                    border: 3px solid ${COLORS.lightGray};
                    border-top-color: ${COLORS.primary};
                    border-radius: 50%;
                    animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                }
            `}</style>
        </div>
    );
};

export default Settings;
