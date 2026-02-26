import config from '../config';

const Login = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${config.API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/dashboard');
            } else {
                setError(data.error || 'Erreur de connexion');
            }
        } catch (err) {
            setError('Erreur serveur');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            padding: '24px'
        }}>
            <Link to="/" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800', fontSize: '28px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: 'var(--primary)', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>a.</div>
                asad.to
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    backgroundColor: 'white',
                    padding: '48px',
                    borderRadius: '24px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    width: '100%',
                    maxWidth: '440px'
                }}
            >
                <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>{t.auth.signIn}</h1>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>{t.auth.enterDetails}</p>

                {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#4b5563' }}>{t.auth.email}</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. nabil@example.com"
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '15px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>{t.auth.password}</label>
                            <a href="#" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>{t.auth.forgot}</a>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '15px' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', marginBottom: '24px' }}>
                        {t.auth.signIn}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }}></div>
                        <span style={{ fontSize: '14px', color: '#9ca3af' }}>or</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }}></div>
                    </div>

                    <button type="button" style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        fontWeight: '600',
                        fontSize: '15px'
                    }}>
                        <img src="https://www.google.com/favicon.ico" alt="google" style={{ width: '18px' }} />
                        {t.auth.google}
                    </button>
                </form>

                <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '15px', color: 'var(--text-muted)' }}>
                    {t.auth.new} <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '600' }}>{t.auth.signUp}</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
