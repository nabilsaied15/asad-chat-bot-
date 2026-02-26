document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('nlc-widget-container');
    if (!container) return;

    // Configuration
    let primaryColor = (typeof nlc_config !== 'undefined' && nlc_config.primary_color) || '#00b06b';
    const serverUrl = (typeof nlc_config !== 'undefined' && nlc_config.server_url) || 'https://asad-chat-server.onrender.com';
    const siteKey = (typeof nlc_config !== 'undefined' && nlc_config.site_key) || '';
    let welcomeMsg = "";

    console.log("[asad.to] Widget Init. Server:", serverUrl, "Key:", siteKey);

    // Fetch dynamic settings if key exists
    async function loadDynamicSettings() {
        if (!siteKey) return;
        try {
            const res = await fetch(`${serverUrl}/api/public/settings/${siteKey}`);
            if (res.ok) {
                const data = await res.json();
                if (data.primary_color) {
                    primaryColor = data.primary_color;
                    container.style.setProperty('--nlc-primary', primaryColor);
                }
                if (data.welcome_message) {
                    welcomeMsg = data.welcome_message;
                    // Update the welcome message in the chat if it's currently the default
                    const firstMsg = document.querySelector('.nlc-message-agent');
                    if (firstMsg && (firstMsg.textContent === trans.fr.welcome || firstMsg.textContent === trans.en.welcome)) {
                        firstMsg.textContent = welcomeMsg;
                    }
                }
            }
        } catch (e) { console.error("[asad.to] Settings fetch error:", e); }
    }
    loadDynamicSettings();

    // Translations
    const lang = document.documentElement.lang.startsWith('en') ? 'en' : 'fr';
    const t = {
        fr: {
            title: "Support asad.to",
            welcome: "Bonjour ! Comment pouvons-nous vous aider ?",
            placeholder: "Écrivez un message...",
            send: "Envoyer",
            poweredBy: "Propulsé par asad.to",
            statusOnline: "● En ligne",
            statusConnecting: "○ Connexion...",
            statusOffline: "○ Déconnecté"
        },
        en: {
            title: "asad.to Support",
            welcome: "Hello! How can we help you today?",
            placeholder: "Type a message...",
            send: "Send",
            poweredBy: "Powered by asad.to",
            statusOnline: "● Online",
            statusConnecting: "○ Connecting...",
            statusOffline: "○ Offline"
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
                        <span id="nlc-status" style="font-size:11px;opacity:0.8">${trans.statusConnecting}</span>
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
    const statusEl = document.getElementById('nlc-status');
    const dot = container.querySelector('.nlc-notification-dot');

    function trackEvent(type) {
        fetch(`${serverUrl}/api/stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_type: type, visitor_id: visitorId })
        }).catch(e => console.error("[asad.to] Track error:", e));
    }

    bubble.onclick = () => {
        trackEvent('site_click');
        win.classList.toggle('nlc-window-open');
        dot.style.display = 'none';
        if (win.classList.contains('nlc-window-open')) {
            if (!socket) checkPreChat();
            setTimeout(() => input.focus(), 100);
        }
    };

    const visitorId = localStorage.getItem('nlc_vid') || 'vis_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('nlc_vid', visitorId);

    // Pre-chat form logic
    function checkPreChat() {
        const userInfo = localStorage.getItem('nlc_user_info');
        if (!userInfo) {
            showPreChatForm();
        } else {
            initSocket(JSON.parse(userInfo));
        }
    }

    function showPreChatForm() {
        statusEl.textContent = "";

        const overlay = document.createElement('div');
        overlay.className = 'nlc-prechat-overlay';
        overlay.id = 'nlc-prechat';
        overlay.innerHTML = `
            <h4>${lang === 'fr' ? 'Bienvenue !' : 'Welcome!'}</h4>
            <p>${lang === 'fr' ? 'Avez-vous WhatsApp ?' : 'Do you have WhatsApp?'}</p>
            <div class="nlc-choice-group">
                <button class="nlc-btn-choice" id="nlc-choice-yes">${lang === 'fr' ? 'Oui' : 'Yes'}</button>
                <button class="nlc-btn-choice" id="nlc-choice-no">${lang === 'fr' ? 'Non' : 'No'}</button>
            </div>
        `;
        win.appendChild(overlay);

        document.getElementById('nlc-choice-yes').onclick = () => showFullForm(overlay);
        document.getElementById('nlc-choice-no').onclick = () => showPhoneOnlyForm(overlay);
    }

    function showFullForm(overlay) {
        overlay.innerHTML = `
            <h4>${lang === 'fr' ? 'Super !' : 'Great!'}</h4>
            <p>${lang === 'fr' ? 'Merci de remplir ce formulaire pour commencer.' : 'Please fill this form to start.'}</p>
            
            <div class="nlc-field">
                <label>${lang === 'fr' ? 'Prénom' : 'First Name'}</label>
                <input type="text" id="p-fname" placeholder="Ex: Jean" required>
            </div>
            <div class="nlc-field">
                <label>${lang === 'fr' ? 'Nom' : 'Last Name'}</label>
                <input type="text" id="p-lname" placeholder="Ex: Dupont" required>
            </div>
            <div class="nlc-field">
                <label>${lang === 'fr' ? 'WhatsApp' : 'WhatsApp Number'}</label>
                <input type="text" id="p-wa" placeholder="Ex: +33..." required>
            </div>
            <div class="nlc-field">
                <label>${lang === 'fr' ? 'Que pouvons-nous faire pour vous ?' : 'How can we help you?'}</label>
                <textarea id="p-req" rows="2" placeholder="..."></textarea>
            </div>
            <button class="nlc-btn-start" id="nlc-start-chat">${lang === 'fr' ? 'Démarrer la discussion' : 'Start Chat'}</button>
        `;

        document.getElementById('nlc-start-chat').onclick = () => {
            const fname = document.getElementById('p-fname').value.trim();
            const lname = document.getElementById('p-lname').value.trim();
            const wa = document.getElementById('p-wa').value.trim();
            const req = document.getElementById('p-req').value.trim();

            if (!fname || !lname || !wa) return alert(lang === 'fr' ? "Merci de remplir les champs obligatoires." : "Please fill required fields.");

            const info = { firstName: fname, lastName: lname, whatsapp: wa, problem: req };
            localStorage.setItem('nlc_user_info', JSON.stringify(info));
            overlay.remove();
            initSocket(info);

            if (req) {
                setTimeout(() => {
                    input.value = req;
                    sendM();
                }, 500);
            }
        };
    }

    function showPhoneOnlyForm(overlay) {
        overlay.innerHTML = `
            <h4>${lang === 'fr' ? 'Pas de souci' : 'No problem'}</h4>
            <p>${lang === 'fr' ? 'Laissez votre numéro et on vous rappelle.' : 'Leave your number and we will call you back.'}</p>
            
            <div class="nlc-field">
                <label>${lang === 'fr' ? 'Numéro de téléphone' : 'Phone Number'}</label>
                <input type="text" id="p-phone" placeholder="Ex: 06..." required>
            </div>
            <button class="nlc-btn-start" id="nlc-submit-phone">${lang === 'fr' ? 'Envoyer' : 'Send'}</button>
        `;

        document.getElementById('nlc-submit-phone').onclick = () => {
            const phone = document.getElementById('p-phone').value.trim();
            if (!phone) return alert(lang === 'fr' ? "Merci de saisir votre numéro." : "Please enter your number.");

            const info = { firstName: "Visitor", lastName: "(No WA)", whatsapp: phone, problem: "Callback Request (No WhatsApp)" };
            initSocket(info);

            overlay.innerHTML = `
                <div class="nlc-success-msg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <p style="font-weight:700; font-size:16px">${lang === 'fr' ? 'Merci !' : 'Thank you!'}</p>
                    <p>${lang === 'fr' ? 'On va vous appeler dans le bref délai.' : 'We will call you back shortly.'}</p>
                    <button class="nlc-btn-start" style="width:100%" id="nlc-close-prechat">${lang === 'fr' ? 'Fermer' : 'Close'}</button>
                </div>
            `;
            document.getElementById('nlc-close-prechat').onclick = () => overlay.remove();
        };
    }

    // Socket Initialization logic
    let socket;

    function initSocket(userInfo = null) {
        if (typeof io === 'undefined') {
            console.error("[asad.to] 'io' is undefined. Socket.io library failed to load.");
            statusEl.textContent = trans.statusOffline;
            statusEl.style.color = "#ef4444";
            return;
        }

        if (socket) return; // Already init

        try {
            socket = io(serverUrl, {
                reconnectionAttempts: 10,
                timeout: 10000,
                transports: ['polling', 'websocket']
            });

            socket.on('connect', () => {
                console.log("[asad.to] Connected! VID:", visitorId);
                statusEl.textContent = trans.statusOnline;
                statusEl.style.color = "#10b981";

                const regData = {
                    visitorId,
                    siteKey,
                    url: window.location.href,
                    title: document.title,
                    ...userInfo
                };
                socket.emit('register_visitor', regData);
            });

            socket.on('disconnect', () => {
                statusEl.textContent = trans.statusOffline;
                statusEl.style.color = "#ef4444";
            });

            socket.on('agent_message', (data) => {
                addMsg(data.text, 'agent');
                if (!win.classList.contains('nlc-window-open')) dot.style.display = 'block';
            });

            socket.on('chat_history', (history) => {
                if (history && history.length > 0) {
                    msgs.innerHTML = '';
                    history.forEach(msg => addMsg(msg.text, msg.sender === 'visitor' ? 'visitor' : 'agent'));
                }
            });

        } catch (e) {
            console.error("[asad.to] Socket error:", e);
        }
    }

    // Track first click on site for conversion stats
    let hasTrackedClick = false;
    document.addEventListener('mousedown', () => {
        if (!hasTrackedClick) {
            trackEvent('site_click');
            hasTrackedClick = true;
        }
    });

    // Replace the bubble click logic to trigger pre-chat
    bubble.onclick = () => {
        win.classList.toggle('nlc-window-open');
        dot.style.display = 'none';
        if (win.classList.contains('nlc-window-open')) {
            if (!socket) checkPreChat();
            setTimeout(() => input.focus(), 100);
        }
    };

    function addMsg(text, sender) {
        const d = document.createElement('div');
        d.className = 'nlc-message nlc-message-' + sender;
        d.textContent = text;
        msgs.appendChild(d);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function sendM() {
        const text = input.value.trim();
        if (!text || !socket || !socket.connected) return;
        addMsg(text, 'visitor');
        socket.emit('visitor_message', { text, visitorId });
        input.value = '';
    }

    send.onclick = sendM;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendM(); };
});
