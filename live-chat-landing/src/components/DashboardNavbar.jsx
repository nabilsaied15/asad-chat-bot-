import React, { useState } from 'react';
import { LogOut, User, Bell, ChevronDown, X, Mail, Save } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardNavbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [name, setName] = useState(user.name || '');
    const [email, setEmail] = useState(user.email || '');
    const [status, setStatus] = useState({ type: '', msg: '' });

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
                    <div style={{ color: '#6b7280', cursor: 'pointer' }}><Bell size={20} /></div>

                    <div
                        onClick={() => setIsModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 12px', borderRadius: '12px', border: '1px solid #f3f4f6', cursor: 'pointer', color: 'inherit' }}
                    >
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                            <User size={18} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', lineHeight: 1.2 }}>{user.name || 'Agent'}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{user.email}</div>
                        </div>
                        <ChevronDown size={14} color="#9ca3af" />
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#ef4444',
                            backgroundColor: '#fef2f2',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </nav>

            {/* Profile Modal */}
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
