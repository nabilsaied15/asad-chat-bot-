import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
    fr: {
        nav: { home: "Accueil", inbox: "Boîte Mail", login: "Connexion", signup: "Inscription gratuite" },
        hero: {
            title: "Bienvenue chez asad.to",
            subtitle: "Bourg-la-Reine",
            question: "Comment pouvons-nous",
            end: "votre entreprise ?",
            desc: "asad.to (Bourg-la-Reine) vous aide à rester proche de vos clients 24/7. Surveillez l'activité et discutez gratuitement avec vos visiteurs.",
            btn: "Démarrer Gratuitement",
            promo: "Aucune carte de crédit requise • Installation en 30 secondes",
            words: ["servir", "informer", "épater", "éduquer", "répondre", "ravir", "vendre", "autonomiser"]
        },
        stats: {
            messages: "Messages Traités",
            satisfaction: "Satisfaction Client",
            availability: "Disponibilité",
            efficiency: "Gain d'Efficacité"
        },
        auth: {
            signIn: "Connexion",
            signUp: "Créer un compte",
            email: "Adresse Email",
            password: "Mot de passe",
            name: "Nom",
            forgot: "Oublié ?",
            google: "Continuer avec Google",
            new: "Nouveau sur asad.to ?",
            already: "Déjà un compte ?",
            enterDetails: "Entrez vos détails pour vous connecter",
            startSetup: "Commencez votre configuration en 10 secondes"
        },
        inbox: {
            title: "Boîte de réception",
            search: "Rechercher des messages...",
            select: "Sélectionnez une conversation pour commencer à discuter",
            online: "En ligne",
            placeholder: "Écrivez un message..."
        }
    },
    en: {
        nav: { home: "Home", inbox: "Inbox", login: "Log In", signup: "Sign Up Free" },
        hero: {
            title: "Welcome to asad.to",
            subtitle: "Bourg-la-Reine",
            question: "How millions of companies help",
            end: "to billions of customers.",
            desc: "asad.to (Bourg-la-Reine) helps you stay close to your customers 24/7. Monitor activity and chat with your visitors for free.",
            btn: "Add to your site — it's free",
            promo: "No credit card required • 30 second setup",
            words: ["service", "inform", "wow", "educate", "reply", "delight", "sell", "empower"]
        },
        stats: {
            messages: "Messages Handled",
            satisfaction: "Customer Satisfaction",
            availability: "Availability",
            efficiency: "Efficiency Boost"
        },
        auth: {
            signIn: "Sign In",
            signUp: "Create Account",
            email: "Email Address",
            password: "Password",
            name: "Name",
            forgot: "Forgot?",
            google: "Sign in with Google",
            new: "New to asad.to?",
            already: "Already have an account?",
            enterDetails: "Enter your details to sign in",
            startSetup: "Start your 10 seconds setup"
        },
        inbox: {
            title: "Inbox",
            search: "Search messages...",
            select: "Select a conversation to start chatting",
            online: "Online",
            placeholder: "Type a message..."
        }
    }
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState('fr'); // Default to French as requested

    const toggleLanguage = () => {
        setLang(prev => (prev === 'fr' ? 'en' : 'fr'));
    };

    const t = translations[lang];

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
