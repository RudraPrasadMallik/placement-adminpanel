import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  deleteCompany,
  getAllCompanies,
  getAllJobs,
  toggleCompanyStatus,
  toggleJobStatus,
} from '../services/api';

const pageSurface = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '22px',
  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
};

const chipStyles = {
  APPROVED: { backgroundColor: '#dcfce7', color: '#166534' },
  PENDING: { backgroundColor: '#fef3c7', color: '#92400e' },
  REJECTED: { backgroundColor: '#fee2e2', color: '#991b1b' },
};

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState('all');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [companiesResponse, jobsResponse] = await Promise.all([
          getAllCompanies(),
          getAllJobs(),
        ]);

        setCompanies(companiesResponse.data || []);
        setJobs(jobsResponse.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Unable to load company management data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleToggleCompanyStatus = async (companyId, currentStatus) => {
    try {
      setError('');
      const response = await toggleCompanyStatus(companyId, !currentStatus);
      const updatedCompany = response.data;
      setCompanies((prev) =>
        prev.map((company) => (company.id === companyId ? updatedCompany : company))
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to update company status.');
    }
  };

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    try {
      setError('');
      const response = await toggleJobStatus(jobId, currentStatus !== 'APPROVED');
      const updatedJob = response.data;
      setJobs((prev) => prev.map((job) => (job.id === jobId ? updatedJob : job)));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to update job status.');
    }
  };

  const handleDeleteCompany = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setError('');
      await deleteCompany(deleteTarget.id);
      setCompanies((prev) => prev.filter((company) => company.id !== deleteTarget.id));
      setJobs((prev) => prev.filter((job) => job.companyId !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to delete company.');
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const companyJobs = jobs.filter((job) => job.companyId === company.id);

      const matchesSearch =
        company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyJobs.some(
          (job) =>
            job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCompanyFilter =
        companyStatusFilter === 'all' || company.registrationStatus === companyStatusFilter.toUpperCase();

      const matchesJobFilter =
        jobStatusFilter === 'all' ||
        companyJobs.some((job) => job.status === jobStatusFilter.toUpperCase());

      return matchesSearch && matchesCompanyFilter && matchesJobFilter;
    });
  }, [companies, companyStatusFilter, jobStatusFilter, jobs, searchTerm]);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '28px',
        background:
          'radial-gradient(circle at top left, rgba(37, 99, 235, 0.10), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
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
          Company Review Queue
        </div>
        <h1 style={{ margin: 0, fontSize: '34px', fontWeight: '800', color: '#0f172a' }}>
          Company And Job Approval
        </h1>
        <p style={{ margin: '10px 0 0 0', maxWidth: '760px', fontSize: '15px', lineHeight: 1.6, color: '#475569' }}>
          Review each company in sequence with its details, actions, and submitted jobs together in one place.
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '22px',
            padding: '16px 18px',
            borderRadius: '16px',
            border: '1px solid #fecaca',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard label="Registered Companies" value={companies.length} accent="#2563eb" />
        <StatCard
          label="Approved Companies"
          value={companies.filter((company) => company.registrationStatus === 'APPROVED').length}
          accent="#059669"
        />
        <StatCard label="Total Job Posts" value={jobs.length} accent="#7c3aed" />
        <StatCard
          label="Pending Jobs"
          value={jobs.filter((job) => job.status === 'PENDING').length}
          accent="#d97706"
        />
      </div>

      <div style={{ ...pageSurface, padding: '18px', marginBottom: '24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.5fr) repeat(2, minmax(180px, 0.4fr))',
            gap: '14px',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company, contact, email, or job title..."
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          <select value={companyStatusFilter} onChange={(e) => setCompanyStatusFilter(e.target.value)} style={filterStyle}>
            <option value="all">All Companies</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <select value={jobStatusFilter} onChange={(e) => setJobStatusFilter(e.target.value)} style={filterStyle}>
            <option value="all">All Jobs</option>
            <option value="approved">Approved Jobs</option>
            <option value="pending">Pending Jobs</option>
            <option value="rejected">Rejected Jobs</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {!loading && filteredCompanies.length === 0 && (
          <div
            style={{
              ...pageSurface,
              padding: '28px',
              color: '#64748b',
              fontSize: '15px',
            }}
          >
            No companies found for the current filters.
          </div>
        )}

        {filteredCompanies.map((company, index) => {
          const companyJobs = jobs.filter((job) => {
            const matchesCompany = job.companyId === company.id;
            const matchesStatus = jobStatusFilter === 'all' || job.status === jobStatusFilter.toUpperCase();
            return matchesCompany && matchesStatus;
          });

          const companyChip = chipStyles[company.registrationStatus] || chipStyles.PENDING;

          return (
            <div key={company.id} style={{ ...pageSurface, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '24px 26px 18px 26px',
                  borderBottom: '1px solid #e2e8f0',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '20px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: '999px',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '12px',
                        fontWeight: '800',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: '14px',
                      }}
                    >
                      <Building2 size={14} />
                      Company {index + 1}
                    </div>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
                      {company.companyName}
                    </h2>
                    <p style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '15px' }}>
                      {company.industry || 'Industry not specified'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span
                      style={{
                        padding: '7px 12px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '800',
                        ...companyChip,
                      }}
                    >
                      {company.registrationStatus}
                    </span>
                    <span
                      style={{
                        padding: '7px 12px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '800',
                        backgroundColor: '#eef2ff',
                        color: '#3730a3',
                      }}
                    >
                      {companyJobs.length} jobs
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px 26px 26px 26px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: '16px',
                    marginBottom: '18px',
                  }}
                >
                  <DetailCard icon={Mail} label="Email" value={company.contactEmail || 'Not specified'} />
                  <DetailCard icon={Phone} label="Phone" value={company.contactPhone || 'Not specified'} />
                  <DetailCard icon={ShieldCheck} label="Registered" value={company.registrationDate ? format(new Date(company.registrationDate), 'MMM dd, yyyy') : 'N/A'} />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <DetailCard icon={Building2} label="Contact Person" value={company.contactPerson || 'Not specified'} />
                  <DetailCard icon={Globe} label="Website" value={company.website || 'Not specified'} />
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '22px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleCompanyStatus(company.id, company.registrationStatus === 'APPROVED')}
                    style={{
                      ...actionButtonStyle,
                      backgroundColor: company.registrationStatus === 'APPROVED' ? '#fee2e2' : '#dcfce7',
                      color: company.registrationStatus === 'APPROVED' ? '#b91c1c' : '#166534',
                    }}
                  >
                    {company.registrationStatus === 'APPROVED' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                    {company.registrationStatus === 'APPROVED' ? 'Reject Company' : 'Approve Company'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(company)}
                    style={{
                      ...actionButtonStyle,
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                    }}
                  >
                    <Trash2 size={16} />
                    Delete Company
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Submitted Jobs</div>
                    <div style={{ marginTop: '4px', fontSize: '14px', color: '#64748b' }}>
                      Approve only the roles that should appear in the student jobs page.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {companyJobs.length === 0 && (
                    <div
                      style={{
                        padding: '18px',
                        borderRadius: '16px',
                        border: '1px dashed #cbd5e1',
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        fontSize: '14px',
                      }}
                    >
                      No jobs available for this company in the current filter.
                    </div>
                  )}

                  {companyJobs.map((job) => {
                    const jobChip = chipStyles[job.status] || chipStyles.PENDING;

                    return (
                      <div
                        key={job.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '18px',
                          padding: '18px',
                          backgroundColor: '#f8fafc',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '16px',
                            alignItems: 'flex-start',
                            marginBottom: '12px',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '19px', fontWeight: '700', color: '#0f172a' }}>{job.title}</div>
                            <div style={{ marginTop: '6px', fontSize: '13px', color: '#64748b' }}>
                              Submitted {job.createdAt ? format(new Date(job.createdAt), 'MMM dd, yyyy') : 'recently'}
                            </div>
                          </div>
                          <span
                            style={{
                              padding: '6px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: '800',
                              ...jobChip,
                            }}
                          >
                            {job.status}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                            gap: '12px',
                            marginBottom: '14px',
                          }}
                        >
                          <MiniInfo label="Positions" value={String(job.positions)} />
                          <MiniInfo label="Package" value={job.salaryPackage} />
                          <MiniInfo label="Location" value={job.location} />
                          <MiniInfo label="Min CGPA" value={job.minimumCgpa != null ? String(job.minimumCgpa) : 'Open'} />
                        </div>

                        <p style={{ margin: '0 0 14px 0', color: '#475569', fontSize: '14px', lineHeight: 1.65 }}>
                          {job.description}
                        </p>

                        {(job.applicationLink || job.jdFileUrl) && (
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                            {job.applicationLink && (
                              <a href={job.applicationLink} target="_blank" rel="noopener noreferrer" style={linkPillStyle}>
                                <ExternalLink size={14} />
                                Open Job Link
                              </a>
                            )}
                            {job.jdFileUrl && (
                              <a href={`http://localhost:8080/${job.jdFileUrl}`} target="_blank" rel="noopener noreferrer" style={linkPillStyle}>
                                <Briefcase size={14} />
                                View JD PDF
                              </a>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleJobStatus(job.id, job.status)}
                          style={{
                            ...actionButtonStyle,
                            backgroundColor: job.status === 'APPROVED' ? '#fee2e2' : '#dcfce7',
                            color: job.status === 'APPROVED' ? '#b91c1c' : '#166534',
                          }}
                        >
                          {job.status === 'APPROVED' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                          {job.status === 'APPROVED' ? 'Reject Job' : 'Approve Job'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 1000,
          }}
        >
          <div style={{ ...pageSurface, width: '100%', maxWidth: '440px', padding: '24px' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
              Delete Company
            </div>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: 1.6 }}>
              Delete <strong>{deleteTarget.companyName}</strong> and all its jobs from the system. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '22px' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  ...actionButtonStyle,
                  backgroundColor: '#e2e8f0',
                  color: '#334155',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCompany}
                style={{
                  ...actionButtonStyle,
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, accent }) => (
  <div style={{ ...pageSurface, padding: '22px', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
    <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>
      {label}
    </div>
    <div style={{ fontSize: '34px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>{value}</div>
    <div style={{ height: '4px', borderRadius: '999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
      <div style={{ width: '45%', height: '100%', backgroundColor: accent }} />
    </div>
  </div>
);

const DetailCard = ({ icon: Icon, label, value }) => (
  <div
    style={{
      padding: '16px',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
      <Icon size={14} />
      {label}
    </div>
    <div style={{ color: '#0f172a', fontSize: '14px', fontWeight: '600', lineHeight: 1.5 }}>{value}</div>
  </div>
);

const MiniInfo = ({ label, value }) => (
  <div
    style={{
      padding: '14px',
      borderRadius: '14px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
    }}
  >
    <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
      {label}
    </div>
    <div style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700' }}>{value}</div>
  </div>
);

const filterStyle = {
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#f8fafc',
  fontSize: '14px',
  color: '#0f172a',
  outline: 'none',
};

const actionButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '11px 16px',
  borderRadius: '14px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '700',
};

const linkPillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  borderRadius: '999px',
  backgroundColor: '#eef2ff',
  color: '#3730a3',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: '700',
};

export default Companies;
