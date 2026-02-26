import React, { useState, useEffect, useMemo } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3, Users, MousePointer2, TrendingUp, Calendar,
    RefreshCcw, Monitor, Shield, MessageSquare, ArrowUpRight,
    Send, Clock, Target, Activity, Zap, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import config from '../config';

// Constants for theme
const COLORS = {
    primary: 'hsl(156, 100%, 35%)',    // #00b06b
    secondary: 'hsl(217, 91%, 60%)',  // #3b82f6
    accent: 'hsl(262, 83%, 58%)',     // #8b5cf6
    dark: 'hsl(222, 47%, 11%)',       // #0f172a
    gray: 'hsl(215, 16%, 47%)',       // #64748b
    light: 'hsl(210, 40%, 96.1%)',    // #f8f9fa
    white: '#ffffff',
    danger: 'hsl(0, 84%, 60%)'
};

const MetricCard = ({ title, value, icon: Icon, color, subtitle, trend, loading }) => (
    <motion.div
        whileHover={{ y: -5, boxShadow: '0 12px 20px -10px rgba(0, 176, 107, 0.15)' }}
        style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '24px',
            border: '1px solid #eef2f6',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{
                width: '44px',
                height: '44px',
                backgroundColor: `${color}15`,
                color: color,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={22} strokeWidth={2.5} />
            </div>
            {trend && (
                <div style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: trend > 0 ? COLORS.primary : COLORS.danger,
                    backgroundColor: trend > 0 ? `${COLORS.primary}10` : `${COLORS.danger}10`,
                    padding: '4px 8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                }}>
                    {trend > 0 ? <ArrowUpRight size={12} /> : null}
                    {trend}%
                </div>
            )}
        </div>

        <div>
            <h3 style={{ fontSize: '14px', color: COLORS.gray, fontWeight: '600', marginBottom: '4px' }}>{title}</h3>
            <div style={{ fontSize: '32px', fontWeight: '900', color: COLORS.dark, letterSpacing: '-0.03em' }}>
                {loading ? '...' : value}
            </div>
            {subtitle && (
                <p style={{ fontSize: '12px', color: COLORS.gray, marginTop: '4px', fontWeight: '500' }}>{subtitle}</p>
            )}
        </div>

        {/* Subtle background decoration */}
        <div style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-10px',
            opacity: 0.03,
            color: color,
            transform: 'rotate(-15deg)'
        }}>
            <Icon size={80} />
        </div>
    </motion.div>
);

