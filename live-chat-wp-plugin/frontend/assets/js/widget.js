document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('nlc-widget-container');
    if (!container) return;

    // Use nlc_config if available, else defaults
    const primaryColor = (typeof nlc_config !== 'undefined' && nlc_config.primary_color) || '#00b06b';
    const serverUrl = (typeof nlc_config !== 'undefined' && nlc_config.server_url) || 'http://localhost:3000';

    // Detect Language
    const lang = document.documentElement.lang.startsWith('en') ? 'en' : 'fr';
    const t = {
        fr: {
            title: "Support asad.to",
            welcome: "Bonjour ! Comment pouvons-nous vous aider ?",
            placeholder: "Écrivez un message...",
            send: "Envoyer",
            poweredBy: "Propulsé par asad.to"
        },
        en: {
            title: "asad.to Support",
            welcome: "Hello! How can we help you today?",
            placeholder: "Type a message...",
            send: "Send",
            poweredBy: "Powered by asad.to"
        }
    };

    const trans = t[lang];

    container.style.setProperty('--nlc-primary', primaryColor);

    container.innerHTML = `
        <div class="nlc-chat-window" id="nlc-chat-win">
            <div class="nlc-chat-header">
                <div style="display:flex; align-items:center; gap:10px">
                    <div style="width:32px;height:32px;background:white;border-radius:8px;color:var(--nlc-primary);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px">a.</div>
                    <div>
                        <h3 style="margin:0;font-size:16px;font-weight:700">${trans.title}</h3>
                        <span style="font-size:11px;opacity:0.8">● En ligne</span>
                    </div>
                </div>
            </div>
            <div class="nlc-chat-messages" id="nlc-msgs">
                <div class="nlc-message nlc-message-agent">${trans.welcome}</div>
            </div>
            <div class="nlc-chat-input-area">
                <input type="text" id="nlc-input" placeholder="${trans.placeholder}" autocomplete="off">
                <button id="nlc-send">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
            <div style="padding: 5px; text-align: center; font-size: 10px; color: #94a3b8; background: #fff; border-top: 1px solid #f1f5f9;">
                ${trans.poweredBy}
            </div>
        </div>
        <div class="nlc-chat-bubble" id="nlc-bubble">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1-1-2-2-2z"/></svg>
            <div class="nlc-notification-dot"></div>
        </div>
    `;

    const bubble = document.getElementById('nlc-bubble');
    const win = document.getElementById('nlc-chat-win');
    const input = document.getElementById('nlc-input');
    const msgs = document.getElementById('nlc-msgs');
    const send = document.getElementById('nlc-send');
    const dot = container.querySelector('.nlc-notification-dot');

    bubble.onclick = () => {
        win.classList.toggle('nlc-window-open');
        dot.style.display = 'none';
        if (win.classList.contains('nlc-window-open')) {
            setTimeout(() => input.focus(), 100);
        }
    };

    const visitorId = localStorage.getItem('nlc_vid') || 'vis_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('nlc_vid', visitorId);

    let socket = io(serverUrl);

    socket.on('connect', () => {
        socket.emit('register_visitor', {
            visitorId,
            url: window.location.href,
            title: document.title,
            browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Autre',
            os: navigator.userAgent.includes('Win') ? 'Windows' : 'Autre'
        });
    });

    socket.on('agent_message', (data) => {
        addMsg(data.text, 'agent');
        if (!win.classList.contains('nlc-window-open')) {
            dot.style.display = 'block';
        }
    });

    socket.on('chat_history', (history) => {
        if (history && history.length > 0) {
            msgs.innerHTML = ''; // Clear welcome if history exists
            history.forEach(msg => addMsg(msg.text, msg.sender === 'visitor' ? 'visitor' : 'agent'));
        }
    });

    socket.on('typing', (data) => {
        if (data.isAgent) showTyping(); else hideTyping();
    });

    function addMsg(text, sender) {
        hideTyping();
        const d = document.createElement('div');
        d.className = 'nlc-message nlc-message-' + sender;
        d.textContent = text;
        msgs.appendChild(d);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function showTyping() {
        if (document.getElementById('nlc-t')) return;
        const d = document.createElement('div');
        d.id = 'nlc-t'; d.className = 'nlc-typing';
        d.innerHTML = '<span></span><span></span><span></span>';
        msgs.appendChild(d);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function hideTyping() { const e = document.getElementById('nlc-t'); if (e) e.remove(); }

    function sendM() {
        const text = input.value.trim();
        if (!text) return;
        addMsg(text, 'visitor');
        socket.emit('visitor_message', { text, visitorId });
        input.value = '';
    }

    send.onclick = sendM;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendM(); };
});
