import React, { useState, useEffect } from 'react';
import { LogOut, User, Bell, ChevronDown, X, Mail, Save, MessageSquare, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardNavbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [totalUnread, setTotalUnread] = useState(0);

    // Form state (used in the quick-edit modal)
    const [name, setName] = useState(user.name || '');
    const [email, setEmail] = useState(user.email || '');
    const [status, setStatus] = useState({ type: '', msg: '' });

    useEffect(() => {
        const syncUser = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/users/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const updated = { ...user, role: data.role };
                    localStorage.setItem('user', JSON.stringify(updated));
                    setUser(updated);
                }
            } catch (err) {
                console.error('Erreur sync user');
            }
        };

        syncUser();
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (totalUnread > 0) {
            document.title = `(${totalUnread}) asad.to | Dashboard`;
        } else {
            document.title = `asad.to | Dashboard`;
        }
    }, [totalUnread]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/notifications/unread');
            const data = await res.json();
            setNotifications(data.latest || []);
            setTotalUnread(data.total || 0);
        } catch (err) {
            console.error('Erreur notifications');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });

        try {
            const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });
            const data = await response.json();

            if (response.ok) {
                const updatedUser = { ...user, name, email };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setStatus({ type: 'success', msg: 'Profil mis à jour !' });
                setTimeout(() => {
                    setIsModalOpen(false);
                    setStatus({ type: '', msg: '' });
                }, 1500);
            } else {
                setStatus({ type: 'error', msg: data.error || 'Erreur lors de la mise à jour' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Erreur serveur' });
        }
    };

    return (
        <>
            <nav style={{
                height: '64px',
                backgroundColor: 'white',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800', fontSize: '20px', textDecoration: 'none' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>a.</div>
                    asad.to
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <div
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            style={{ color: '#6b7280', cursor: 'pointer', position: 'relative' }}
                        >
                            <Bell size={20} />
                            {totalUnread > 0 && (
                                <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid white' }}>
                                    {totalUnread}
                                </span>
                            )}
                        </div>

                        <AnimatePresence>
                            {isNotifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    style={{
                                        position: 'absolute',
                                        top: '40px',
                                        right: '0',
                                        width: '320px',
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                        border: '1px solid #e5e7eb',
                                        overflow: 'hidden',
                                        zIndex: 1000
                                    }}
                                >
                                    <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6', fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>
                                        Notifications
                                    </div>
                                    <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                                        {notifications.map((notif, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    navigate(`/inbox?visitorId=${notif.visitor_id}`);
                                                    setIsNotifOpen(false);
                                                }}
                                                style={{ padding: '12px 16px', borderBottom: '1px solid #f9fafb', cursor: 'pointer', display: 'flex', gap: '12px', transition: 'background 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div style={{ minWidth: '36px', height: '36px', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <MessageSquare size={18} />
                                                </div>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Visitor {notif.visitor_id?.substring(0, 5)}...</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {notif.content}
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {notifications.length === 0 && (
                                            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                                                Pas de nouveaux messages
                                            </div>
                                        )}
                                    </div>
                                    <Link to="/inbox" onClick={() => setIsNotifOpen(false)} style={{ display: 'block', padding: '12px', textAlign: 'center', color: '#00b06b', fontSize: '13px', fontWeight: '600', textDecoration: 'none', backgroundColor: '#f0fdf4' }}>
                                        Voir tous les messages
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 12px', borderRadius: '12px', border: '1px solid #f3f4f6', cursor: 'pointer', color: 'inherit' }}
                        >
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                                <User size={18} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {user.name || 'Agent'}
                                    {user.role && (
                                        <span style={{
                                            fontSize: '9px',
                                            textTransform: 'uppercase',
                                            backgroundColor: user.role === 'admin' ? '#00b06b15' : '#f3f4f6',
                                            color: user.role === 'admin' ? '#00b06b' : '#6b7280',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {user.role}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{user.email}</div>
                            </div>
                            <ChevronDown size={14} color="#9ca3af" style={{ transform: isProfileMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                        </div>

                        <AnimatePresence>
                            {isProfileMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    style={{
                                        position: 'absolute',
                                        top: '48px',
                                        right: '0',
                                        width: '200px',
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                        border: '1px solid #e5e7eb',
                                        padding: '8px',
                                        zIndex: 1000
                                    }}
                                >
                                    <div
                                        onClick={() => { navigate('/settings'); setIsProfileMenuOpen(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#475569', transition: 'all 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Settings size={16} /> Paramètres
                                    </div>
                                    <div
                                        onClick={() => { setIsModalOpen(true); setIsProfileMenuOpen(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#475569', transition: 'all 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <User size={16} /> Profil Rapide
                                    </div>
                                    <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '8px 0' }}></div>
                                    <div
                                        onClick={handleLogout}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#ef4444', transition: 'all 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <LogOut size={16} /> Logout
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </nav>

            {/* Profile Modal (Legacy Quick Edit) */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            style={{
                                position: 'relative',
                                backgroundColor: 'white',
                                width: '100%',
                                maxWidth: '440px',
                                borderRadius: '24px',
                                padding: '32px',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                            }}
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ position: 'absolute', right: '24px', top: '24px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#9ca3af' }}
                            >
                                <X size={20} />
                            </button>

                            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Mon Profil</h2>
                            <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '14px' }}>Modifiez vos informations ci-dessous.</p>

                            {status.msg && (
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    fontSize: '14px',
                                    backgroundColor: status.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                    color: status.type === 'success' ? '#10b981' : '#ef4444'
                                }}>
                                    {status.msg}
                                </div>
                            )}

                            <form onSubmit={handleUpdate}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#374151' }}>Nom</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#374151' }}>Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px' }}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', fontSize: '15px' }}>
                                    <Save size={18} /> Enregistrer
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default DashboardNavbar;
