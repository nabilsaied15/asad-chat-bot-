import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Zap, BarChart3, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const StatCard = ({ icon: Icon, value, label, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
        style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '24px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            minWidth: '200px'
        }}
    >
        <div style={{ color: 'var(--primary)', marginBottom: '8px' }}>
            <Icon size={32} />
        </div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-main)' }}>{value}</div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </motion.div>
);

const Hero = () => {
    const { t } = useLanguage();
    const [index, setIndex] = useState(0);

    const words = t.hero.words;

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 2000);
        return () => clearInterval(timer);
    }, [words]);

    const handleTrackClick = async () => {
        try {
            await fetch(`${config.API_URL}/api/stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_type: 'site_click', visitor_id: 'internal_agent' })
            });
        } catch (err) {
            console.error('Erreur tracking:', err);
        }
    };

    return (
        <section style={{ padding: '120px 0 80px', textAlign: 'center', background: 'radial-gradient(circle at top, #f0fdf4 0%, #ffffff 100%)' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#dcfce7',
                        padding: '8px 16px',
                        borderRadius: '999px',
                        color: 'var(--primary-dark)',
                        fontWeight: '700',
                        fontSize: '14px',
                        marginBottom: '32px'
                    }}>
                        <Zap size={16} fill="currentColor" /> Solution Intelligente
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        fontSize: '72px',
                        fontWeight: '900',
                        letterSpacing: '-0.03em',
                        marginBottom: '24px',
                        lineHeight: 1,
                        background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    {t.hero.title === 'Welcome to asad.to' ? (
                        <>Welcome to <br /><span style={{ color: 'var(--primary)' }}>asad.to</span></>
                    ) : (
                        <>Bienvenue chez <br /><span style={{ color: 'var(--primary)' }}>asad.to</span></>
                    )}
                </motion.h1>

                <h2 style={{ fontSize: '32px', color: 'var(--text-muted)', marginBottom: '32px', fontWeight: '600' }}>{t.hero.subtitle}</h2>

                <div style={{ fontSize: '48px', fontWeight: '800', marginBottom: '40px' }}>
                    {t.hero.question} <br />
                    <span style={{ position: 'relative', display: 'inline-block', minWidth: '220px', color: 'var(--primary)' }}>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={words[index]}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                style={{ position: 'absolute', left: 0, right: 0 }}
                            >
                                {words[index]}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                    <br />
                    {t.hero.end}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        fontSize: '22px',
                        color: 'var(--text-muted)',
                        maxWidth: '740px',
                        margin: '0 auto 60px',
                        lineHeight: 1.6
                    }}
                >
                    {t.hero.desc}
                </motion.p>

                {/* Statistics Cards */}
                <div style={{
                    display: 'flex',
                    gap: '24px',
                    flexWrap: 'wrap',
                    marginTop: '80px',
                    justifyContent: 'center'
                }}>
                    <StatCard
                        icon={MessageSquare}
                        value="1.2k+"
                        label={t.stats.messages}
                        delay={0.3}
                    />
                    <StatCard
                        icon={Users}
                        value="98%"
                        label={t.stats.satisfaction}
                        delay={0.4}
                    />
                    <StatCard
                        icon={BarChart3}
                        value="24/7"
                        label={t.stats.availability}
                        delay={0.5}
                    />
                    <StatCard
                        icon={TrendingUp}
                        value="45%"
                        label={t.stats.efficiency}
                        delay={0.6}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    style={{ marginTop: '80px' }}
                >
                    <button onClick={handleTrackClick} className="btn btn-primary" style={{ padding: '18px 48px', fontSize: '18px', borderRadius: '16px' }}>
                        {t.hero.btn}
                    </button>
                    <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        {t.hero.promo}
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
