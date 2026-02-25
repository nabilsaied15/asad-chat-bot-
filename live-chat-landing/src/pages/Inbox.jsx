import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Search,
    MoreVertical,
    Maximize2,
    Paperclip,
    Smile,
    Send
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import DashboardNavbar from '../components/DashboardNavbar';

const InboxPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [selectedChat, setSelectedChat] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const socketRef = useRef();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }

        fetchConversations();

        // Connect to socket as agent
        socketRef.current = io('http://localhost:3000');
        socketRef.current.emit('register_agent', { agentId: JSON.parse(user).id });

        socketRef.current.on('visitor_message', (data) => {
            fetchConversations();
            if (selectedChat && selectedChat.visitor_id === data.visitorId) {
                setMessages(prev => [...prev, { sender: 'visitor', text: data.text, timestamp: Date.now() }]);
            }
        });

        return () => socketRef.current.disconnect();
    }, [navigate, selectedChat]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/conversations');
            const data = await res.json();
            setConversations(data);
        } catch (err) {
            console.error('Failed to fetch conversations');
        }
    };

    const fetchMessages = async (conv) => {
        try {
            const res = await fetch(`http://localhost:3000/api/conversations/${conv.id}/messages`);
            const data = await res.json();
            setMessages(data);
            setSelectedChat(conv);
        } catch (err) {
            console.error('Failed to fetch messages');
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

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardNavbar />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                {/* List Sidebar */}
                <aside style={{ width: '320px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>{t.inbox.title}</h2>
                        <div style={{ position: 'relative' }}>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '14px' }}>Visitor {conv.visitor_id ? conv.visitor_id.substring(0, 4) : '####'}</span>
                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                        {conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {conv.last_message || 'No messages yet'}
                                </p>
                            </div>
                        ))}
                        {conversations.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                                No active chats
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Chat */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
                    {selectedChat ? (
                        <>
                            <header style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#00b06b', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        V
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Visitor {selectedChat.visitor_id || 'Unknown'}</h3>
                                        <span style={{ fontSize: '12px', color: '#10b981' }}>● {t?.inbox?.online || 'Online'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', color: '#9ca3af' }}>
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
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={t.inbox.placeholder}
                                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                    />
                                    <button type="submit" style={{ backgroundColor: '#00b06b', color: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Send size={20} />
                                    </button>
                                </form>
                            </footer>
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
            </div>
        </div>
    );
};

export default InboxPage;
