import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'emerald', trend, badge }) {
  const colorMap = {
    emerald: {
      accent: 'var(--emerald-400)',
      glow: 'var(--emerald-glow)',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.25)'
    },
    cyan: {
      accent: 'var(--cyan-400)',
      glow: 'var(--cyan-glow)',
      bg: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.25)'
    },
    violet: {
      accent: 'var(--violet-400)',
      glow: 'rgba(139, 92, 246, 0.2)',
      bg: 'rgba(139, 92, 246, 0.1)',
      border: 'rgba(139, 92, 246, 0.25)'
    },
    amber: {
      accent: 'var(--amber-400)',
      glow: 'var(--amber-glow)',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.25)'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {title}
          </span>
          {badge && <span className="badge badge-slate">{badge}</span>}
        </div>
        {Icon && (
          <div
            style={{
              padding: '8px',
              borderRadius: '10px',
              background: scheme.bg,
              border: `1px solid ${scheme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={18} color={scheme.accent} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--emerald-400)' }}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
