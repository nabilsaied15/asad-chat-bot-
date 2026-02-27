import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Inbox from './pages/Inbox';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import Personnel from './pages/Personnel';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import QuickReplies from './pages/QuickReplies';
import ChatbotConfig from './pages/ChatbotConfig';
import Archives from './pages/Archives';
import Contacts from './pages/Contacts';


const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  return user ? children : <Navigate to="/login" />;
};

const HomePage = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <Features />
      <Pricing />
    </main>
    <footer style={{ padding: '80px 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800', fontSize: '28px', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: 'var(--primary)', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>a.</div>
          asad.to
        </div>
        <p style={{ color: 'var(--text-muted)' }}>&copy; 2026 asad.to (Bourg-la-Reine). All rights reserved.</p>
      </div>
    </footer>
  </>
);

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Private Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/inbox" element={<PrivateRoute><Inbox /></PrivateRoute>} />
            <Route path="/monitoring" element={<PrivateRoute><Monitoring /></PrivateRoute>} />
            <Route path="/personnel" element={<PrivateRoute><Personnel /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/quick-replies" element={<PrivateRoute><QuickReplies /></PrivateRoute>} />
            <Route path="/chatbot" element={<PrivateRoute><ChatbotConfig /></PrivateRoute>} />
            <Route path="/archives" element={<PrivateRoute><Archives /></PrivateRoute>} />
            <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />


            {/* Catch all redirect to home or login */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
