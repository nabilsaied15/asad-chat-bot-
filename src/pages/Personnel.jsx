import config from '../config';

const PersonnelPage = () => {
    const navigate = useNavigate();
    const [allAgents, setAllAgents] = useState([]);
    const [onlineAgentIds, setOnlineAgentIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const socketRef = useRef();

    const fetchAgents = () => {
        fetch(`${config.API_URL}/api/agents`)
            .then(res => res.json())
            .then(data => setAllAgents(data))
            .catch(err => console.error("Erreur chargement agents:", err));
    };

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(user);

        if (userData.role && userData.role !== 'admin') {
            navigate('/inbox');
            return;
        }

        fetchAgents();

        // Connect to socket as agent
        socketRef.current = io(`${config.API_URL}`);

        socketRef.current.on('agent_list', (list) => {
            const ids = list.map(a => a.agentId);
            setOnlineAgentIds(ids);
        });

        socketRef.current.emit('register_agent', {
            agentId: userData.id,
            name: userData.name,
            email: userData.email
        });

        return () => socketRef.current.disconnect();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });
        const url = editingAgent ? `${config.API_URL}/api/users/${editingAgent.id}` : `${config.API_URL}/api/users`;
        const method = editingAgent ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', msg: editingAgent ? 'Agent mis à jour !' : 'Agent ajouté !' });
                fetchAgents();
                setTimeout(() => {
                    setIsModalOpen(false);
                    setEditingAgent(null);
                    setFormData({ name: '', email: '', password: '', role: 'user' });
                    setStatus({ type: '', msg: '' });
                }, 1500);
            } else {
                setStatus({ type: 'error', msg: data.error || 'Une erreur est survenue' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Erreur serveur' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
        try {
            const res = await fetch(`${config.API_URL}/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchAgents();
            }
        } catch (err) {
            console.error('Erreur suppression:', err);
        }
    };

    const openEdit = (agent) => {
        setEditingAgent(agent);
        setFormData({ name: agent.name, email: agent.email, password: '', role: agent.role || 'user' });
        setIsModalOpen(true);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
            <DashboardNavbar />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Rail (Navigation) */}
                <nav style={{ width: '64px', backgroundColor: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '20px', zIndex: 10 }}>
                    {JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                        <>
                            <div onClick={() => navigate('/dashboard')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Dashboard"><Monitor size={24} /></div>
                            <div onClick={() => navigate('/monitoring')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Monitoring"><Users size={24} /></div>
                            <div onClick={() => navigate('/reports')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Reports"><Activity size={24} /></div>
                            <div onClick={() => navigate('/personnel')} style={{ color: 'white', opacity: 1, cursor: 'pointer', borderLeft: '3px solid #00b06b', paddingLeft: '11px', marginLeft: '-11px' }} title="Personnel"><Shield size={24} /></div>
                        </>
                    )}
                    <div onClick={() => navigate('/inbox')} style={{ color: 'white', opacity: 0.6, cursor: 'pointer' }} title="Inbox"><MessageCircle size={24} /></div>
                </nav>

                {/* Main Content */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <header style={{ padding: '24px 32px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>Personnel asad.to</h1>
                            <p style={{ color: '#6b7280', marginTop: '4px' }}>Membres de l'équipe enregistrés dans le système.</p>
                        </div>
                        <button
                            onClick={() => { setEditingAgent(null); setFormData({ name: '', email: '', password: '', role: 'user' }); setIsModalOpen(true); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#00b06b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Plus size={18} /> Ajouter un membre
                        </button>
                    </header>

                    <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <tr>
                                        <th style={{ padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Membre</th>
                                        <th style={{ padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Rôle</th>
                                        <th style={{ padding: '16px 24px', fontWeight: '600', color: '#374151' }}>Statut</th>
                                        <th style={{ padding: '16px 24px', fontWeight: '600', color: '#374151', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allAgents.map(a => {
                                        const isOnline = onlineAgentIds.includes(a.id);
                                        return (
                                            <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: isOnline ? '#00b06b15' : '#f3f4f6', color: isOnline ? '#00b06b' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                                                            {a.name ? a.name.charAt(0).toUpperCase() : 'A'}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '600', color: '#111827' }}>{a.name}</div>
                                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{a.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        textTransform: 'uppercase',
                                                        backgroundColor: a.role === 'admin' ? '#00b06b15' : '#f3f4f6',
                                                        color: a.role === 'admin' ? '#00b06b' : '#6b7280',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        fontWeight: '700',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {a.role || 'user'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? '#10b981' : '#d1d5db' }}></div>
                                                        <span style={{ fontSize: '14px', color: isOnline ? '#059669' : '#6b7280', fontWeight: '600' }}>
                                                            {isOnline ? 'En ligne' : 'Hors ligne'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button onClick={() => openEdit(a)} style={{ padding: '8px', color: '#3b82f6', backgroundColor: '#eff6ff', border: 'none', borderRadius: '8px', cursor: 'pointer' }} title="Modifier"><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete(a.id)} style={{ padding: '8px', color: '#ef4444', backgroundColor: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer' }} title="Supprimer"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {allAgents.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                                                Aucun membre trouvé.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* User Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
                    <div style={{ position: 'relative', backgroundColor: 'white', width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: '24px', top: '24px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>{editingAgent ? 'Modifier membre' : 'Ajouter un membre'}</h2>
                        <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '14px' }}>Veuillez remplir les informations suivantes.</p>

                        {status.msg && (
                            <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', backgroundColor: status.type === 'success' ? '#f0fdf4' : '#fef2f2', color: status.type === 'success' ? '#10b981' : '#ef4444' }}>
                                {status.msg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Nom complet</label>
                                <div style={{ position: 'relative' }}>
                                    <UserIcon size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px' }} placeholder="Nom de l'agent" />
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Email</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px' }} placeholder="email@exemple.com" />
                                </div>
                            </div>
                            {!editingAgent && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Mot de passe</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                        <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px' }} placeholder="••••••••" />
                                    </div>
                                </div>
                            )}
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Rôle</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px', backgroundColor: 'white' }}>
                                    <option value="user">Utilisateur (User)</option>
                                    <option value="admin">Administrateur (Admin)</option>
                                </select>
                            </div>

                            <button type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#00b06b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                <Save size={18} /> {editingAgent ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonnelPage;
