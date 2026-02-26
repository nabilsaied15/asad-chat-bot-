import config from '../config';

const MessageChart = ({ data, refreshKey }) => {
    // Transformer les données pour avoir exactement 7 jours, même si 0 messages
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStr = date.toISOString().split('T')[0];
            const existing = data.find(d => d.day === dayStr);
            days.push({
                day: dayStr,
                visitorCount: existing ? (existing.visitor_count || 0) : 0,
                agentCount: existing ? (existing.agent_count || 0) : 0,
                label: date.toLocaleDateString('fr-FR', { weekday: 'short' })
            });
        }
        return days;
    };

    const weekData = getLast7Days();
    const maxCount = Math.max(...weekData.map(d => Math.max(d.visitorCount, d.agentCount)), 5);

    return (
        <motion.div
            key={refreshKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>Volume des messages (7 jours)</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>Activité comparative Visiteurs vs Equipe.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#111827' }}></div>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Visiteurs</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#00b06b' }}></div>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Equipe</span>
                    </div>
                </div>
            </div>

            <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '20px', paddingBottom: '20px' }}>
                {weekData.map((item, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%', gap: '4px' }}>
                            {/* Visitor Bar */}
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: `${(item.visitorCount / maxCount) * 100}%`, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.1 }}
                                style={{
                                    width: '12px',
                                    backgroundColor: '#111827',
                                    borderRadius: '4px 4px 2px 2px',
                                    position: 'relative'
                                }}
                            >
                                {item.visitorCount > 0 && (
                                    <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: '800', color: '#111827' }}>
                                        {item.visitorCount}
                                    </div>
                                )}
                            </motion.div>

                            {/* Agent Bar */}
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: `${(item.agentCount / maxCount) * 100}%`, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.1 + 0.05 }}
                                style={{
                                    width: '12px',
                                    backgroundColor: '#00b06b',
                                    borderRadius: '4px 4px 2px 2px',
                                    position: 'relative'
                                }}
                            >
                                {item.agentCount > 0 && (
                                    <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: '800', color: '#00b06b' }}>
                                        {item.agentCount}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                        <span style={{
                            fontSize: '11px',
                            color: i === 6 ? '#111827' : '#9ca3af',
                            fontWeight: i === 6 ? '800' : '600',
                            textTransform: 'uppercase',
                            marginTop: '8px'
                        }}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const Reports = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalClicks: 0, onlineVisitors: 0, totalAgentMessages: 0 });
    const [dailyMessages, setDailyMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchStats = async () => {
        setRefreshing(true);
        try {
            const [summaryRes, dailyRes] = await Promise.all([
                fetch(`${config.API_URL}/api/stats/summary`),
                fetch(`${config.API_URL}/api/stats/messages-by-day`)
            ]);

            const summaryData = await summaryRes.json();
            const dailyData = await dailyRes.json();

            setStats(summaryData);
            setDailyMessages(dailyData);
            setRefreshKey(prev => prev + 1); // Trigger animation refresh
            setLoading(false);
        } catch (err) {
            console.error('Erreur stats:', err);
            setLoading(false);
        } finally {
            setTimeout(() => setRefreshing(false), 600); // Small delay for visual feedback
        }
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
            navigate('/inbox');
            return;
        }

        fetchStats();

        const socket = io(`${config.API_URL}`);
        socket.emit('register_agent', { agentId: user.id });

        socket.on('visitor_list', (list) => {
            setStats(prev => ({ ...prev, onlineVisitors: list.length }));
        });

        const interval = setInterval(fetchStats, 60000);

        return () => {
            socket.disconnect();
            clearInterval(interval);
        };
    }, [navigate]);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
            <DashboardNavbar />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <nav style={{ width: '64px', backgroundColor: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: '24px', zIndex: 10 }}>
                    <div onClick={() => navigate('/dashboard')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Dashboard"><Monitor size={20} /></div>
                    <div onClick={() => navigate('/monitoring')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Monitoring"><Users size={20} /></div>
                    <div onClick={() => navigate('/reports')} style={{ color: 'white', opacity: 1, cursor: 'pointer', borderLeft: '3px solid #00b06b', paddingLeft: '11px', marginLeft: '-11px' }} title="Reports"><TrendingUp size={20} /></div>
                    <div onClick={() => navigate('/personnel')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Personnel"><Shield size={20} /></div>
                    <div onClick={() => navigate('/inbox')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Inbox"><MessageSquare size={20} /></div>
                </nav>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em' }}>Intelligence & Rapports</h1>
                            <p style={{ color: '#6b7280', fontSize: '16px', marginTop: '4px' }}>L'activité de vos clients et de votre équipe.</p>
                        </div>
                        <button
                            onClick={fetchStats}
                            disabled={refreshing}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                backgroundColor: refreshing ? '#f3f4f6' : 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '14px',
                                fontWeight: '700',
                                cursor: refreshing ? 'not-allowed' : 'pointer',
                                color: '#111827',
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            <motion.div
                                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                                transition={refreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0.5 }}
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                <RefreshCcw size={18} />
                            </motion.div>
                            {refreshing ? 'Actualisation...' : 'Actualiser'}
                        </button>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                        {/* Stat Card 1: Online Visitors */}
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#00b06b15', color: '#00b06b', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={24} />
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#00b06b', backgroundColor: '#00b06b10', padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.05em' }}>EN DIRECT</span>
                            </div>
                            <h3 style={{ fontSize: '15px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>Visiteurs Actifs</h3>
                            <div style={{ fontSize: '38px', fontWeight: '900', color: '#111827' }}>{stats.onlineVisitors}</div>
                        </div>

                        {/* Stat Card 2: Total Clicks */}
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#3b82f615', color: '#3b82f6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MousePointer2 size={24} />
                                </div>
                                <div style={{ color: '#9ca3af' }}><ArrowUpRight size={20} /></div>
                            </div>
                            <h3 style={{ fontSize: '15px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>Clics Conversion</h3>
                            <div style={{ fontSize: '38px', fontWeight: '900', color: '#111827' }}>{stats.totalClicks}</div>
                        </div>

                        {/* Stat Card 3: Received Messages Today */}
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#6b728015', color: '#111827', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageSquare size={24} />
                                </div>
                                <Calendar size={18} style={{ color: '#9ca3af' }} />
                            </div>
                            <h3 style={{ fontSize: '15px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>Messages Reçus</h3>
                            <div style={{ fontSize: '38px', fontWeight: '900', color: '#111827' }}>
                                {dailyMessages.length > 0 && dailyMessages[dailyMessages.length - 1].day === new Date().toISOString().split('T')[0]
                                    ? dailyMessages[dailyMessages.length - 1].visitor_count
                                    : 0}
                            </div>
                        </div>

                        {/* Stat Card 4: Sent Messages Total */}
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#00b06b15', color: '#00b06b', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Send size={24} />
                                </div>
                                <Shield size={18} style={{ color: '#9ca3af' }} />
                            </div>
                            <h3 style={{ fontSize: '15px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>Messages Envoyés</h3>
                            <div style={{ fontSize: '38px', fontWeight: '900', color: '#111827' }}>{stats.totalAgentMessages}</div>
                        </div>

                        <div style={{ gridColumn: 'span 4' }}>
                            <MessageChart data={dailyMessages} refreshKey={refreshKey} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Reports;
