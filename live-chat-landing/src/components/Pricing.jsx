import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const Pricing = () => {
    return (
        <section style={{ padding: '100px 0', backgroundColor: '#00b06b', color: 'white' }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ fontSize: '56px', fontWeight: '800', marginBottom: '24px' }}
                >
                    Free. Forever.
                </motion.h2>
                <p style={{ fontSize: '20px', marginBottom: '60px', opacity: 0.9 }}>Not Freemium. Not limited. Just Free.</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
                    <div style={{ backgroundColor: 'white', color: 'var(--text-main)', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '500px', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '32px' }}>Everything you need:</h3>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                "Unlimited Agents",
                                "Unlimited History",
                                "Automated Triggers",
                                "Customizable Widget",
                                "Ticketing System",
                                "Knowledge Base",
                                "Geo IP Tracking"
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500' }}>
                                    <div style={{ color: 'var(--primary)' }}>
                                        <Check size={20} strokeWidth={3} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '40px', padding: '16px' }}>Sign Up Free Now</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
