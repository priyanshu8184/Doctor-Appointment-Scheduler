import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  ShieldCheck,
  Clock,
  User,
  Activity,
  FileText
} from 'lucide-react';
import './AdminPages.css';

const AdminAuditLogsPage = ({ logs = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    const matchAction = log.action_type?.toLowerCase().includes(q);
    const matchAdmin = log.admin_email?.toLowerCase().includes(q);
    const matchTarget = log.target_type?.toLowerCase().includes(q);
    const matchDetails = JSON.stringify(log.details || {}).toLowerCase().includes(q);
    return matchAction || matchAdmin || matchTarget || matchDetails;
  });

  return (
    <div className="admin-audit-logs-view">
      {/* Top Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search audit logs by action, admin, target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Audit Logs Table */}
      <div className="admin-card">
        <div className="admin-card-header-row">
          <div className="admin-card-title-group">
            <ShieldAlert size={18} color="#087F72" />
            <div>
              <h3 className="admin-card-title">Security & Administrative Action Audit Trail</h3>
              <p className="admin-card-subtitle">
                Immutable chronological log of all administrative interventions and approvals
              </p>
            </div>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Action Type</th>
                <th>Administrator</th>
                <th>Target Type & ID</th>
                <th>Event Metadata / Details</th>
                <th>IP Origin</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.log_id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: '#64748B' }}>#{log.log_id}</span>
                    </td>
                    <td>
                      <span className="admin-badge scheduled" style={{ fontWeight: 700 }}>
                        {log.action_type}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>
                        <strong>{log.admin_email || 'admin@healpoint.com'}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>Admin #{log.admin_id}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {log.target_type} #{log.target_id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px', maxWidth: '300px', overflowX: 'auto' }}>
                        {JSON.stringify(log.details)}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B' }}>
                        {log.ip_address || '127.0.0.1'}
                      </span>
                    </td>
                    <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    <ShieldAlert size={32} style={{ margin: '0 auto 0.5rem auto', color: '#94A3B8', display: 'block' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No audit logs recorded for this query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogsPage;
