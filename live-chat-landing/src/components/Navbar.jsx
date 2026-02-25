import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
    const { lang, toggleLanguage, t } = useLanguage();

    return (
        <nav style={{
            height: 'var(--nav-height)',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800', fontSize: '24px' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>a.</div>
                        asad.to
                    </Link>

                    <div style={{ display: 'flex', gap: '24px', fontSize: '15px', fontWeight: '500' }}>
                        <Link to="/">{t.nav.home}</Link>
                        <Link to="/inbox">{t.nav.inbox}</Link>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div
                        onClick={toggleLanguage}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}
                    >
                        <Globe size={18} /> {lang.toUpperCase()}
                    </div>
                    <Link to="/login" style={{ fontWeight: '600', fontSize: '15px' }}>{t.nav.login}</Link>
                    <Link to="/signup" className="btn btn-primary" style={{ display: 'inline-block' }}>{t.nav.signup}</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
