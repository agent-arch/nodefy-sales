'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

// ============================================
// NODEFY CLIENT PORTAL
// Branded landing page for individual clients
// ============================================

interface PortalReport {
  slug: string
  title: string
  period: string
  createdAt: string
}

interface NextMeeting {
  date: string
  title: string
  link: string | null
}

interface QuickLink {
  label: string
  url: string
  icon: string
}

interface PortalConfig {
  clientName: string
  slug: string
  brandColor: string
  logoUrl: string | null
  welcomeMessage: string
  accountManager: string
  accountManagerEmail: string
  accountManagerPhoto: string | null
  sections: {
    reports: boolean
    budgetPacing: boolean
    alerts: boolean
    meetings: boolean
    recommendations: boolean
  }
  reports: PortalReport[]
  quickLinks: QuickLink[]
  nextMeeting: NextMeeting | null
  updatedAt: string
  active: boolean
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateTime(d: string): string {
  return new Date(d).toLocaleString('nl-NL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function ClientPortalPage() {
  const params = useParams()
  const slug = params.slug as string
  const [portal, setPortal] = useState<PortalConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/client-portal?slug=${slug}`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) setPortal(res.data)
        else setError(true)
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div>Laden...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (error || !portal) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#f1f5f9' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔒</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Portaal niet gevonden</h1>
          <p style={{ color: '#94a3b8', fontSize: 16 }}>Dit portaal bestaat niet of is niet meer actief.</p>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 20 }}>
            Neem contact op met{' '}
            <a href="mailto:info@nodefy.nl" style={{ color: '#3b82f6' }}>info@nodefy.nl</a>
          </p>
        </div>
      </div>
    )
  }

  const c = portal.brandColor || '#0047FF'
  const now = new Date()

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#f1f5f9' }}>
      <style>{`
        .portal-container { max-width: 800px; margin: 0 auto; padding: 0 24px 80px; }
        
        .portal-hero {
          padding: 60px 24px 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .portal-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top, ${hexToRgba(c, 0.15)} 0%, transparent 70%);
          pointer-events: none;
        }
        .portal-logo {
          width: 80px; height: 80px; border-radius: 20px;
          background: ${hexToRgba(c, 0.15)};
          border: 2px solid ${hexToRgba(c, 0.3)};
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 36px; font-weight: 800; color: ${c};
          margin-bottom: 20px;
        }
        .portal-client-name {
          font-size: 36px; font-weight: 800; letter-spacing: -0.02em;
          margin-bottom: 12px; position: relative;
        }
        .portal-welcome {
          font-size: 16px; color: #94a3b8; max-width: 500px; margin: 0 auto;
          line-height: 1.6; position: relative;
        }

        .section { margin-bottom: 32px; }
        .section-title {
          font-size: 13px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
        }
        .section-title::after {
          content: ''; flex: 1; height: 1px; background: #1e293b;
        }

        .report-card {
          background: #1e293b; border-radius: 14px; padding: 20px 24px;
          border: 1px solid #334155; display: flex; align-items: center;
          gap: 16px; margin-bottom: 10px; transition: all 0.15s;
          text-decoration: none; color: inherit;
        }
        .report-card:hover { border-color: ${c}66; transform: translateY(-1px); box-shadow: 0 4px 20px ${hexToRgba(c, 0.1)}; }
        .report-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: ${hexToRgba(c, 0.12)};
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .report-info { flex: 1; }
        .report-title { font-weight: 700; font-size: 15px; }
        .report-period { font-size: 13px; color: #94a3b8; margin-top: 2px; }
        .report-arrow { color: #64748b; font-size: 20px; }

        .meeting-card {
          background: linear-gradient(135deg, ${hexToRgba(c, 0.08)}, #1e293b);
          border-radius: 14px; padding: 24px; border: 1px solid ${hexToRgba(c, 0.2)};
          display: flex; align-items: center; gap: 20px;
        }
        .meeting-date-box {
          background: ${hexToRgba(c, 0.15)}; border-radius: 12px;
          padding: 16px; text-align: center; min-width: 80px;
        }
        .meeting-day { font-size: 28px; font-weight: 800; color: ${c}; }
        .meeting-month { font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-top: 2px; }
        .meeting-info { flex: 1; }
        .meeting-title { font-weight: 700; font-size: 16px; }
        .meeting-time { font-size: 14px; color: #94a3b8; margin-top: 4px; }
        .meeting-btn {
          padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer;
          background: ${c}; color: #fff; font-weight: 700; font-size: 13px;
          transition: all 0.15s; text-decoration: none;
        }
        .meeting-btn:hover { opacity: 0.9; transform: scale(1.02); }

        .am-card {
          background: #1e293b; border-radius: 14px; padding: 24px;
          border: 1px solid #334155; display: flex; align-items: center; gap: 20px;
        }
        .am-avatar {
          width: 64px; height: 64px; border-radius: 16px;
          background: ${hexToRgba(c, 0.15)};
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; flex-shrink: 0; overflow: hidden;
        }
        .am-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .am-name { font-weight: 700; font-size: 16px; }
        .am-role { font-size: 13px; color: #94a3b8; margin-top: 2px; }
        .am-email {
          margin-top: 8px; font-size: 13px; color: ${c};
          text-decoration: none;
        }

        .links-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
        .link-card {
          background: #1e293b; border-radius: 12px; padding: 18px 20px;
          border: 1px solid #334155; text-decoration: none; color: inherit;
          transition: all 0.15s; display: flex; align-items: center; gap: 12px;
        }
        .link-card:hover { border-color: ${c}66; transform: translateY(-1px); }
        .link-icon { font-size: 24px; }
        .link-label { font-weight: 600; font-size: 14px; }

        .footer {
          text-align: center; padding: 40px 24px; color: #475569; font-size: 12px;
        }
        .footer a { color: ${c}; text-decoration: none; }

        @media (max-width: 600px) {
          .portal-client-name { font-size: 28px; }
          .meeting-card { flex-direction: column; text-align: center; }
          .am-card { flex-direction: column; text-align: center; }
          .links-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Hero */}
      <div className="portal-hero">
        {portal.logoUrl ? (
          <img src={portal.logoUrl} alt={portal.clientName} style={{ width: 80, height: 80, borderRadius: 20, objectFit: 'contain', marginBottom: 20, background: '#1e293b', padding: 8 }} />
        ) : (
          <div className="portal-logo">{portal.clientName.charAt(0)}</div>
        )}
        <h1 className="portal-client-name">{portal.clientName}</h1>
        <p className="portal-welcome">{portal.welcomeMessage}</p>
      </div>

      <div className="portal-container">
        {/* Next Meeting */}
        {portal.sections.meetings && portal.nextMeeting && (
          <div className="section">
            <div className="section-title">📅 Volgende Meeting</div>
            <div className="meeting-card">
              <div className="meeting-date-box">
                <div className="meeting-day">{new Date(portal.nextMeeting.date).getDate()}</div>
                <div className="meeting-month">{new Date(portal.nextMeeting.date).toLocaleString('nl-NL', { month: 'short' })}</div>
              </div>
              <div className="meeting-info">
                <div className="meeting-title">{portal.nextMeeting.title}</div>
                <div className="meeting-time">
                  {new Date(portal.nextMeeting.date).toLocaleString('nl-NL', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {portal.nextMeeting.link && (
                <a href={portal.nextMeeting.link} target="_blank" rel="noopener noreferrer" className="meeting-btn">
                  Deelnemen →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Reports */}
        {portal.sections.reports && portal.reports.length > 0 && (
          <div className="section">
            <div className="section-title">📊 Performance Rapporten</div>
            {portal.reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((report, i) => (
              <a key={i} href={`/client-report/${report.slug}`} className="report-card">
                <div className="report-icon">📋</div>
                <div className="report-info">
                  <div className="report-title">{report.title}</div>
                  <div className="report-period">{report.period} · {formatDate(report.createdAt)}</div>
                </div>
                <div className="report-arrow">→</div>
              </a>
            ))}
          </div>
        )}

        {/* Quick Links */}
        {portal.quickLinks.length > 0 && (
          <div className="section">
            <div className="section-title">🔗 Snelle Links</div>
            <div className="links-grid">
              {portal.quickLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="link-card">
                  <span className="link-icon">{link.icon}</span>
                  <span className="link-label">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Account Manager */}
        <div className="section">
          <div className="section-title">👤 Jouw Account Manager</div>
          <div className="am-card">
            <div className="am-avatar">
              {portal.accountManagerPhoto ? (
                <img src={portal.accountManagerPhoto} alt={portal.accountManager} />
              ) : (
                <span>{portal.accountManager.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="am-name">{portal.accountManager}</div>
              <div className="am-role">Account Manager · Nodefy</div>
              <a href={`mailto:${portal.accountManagerEmail}`} className="am-email">
                ✉️ {portal.accountManagerEmail}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>Powered by <a href="https://nodefy.nl" target="_blank" rel="noopener noreferrer">Nodefy</a> · Digital Marketing with AI</p>
        <p style={{ marginTop: 8 }}>Vragen? Mail ons op <a href="mailto:info@nodefy.nl">info@nodefy.nl</a></p>
      </div>
    </div>
  )
}
