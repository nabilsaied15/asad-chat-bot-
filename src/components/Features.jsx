import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Smile, BarChart2, Globe, Heart } from 'lucide-react';

const icons = [Shield, Zap, Smile, BarChart2, Globe, Heart];
const features = [
    { title: "Monitor real-time", desc: "See where your visitors are coming from and what they are looking at." },
    { title: "Collaborate", desc: "Group messaging and agent-to-agent messaging for better teamwork." },
    { title: "Mobile Apps", desc: "Stay connected with your customers from iOS or Android apps." },
    { title: "1880+ Emoji", desc: "Express yourself with a wide variety of emojis." },
    { title: "Multi-language", desc: "Communicate in 45+ languages to reach a global audience." },
    { title: "Secure", desc: "Bank-grade security and 256-bit SSL encryption." }
];

const Features = () => {
    return (
        <section style={{ padding: '100px 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '16px' }}>Rich in Features and still 100% FREE!</h2>
                    <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>All the premium features you would expect, just without the price tag.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                    {features.map((f, i) => {
                        const Icon = icons[i];
                        return (
                            <motion.div
                                whileHover={{ y: -5 }}
                                key={i}
                                style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', transition: 'box-shadow 0.3s' }}
                            >
                                <div style={{ color: 'var(--primary)', marginBottom: '20px' }}>
                                    <Icon size={32} />
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{f.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Features;
