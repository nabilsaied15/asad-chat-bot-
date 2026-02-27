import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Search,
    MoreVertical,
    Send,
    Bell,
    BellOff,
    Monitor,
    Users,
    Shield,
    Maximize2,
    Paperclip,
    Smile,
    Activity,
    Trash2,
    RotateCcw,
    Archive
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import DashboardNavbar from '../components/DashboardNavbar';
import LeftNav from '../components/LeftNav';
import config from '../config';


const InboxPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [selectedChat, setSelectedChat] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [statusFilter, setStatusFilter] = useState('open'); // 'open' or 'deleted'
    const [quickReplies, setQuickReplies] = useState([]);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }

        // Request Browser Notification Permission
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        fetchConversations();
        fetchQuickReplies();

        // Connect to socket as agent
        socketRef.current = io(`${config.API_URL}`, {
            transports: ['polling', 'websocket']
        });
        socketRef.current.emit('register_agent', { agentId: JSON.parse(user).id });

        socketRef.current.on('visitor_message', (data) => {
            fetchConversations();

            if (selectedChat && selectedChat.visitor_id === data.visitorId) {
                setMessages(prev => [...prev, { sender: 'visitor', text: data.text, timestamp: Date.now() }]);
            }
        });

        return () => socketRef.current.disconnect();
    }, [navigate, selectedChat, statusFilter]);

    // Handle Deep Linking from Notifications or Archives
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const vid = params.get('visitorId');
        if (vid) {
            const target = conversations.find(c => c.visitor_id === vid);
            if (target) {
                if (!selectedChat || selectedChat.id !== target.id) {
                    fetchMessages(target);
                }
            } else if (loading === false) {
                // If not found in current list (maybe because of status filter), we could fetch it specifically
                fetchConversationByVisitorId(vid);
            }
        }
    }, [conversations, window.location.search]);

    const fetchConversationByVisitorId = async (vid) => {
        try {
            const res = await fetch(`${config.API_URL}/api/conversations?visitorId=${vid}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                fetchMessages(data[0]);
            }
        } catch (err) {
            console.error('Failed to fetch specific conversation');
        }
    };

    const fetchQuickReplies = async () => {
        try {
            const res = await fetch(`${config.API_URL}/api/quick-replies`);
            const data = await res.json();
            setQuickReplies(data);
        } catch (err) {
            console.error('Failed to fetch quick replies');
        }
    };

    const fetchConversations = async () => {
        try {
            // On récupère toutes les conversations (sauf deleted) au lieu de filtrer par l'état local
            const res = await fetch(`${config.API_URL}/api/conversations?status=all`);
            const data = await res.json();
            setConversations(data);
        } catch (err) {
            console.error('Failed to fetch conversations');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conv) => {
        try {
            const res = await fetch(`${config.API_URL}/api/conversations/${conv.id}/messages`);
            const data = await res.json();
            setMessages(data);
            setSelectedChat(conv);

            // Marquer comme lu
            markAsRead(conv.id);
        } catch (err) {
            console.error('Failed to fetch messages');
        }
    };

    const markAsRead = async (id) => {
        try {
            await fetch(`${config.API_URL}/api/conversations/${id}/read`, { method: 'PUT' });
            fetchConversations(); // Rafraîchir les compteurs
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const toggleMute = async () => {
        if (!selectedChat) return;
        try {
            const res = await fetch(`${config.API_URL}/api/conversations/${selectedChat.id}/mute`, { method: 'PUT' });
            const data = await res.json();
            setSelectedChat(prev => ({ ...prev, is_muted: data.is_muted }));
            fetchConversations();
        } catch (err) {
            console.error('Failed to toggle mute');
        }
    };

    const handleSend = () => {
        if (!inputValue.trim() || !selectedChat) return;

        const messageData = {
            visitorId: selectedChat.visitor_id,
            text: inputValue,
            isAgent: true
        };

        socketRef.current.emit('agent_message', messageData);
        setMessages(prev => [...prev, { sender: 'agent', text: inputValue, timestamp: Date.now() }]);
        setInputValue('');
        fetchConversations(); // Update last message
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);

        // Check for quick replies shortcuts (e.g., "/thanks ")
        const match = val.match(/^\/(\w+)$/);
        // We'll look for an exact match + a trailing space or enter in a more advanced way, 
        // but for now, let's keep it simple: if the value matches a shortcut exactly, 
        // and we have a corresponding reply, let's offer it or replace it.
        // Actually, let's trigger it on space.
        if (val.endsWith(' ')) {
            const parts = val.trim().split(' ');
            const lastWord = parts[parts.length - 1];
            if (lastWord.startsWith('/')) {
                const reply = quickReplies.find(r => r.shortcut === lastWord);
                if (reply) {
                    const newVal = val.replace(lastWord + ' ', reply.text + ' ');
                    setInputValue(newVal);
                }
            }
        }
    };

    const updateStatus = async (newStatus) => {
        if (!selectedChat) return;
        try {
            const res = await fetch(`${config.API_URL}/api/conversations/${selectedChat.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setSelectedChat(prev => ({ ...prev, status: newStatus }));
                fetchConversations();
                setShowStatusMenu(false);
            }
        } catch (err) {
            console.error('Failed to update status');
        }
    };

    const deleteConversation = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cette conversation et l'envoyer à la corbeille ?")) return;
        try {
            await fetch(`${config.API_URL}/api/conversations/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'deleted' })
            });
            setSelectedChat(null);
            fetchConversations();
        } catch (err) {
            console.error('Failed to delete');
        }
    };

    const restoreConversation = async (id) => {
        try {
            await fetch(`${config.API_URL}/api/conversations/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'open' })
            });
            setSelectedChat(null);
            fetchConversations();
        } catch (err) {
            console.error('Failed to restore');
        }
    };

    const permanentDelete = async (id) => {
        if (!window.confirm("ATTENTION : Cette action est irréversible. Toutes les données de la conversation seront perdues.")) return;
        try {
            await fetch(`${config.API_URL}/api/conversations/${id}`, { method: 'DELETE' });
            setSelectedChat(null);
            fetchConversations();
        } catch (err) {
            console.error('Failed to delete permanently');
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardNavbar />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                <LeftNav
                    activePage="/inbox"
                    bottomSection={
                        <div
                            onClick={() => { setStatusFilter(prev => prev === 'deleted' ? 'open' : 'deleted'); setSelectedChat(null); }}
                            style={{
                                color: 'white',
                                opacity: statusFilter === 'deleted' ? 1 : 0.6,
                                cursor: 'pointer',
                                borderLeft: statusFilter === 'deleted' ? '3px solid #ef4444' : 'none',
                                paddingLeft: statusFilter === 'deleted' ? '11px' : '0',
                                marginLeft: statusFilter === 'deleted' ? '-11px' : '0',
                                display: 'flex',
                                justifyContent: 'center'
                            }}
                            title="Trash (Corbeille)"
                        >
                            <Trash2 size={24} />
                        </div>
                    }
                />

                {/* List Sidebar */}

                <aside style={{ width: '320px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>{t.inbox.title}</h2>
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="text"
                                placeholder={t.inbox.search}
                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', backgroundColor: '#f9fafb' }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => fetchMessages(conv)}
                                style={{
                                    padding: '16px 24px',
                                    borderBottom: '1px solid #f3f4f6',
                                    cursor: 'pointer',
                                    backgroundColor: selectedChat?.id === conv.id ? '#f0f9f4' : 'transparent',
                                    borderLeft: selectedChat?.id === conv.id ? '4px solid #00b06b' : '4px solid transparent'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: '700', fontSize: '14px' }}>
                                            {conv.first_name ? `${conv.first_name} ${conv.last_name || ''}` : `Visitor ${conv.visitor_id ? conv.visitor_id.substring(0, 4) : '####'}`}
                                        </span>
                                        <span style={{
                                            fontSize: '9px',
                                            padding: '1px 6px',
                                            borderRadius: '10px',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            backgroundColor: conv.status === 'resolved' ? '#dcfce7' :
                                                conv.status === 'pending' ? '#fef3c7' :
                                                    conv.status === 'abandoned' ? '#fee2e2' : '#dbeafe',
                                            color: conv.status === 'resolved' ? '#166534' :
                                                conv.status === 'pending' ? '#92400e' :
                                                    conv.status === 'abandoned' ? '#991b1b' : '#1e40af',
                                        }}>
                                            {conv.status === 'resolved' ? 'Résolu' :
                                                conv.status === 'pending' ? 'En attente' :
                                                    conv.status === 'abandoned' ? 'Abandonné' : 'En cours'}
                                        </span>
                                        {conv.is_muted && <BellOff size={12} style={{ color: '#9ca3af' }} />}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {statusFilter === 'open' ? (
                                            <Trash2
                                                size={14}
                                                style={{ color: '#9ca3af', cursor: 'pointer' }}
                                                onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                                                title="Mettre à la corbeille"
                                            />
                                        ) : (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <RotateCcw
                                                    size={14}
                                                    style={{ color: '#00b06b', cursor: 'pointer' }}
                                                    onClick={(e) => { e.stopPropagation(); restoreConversation(conv.id); }}
                                                    title="Restaurer"
                                                />
                                                <Archive
                                                    size={14}
                                                    style={{ color: '#ef4444', cursor: 'pointer' }}
                                                    onClick={(e) => { e.stopPropagation(); permanentDelete(conv.id); }}
                                                    title="Supprimer définitivement"
                                                />
                                            </div>
                                        )}
                                        {conv.unread_count > 0 && (
                                            <span style={{
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                fontSize: '10px',
                                                padding: '2px 6px',
                                                borderRadius: '10px',
                                                fontWeight: 'bold'
                                            }}>
                                                {conv.unread_count}
                                            </span>
                                        )}
                                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                            {conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {conv.last_message || 'No messages yet'}
                                </p>
                            </div>
                        ))}
                        {conversations.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                                {statusFilter === 'open' ? 'Aucune conversation active' : 'La corbeille est vide'}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Chat Area (Chat + Details) */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'row', backgroundColor: 'white' }}>
                    {selectedChat ? (
                        <>
                            {/* Central Chat Area */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e7eb' }}>
                                <header style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', backgroundColor: '#00b06b', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {selectedChat.first_name ? selectedChat.first_name[0].toUpperCase() : 'V'}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
                                                {selectedChat.first_name ? `${selectedChat.first_name} ${selectedChat.last_name || ''}` : `Visitor ${selectedChat.visitor_id}`}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <span
                                                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                                                        style={{
                                                            fontSize: '11px',
                                                            backgroundColor: selectedChat.status === 'resolved' ? '#dcfce7' :
                                                                selectedChat.status === 'pending' ? '#fef3c7' : '#dbeafe',
                                                            color: selectedChat.status === 'resolved' ? '#166534' :
                                                                selectedChat.status === 'pending' ? '#92400e' : '#1e40af',
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            textTransform: 'uppercase',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '8px' }}>●</span> {
                                                            selectedChat.status === 'resolved' ? 'Résolu' :
                                                                selectedChat.status === 'pending' ? 'En attente' : 'En cours'
                                                        }
                                                    </span>
                                                    {showStatusMenu && (
                                                        <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '12px', zIndex: 100, padding: '8px', minWidth: '150px', marginTop: '8px', border: '1px solid #e5e7eb' }}>
                                                            {[
                                                                { id: 'open', label: 'En cours', color: '#1e40af', bg: '#dbeafe' },
                                                                { id: 'resolved', label: 'Résolu', color: '#166534', bg: '#dcfce7' },
                                                                { id: 'pending', label: 'En attente', color: '#92400e', bg: '#fef3c7' }
                                                            ].map(s => (
                                                                <div
                                                                    key={s.id}
                                                                    onClick={() => {
                                                                        updateStatus(s.id);
                                                                        setShowStatusMenu(false);
                                                                    }}
                                                                    style={{
                                                                        padding: '8px 12px',
                                                                        fontSize: '13px',
                                                                        color: '#374151',
                                                                        cursor: 'pointer',
                                                                        borderRadius: '8px',
                                                                        backgroundColor: selectedChat.status === s.id ? '#f9fafb' : 'transparent',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                                                    onMouseLeave={(e) => e.target.style.backgroundColor = selectedChat.status === s.id ? '#f9fafb' : 'transparent'}
                                                                >
                                                                    <span style={{ color: s.color }}>●</span> {s.label}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {selectedChat.whatsapp && (
                                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>📱 {selectedChat.whatsapp}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', color: '#9ca3af' }}>
                                        <button
                                            onClick={toggleMute}
                                            title={selectedChat.is_muted ? "Rétablir les sons" : "Mettre en sourdine"}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: selectedChat.is_muted ? '#ef4444' : '#9ca3af', display: 'flex', alignItems: 'center' }}
                                        >
                                            {selectedChat.is_muted ? <BellOff size={20} /> : <Bell size={20} />}
                                        </button>
                                        {statusFilter === 'open' ? (
                                            <Trash2
                                                size={20}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => deleteConversation(selectedChat.id)}
                                                title="Mettre à la corbeille"
                                            />
                                        ) : (
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <RotateCcw
                                                    size={20}
                                                    style={{ cursor: 'pointer', color: '#00b06b' }}
                                                    onClick={() => restoreConversation(selectedChat.id)}
                                                    title="Restaurer"
                                                />
                                                <Archive
                                                    size={20}
                                                    style={{ cursor: 'pointer', color: '#ef4444' }}
                                                    onClick={() => permanentDelete(selectedChat.id)}
                                                    title="Supprimer définitivement"
                                                />
                                            </div>
                                        )}
                                        <Maximize2 size={20} />
                                        <MoreVertical size={20} />
                                    </div>
                                </header>

                                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {messages.map((msg, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    alignSelf: msg.sender === 'agent' ? 'flex-end' : 'flex-start',
                                                    maxWidth: '70%',
                                                    backgroundColor: msg.sender === 'agent' ? '#00b06b' : 'white',
                                                    color: msg.sender === 'agent' ? 'white' : 'inherit',
                                                    padding: '12px 16px',
                                                    borderRadius: msg.sender === 'agent' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                {msg.text}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <footer style={{ padding: '20px 24px', borderTop: '1px solid #e5e7eb' }}>
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                        style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}
                                    >
                                        <div style={{ display: 'flex', gap: '12px', color: '#9ca3af' }}>
                                            <Paperclip size={20} />
                                            <Smile size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={handleInputChange}
                                            placeholder={statusFilter === 'deleted' ? "Inactif (Corbeille)" : "Tapez votre message ou / pour un raccourci..."}
                                            disabled={statusFilter === 'deleted'}
                                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', backgroundColor: statusFilter === 'deleted' ? '#f3f4f6' : 'white' }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={statusFilter === 'deleted'}
                                            style={{ backgroundColor: statusFilter === 'deleted' ? '#9ca3af' : '#00b06b', color: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: statusFilter === 'deleted' ? 'not-allowed' : 'pointer' }}
                                        >
                                            <Send size={20} />
                                        </button>
                                    </form>
                                </footer>
                            </div>

                            {/* Visitor Details Panel */}
                            <aside style={{ width: '280px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', padding: '24px' }}>
                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    <div style={{ width: '64px', height: '64px', backgroundColor: '#f3f4f6', borderRadius: '50%', color: '#00b06b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto 12px' }}>
                                        {selectedChat.first_name ? selectedChat.first_name[0].toUpperCase() : 'V'}
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                                        {selectedChat.first_name ? `${selectedChat.first_name} ${selectedChat.last_name || ''}` : 'Visitor'}
                                    </h3>
                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>ID: {selectedChat.visitor_id}</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                                        <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>WhatsApp</label>
                                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                                            {selectedChat.whatsapp ? (
                                                <a href={`https://wa.me/${selectedChat.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#00b06b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    📱 {selectedChat.whatsapp}
                                                </a>
                                            ) : (
                                                <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Non renseigné</span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                                        <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Demande initiale</label>
                                        <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#374151', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                            {selectedChat.problem ? selectedChat.problem : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Aucune description fournie</span>}
                                        </div>
                                    </div>

                                    <div style={{ mt: 'auto', paddingTop: '20px' }}>
                                        <button
                                            onClick={() => window.open(`https://wa.me/${selectedChat.whatsapp?.replace(/[^0-9]/g, '')}`, '_blank')}
                                            disabled={!selectedChat.whatsapp}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #00b06b', color: '#00b06b', backgroundColor: 'transparent', fontWeight: '600', cursor: selectedChat.whatsapp ? 'pointer' : 'not-allowed', opacity: selectedChat.whatsapp ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            Ouvrir sur WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </aside>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9ca3af' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: '#f3f4f6', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                <MessageSquare size={40} />
                            </div>
                            <h3>{t.inbox.select}</h3>
                        </div>
                    )}
                </main>
            </div >
        </div >
    );
};

export default InboxPage;
