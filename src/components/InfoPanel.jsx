import React from 'react'

export default function InfoPanel({ onClose }) {
    return (
        <div className="info-overlay" onClick={onClose} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="info-panel" onClick={e => e.stopPropagation()} style={{
                background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius)',
                maxWidth: '400px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                border: '1px solid var(--surface-2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.2rem' }}>About</h2>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.5rem', cursor: 'pointer'
                    }}>×</button>
                </div>

                <p style={{ marginBottom: '12px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                    Professional Scientific Calculator built with React.
                </p>

                <ul style={{ marginBottom: '20px', paddingLeft: '20px', color: 'var(--text)', fontSize: '0.9rem' }}>
                    <li>Scientific functions</li>
                    <li>History tape</li>
                    <li>Multiple themes</li>
                    <li>Responsive design</li>
                </ul>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                    Version 2.1
                </p>
            </div>
        </div>
    )
}
