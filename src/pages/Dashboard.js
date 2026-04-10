import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Briefcase,
  Clock3,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { getDashboardData } from '../services/api';

const pageCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '20px',
  boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)',
};

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getDashboardData();
        setDashboard(response.data || null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return [
      {
        label: 'Total Students',
        value: dashboard.totalStudents ?? 0,
        note: `${dashboard.activeStudents ?? 0} active students`,
        color: '#2563eb',
        soft: '#dbeafe',
        icon: Users,
      },
      {
        label: 'Registered Companies',
        value: dashboard.totalCompanies ?? 0,
        note: `${dashboard.activeCompanies ?? 0} approved companies`,
        color: '#059669',
        soft: '#d1fae5',
        icon: Building2,
      },
      {
        label: 'Pending Companies',
        value: dashboard.pendingCompanies ?? 0,
        note: 'Waiting for admin approval',
        color: '#d97706',
        soft: '#fef3c7',
        icon: Clock3,
      },
      {
        label: 'Total Jobs',
        value: dashboard.totalJobs ?? 0,
        note: `${dashboard.pendingJobs ?? 0} pending and ${dashboard.approvedJobs ?? 0} approved`,
        color: '#7c3aed',
        soft: '#ede9fe',
        icon: Briefcase,
      },
    ];
  }, [dashboard]);

  const recentStudents = dashboard?.recentStudents || [];
  const recentCompanies = dashboard?.recentCompanies || [];

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '28px',
        background:
          'radial-gradient(circle at top left, rgba(37, 99, 235, 0.10), transparent 24%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
      }}
    >
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: '800',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#2563eb',
            marginBottom: '10px',
          }}
        >
          Admin Overview
        </div>
        <h1 style={{ margin: 0, fontSize: '34px', fontWeight: '800', color: '#0f172a' }}>
          Placement Dashboard
        </h1>
        <p style={{ margin: '10px 0 0 0', maxWidth: '760px', fontSize: '15px', lineHeight: 1.6, color: '#475569' }}>
          Live system numbers for student registrations, company approvals, and job activity.
        </p>
      </div>

      {error && (
        <div
          style={{
            ...pageCard,
            marginBottom: '22px',
            padding: '16px 18px',
            borderColor: '#fecaca',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ ...pageCard, padding: '28px', color: '#64748b', fontSize: '15px' }}>
          Loading dashboard data...
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
              marginBottom: '24px',
            }}
          >
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} style={{ ...pageCard, padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
                        {stat.label}
                      </div>
                      <div style={{ marginTop: '14px', fontSize: '34px', fontWeight: '800', color: '#0f172a' }}>
                        {stat.value}
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                        {stat.note}
                      </div>
                    </div>

                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        backgroundColor: stat.soft,
                        color: stat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={24} />
                    </div>
                  </div>

                  <div style={{ marginTop: '18px', height: '4px', borderRadius: '9999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ width: '55%', height: '100%', backgroundColor: stat.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '22px',
            }}
          >
            <div style={{ ...pageCard, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    backgroundColor: '#dbeafe',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>Recent Students</div>
                  <div style={{ marginTop: '4px', fontSize: '14px', color: '#64748b' }}>
                    Latest student registrations from the backend
                  </div>
                </div>
              </div>

              {recentStudents.length === 0 ? (
                <div style={{ padding: '18px', borderRadius: '16px', border: '1px dashed #cbd5e1', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px' }}>
                  No recent student records found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {recentStudents.map((student) => (
                    <div
                      key={student.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px',
                        alignItems: 'center',
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                          {student.fullName}
                        </div>
                        <div style={{ marginTop: '4px', fontSize: '13px', color: '#64748b' }}>
                          {student.department || 'Department not set'} • {student.email}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 10px',
                            borderRadius: '9999px',
                            backgroundColor: student.active ? '#dcfce7' : '#fee2e2',
                            color: student.active ? '#166534' : '#991b1b',
                            fontSize: '12px',
                            fontWeight: '800',
                          }}
                        >
                          <ShieldCheck size={13} />
                          {student.active ? 'Active' : 'Inactive'}
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                          {student.registrationDate ? format(new Date(student.registrationDate), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ ...pageCard, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    backgroundColor: '#dcfce7',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>Recent Companies</div>
                  <div style={{ marginTop: '4px', fontSize: '14px', color: '#64748b' }}>
                    Latest company registrations and approval status
                  </div>
                </div>
              </div>

              {recentCompanies.length === 0 ? (
                <div style={{ padding: '18px', borderRadius: '16px', border: '1px dashed #cbd5e1', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px' }}>
                  No recent company records found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {recentCompanies.map((company) => (
                    <div
                      key={company.id}
                      style={{
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                            {company.companyName}
                          </div>
                          <div style={{ marginTop: '4px', fontSize: '13px', color: '#64748b' }}>
                            {company.industry || 'Industry not specified'}
                          </div>
                        </div>
                        <span
                          style={{
                            padding: '6px 10px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '800',
                            backgroundColor:
                              company.registrationStatus === 'APPROVED'
                                ? '#dcfce7'
                                : company.registrationStatus === 'REJECTED'
                                  ? '#fee2e2'
                                  : '#fef3c7',
                            color:
                              company.registrationStatus === 'APPROVED'
                                ? '#166534'
                                : company.registrationStatus === 'REJECTED'
                                  ? '#991b1b'
                                  : '#92400e',
                          }}
                        >
                          {company.registrationStatus}
                        </span>
                      </div>

                      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                        <span>{company.contactPerson || company.contactEmail || 'Contact not set'}</span>
                        <span>{company.jobsCount || 0} jobs</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  marginTop: '20px',
                  padding: '18px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)',
                  border: '1px solid #c7d2fe',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3730a3' }}>
                  Approval Snapshot
                </div>
                <div style={{ marginTop: '10px', fontSize: '14px', lineHeight: 1.7, color: '#4338ca' }}>
                  {dashboard?.activeCompanies ?? 0} companies approved and {dashboard?.approvedJobs ?? 0} jobs approved for the student-facing portal.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