const MessageChart = ({ data, refreshKey, period }) => {
    const periodData = useMemo(() => {
        const days = [];
        const isMonthly = period === '1y' || period === 'all';
        const count = period === '7d' ? 7 : (period === '30d' ? 30 : (period === '1y' ? 12 : 36));

        for (let i = count - 1; i >= 0; i--) {
            const date = new Date();
            if (isMonthly) {
                date.setMonth(date.getMonth() - i);
                const monthStr = date.toISOString().split('-').slice(0, 2).join('-');
                const existing = data.find(d => d.day === monthStr);
                days.push({
                    day: monthStr,
                    visitorCount: existing ? (existing.visitor_count || 0) : 0,
                    agentCount: existing ? (existing.agent_count || 0) : 0,
                    label: i % 3 === 0 ? date.toLocaleDateString('fr-FR', { month: 'short' }) : ''
                });
            } else {
                date.setDate(date.getDate() - i);
                const dayStr = date.toISOString().split('T')[0];
                const existing = data.find(d => d.day === dayStr);

                let label = '';
                if (period === '7d') label = date.toLocaleDateString('fr-FR', { weekday: 'short' });
                else if (i % 5 === 0) label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

                days.push({
                    day: dayStr,
                    visitorCount: existing ? (existing.visitor_count || 0) : 0,
                    agentCount: existing ? (existing.agent_count || 0) : 0,
                    label: label
                });
            }
        }
        return days;
    }, [data, period]);

    const maxCount = Math.max(...periodData.map(d => Math.max(d.visitorCount, d.agentCount)), 5);

    return (
        <motion.div
            key={refreshKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #eef2f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', height: '100%' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: COLORS.dark }}>Volume des Messages</h3>
                        <Info size={14} style={{ color: COLORS.gray, cursor: 'help' }} title="Volume comparatif entre les messages reçus et envoyés." />
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: COLORS.dark }}></div>
                        <span style={{ fontSize: '12px', color: COLORS.gray, fontWeight: '600' }}>Visiteurs</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: COLORS.primary }}></div>
                        <span style={{ fontSize: '12px', color: COLORS.gray, fontWeight: '600' }}>Equipe</span>
                    </div>
                </div>
            </div>

            <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', gap: period === '7d' ? '24px' : '6px', paddingBottom: '30px' }}>
                {periodData.map((item, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: '100%' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%', gap: '3px' }}>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(item.visitorCount / maxCount) * 100}%` }}
                                transition={{ type: "spring", stiffness: 80, delay: (i / periodData.length) * 0.3 }}
                                style={{
                                    width: period === '7d' ? '14px' : '100%',
                                    maxWidth: '14px',
                                    background: `linear-gradient(to top, ${COLORS.dark}, #2d3748)`,
                                    borderRadius: '6px 6px 2px 2px',
                                    position: 'relative'
                                }}
                            >
                                {item.visitorCount > 0 && period === '7d' && (
                                    <div style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: '900', color: COLORS.dark }}>
                                        {item.visitorCount}
                                    </div>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(item.agentCount / maxCount) * 100}%` }}
                                transition={{ type: "spring", stiffness: 80, delay: (i / periodData.length) * 0.3 + 0.05 }}
                                style={{
                                    width: period === '7d' ? '14px' : '100%',
                                    maxWidth: '14px',
                                    background: `linear-gradient(to top, ${COLORS.primary}, ${COLORS.primary}88)`,
                                    borderRadius: '6px 6px 2px 2px',
                                    position: 'relative'
                                }}
                            >
                                {item.agentCount > 0 && period === '7d' && (
                                    <div style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: '900', color: COLORS.primary }}>
                                        {item.agentCount}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                        <span style={{
                            fontSize: '10px',
                            color: COLORS.gray,
                            fontWeight: i === periodData.length - 1 ? '900' : '600',
                            textTransform: 'uppercase',
                            marginTop: '8px',
                            whiteSpace: 'nowrap'
                        }}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const HourlyActivityChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.count), 1);
    const hours = Array.from({ length: 24 }, (_, i) => {
        const d = data.find(row => row.hour === i);
        return { hour: i, count: d ? d.count : 0 };
    });

    return (
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #eef2f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: COLORS.dark }}>Pics d'Activité</h3>
                <span style={{ fontSize: '12px', color: COLORS.gray, fontWeight: '600' }}>30 derniers jours</span>
            </div>
            <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                {hours.map((h, i) => (
                    <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(h.count / max) * 100}%` }}
                                style={{
                                    width: '100%',
                                    backgroundColor: h.count === max ? COLORS.primary : `${COLORS.primary}20`,
                                    borderRadius: '4px',
                                    cursor: 'help'
                                }}
                                title={`${h.hour}h: ${h.count} messages`}
                            />
                        </div>
                        <span style={{ fontSize: '9px', color: COLORS.gray, fontWeight: '600' }}>
                            {i % 4 === 0 ? `${h.hour}h` : ''}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Reports = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalClicks: 0, onlineVisitors: 0, totalAgentMessages: 0,
        totalVisitorMessages: 0, totalConversations: 0, avgResponseTime: 0
    });
    const [dailyMessages, setDailyMessages] = useState([]);
    const [hourlyData, setHourlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [period, setPeriod] = useState('30d');

    const fetchStats = async (selectedPeriod = period) => {
        setRefreshing(true);
        try {
            const [summaryRes, dailyRes, hourlyRes] = await Promise.all([
                fetch(`${config.API_URL}/api/stats/summary`),
                fetch(`${config.API_URL}/api/stats/messages-by-day?period=${selectedPeriod}`),
                fetch(`${config.API_URL}/api/stats/hourly-activity`)
            ]);

            const summaryData = await summaryRes.json();
            const dailyData = await dailyRes.json();
            const hourlyD = await hourlyRes.json();

            setStats(summaryData);
            setDailyMessages(dailyData);
            setHourlyData(hourlyD);
            setRefreshKey(prev => prev + 1);
            setLoading(false);
        } catch (err) {
            console.error('Erreur stats:', err);
            setLoading(false);
        } finally {
            setTimeout(() => setRefreshing(false), 600);
        }
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        fetchStats(newPeriod);
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { navigate('/login'); return; }
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') { navigate('/inbox'); return; }

        fetchStats();
        const socket = io(`${config.API_URL}`);
        socket.emit('register_agent', { agentId: user.id });
        socket.on('visitor_list', (list) => {
            setStats(prev => ({ ...prev, onlineVisitors: list.length }));
        });
        const interval = setInterval(fetchStats, 60000);
        return () => { socket.disconnect(); clearInterval(interval); };
    }, [navigate]);

    const formatTime = (seconds) => {
        if (!seconds || seconds <= 0) return '---';
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
    };

    const conversionRate = useMemo(() => {
        if (!stats.totalConversations || !stats.totalClicks) return 0;
        // Standard formula: (Convs / Clicks) * 100
        const rate = (stats.totalConversations / stats.totalClicks) * 100;
        return Math.min(rate, 100).toFixed(1);
    }, [stats]);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fcfcfd' }}>
            <DashboardNavbar />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <nav style={{ width: '64px', backgroundColor: COLORS.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: '24px', zIndex: 10 }}>
                    <div onClick={() => navigate('/dashboard')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Dashboard"><Monitor size={20} /></div>
                    <div onClick={() => navigate('/monitoring')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Monitoring"><Users size={20} /></div>
                    <div onClick={() => navigate('/reports')} style={{ color: 'white', opacity: 1, cursor: 'pointer', borderLeft: `3px solid ${COLORS.primary}`, paddingLeft: '11px', marginLeft: '-11px' }} title="Reports"><TrendingUp size={20} /></div>
                    <div onClick={() => navigate('/personnel')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Personnel"><Shield size={20} /></div>
                    <div onClick={() => navigate('/inbox')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Inbox"><MessageSquare size={20} /></div>
                </nav>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '32px', fontWeight: '900', color: COLORS.dark, letterSpacing: '-0.035em' }}>Performance & Intelligence</h1>
                            <p style={{ color: COLORS.gray, fontSize: '15px', marginTop: '4px', fontWeight: '500' }}>Analysez l'efficacité de votre service client en temps réel.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                {[
                                    { id: '7d', label: 'Semaine' },
                                    { id: '30d', label: 'Mois' },
                                    { id: '1y', label: 'Année' },
                                    { id: 'all', label: 'Tout' }
                                ].map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handlePeriodChange(p.id)}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            backgroundColor: period === p.id ? 'white' : 'transparent',
                                            color: period === p.id ? COLORS.dark : COLORS.gray,
                                            fontWeight: '700',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            boxShadow: period === p.id ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => fetchStats()}
                                disabled={refreshing}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
                                    backgroundColor: COLORS.white, border: '1px solid #e2e8f0', borderRadius: '16px',
                                    fontWeight: '700', cursor: refreshing ? 'not-allowed' : 'pointer', color: COLORS.dark,
                                    transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                <motion.div animate={refreshing ? { rotate: 360 } : { rotate: 0 }} transition={refreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0.5 }}>
                                    <RefreshCcw size={18} />
                                </motion.div>
                                {refreshing ? 'Sync...' : 'Actualiser'}
                            </button>
                        </div>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                        <MetricCard
                            title="Visiteurs Live"
                            value={stats.onlineVisitors}
                            icon={Activity}
                            color={COLORS.primary}
                            subtitle="Clients actuellement sur le site"
                            trend={+12}
                        />
                        <MetricCard
                            title="Taux de Conversion"
                            value={`${conversionRate}%`}
                            icon={Target}
                            color={COLORS.secondary}
                            subtitle="Clics vs Conversations"
                            trend={+5}
                        />
                        <MetricCard
                            title="Réponse Moyenne"
                            value={formatTime(stats.avgResponseTime)}
                            icon={Clock}
                            color={COLORS.accent}
                            subtitle="Délai du premier message agent"
                        />
                        <MetricCard
                            title="Conversations"
                            value={stats.totalConversations}
                            icon={MessageSquare}
                            color={COLORS.dark}
                            subtitle="Total des discussions actives"
                            trend={+8}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                        <MessageChart data={dailyMessages} refreshKey={refreshKey} period={period} />
                        <HourlyActivityChart data={hourlyData} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Reports;
