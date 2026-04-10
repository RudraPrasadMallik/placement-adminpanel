import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Download,
  Plus,
  FolderCog,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  createRegistrationOption,
  deleteRegistrationOption,
  deleteStudent,
  getAllStudents,
  getStudentRegistrationOptions,
  toggleStudentStatus,
} from '../services/api';

const sectionCardStyle = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  border: '1px solid #e5e7eb',
};

const actionButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '10px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
};

const optionConfig = {
  DEPARTMENT: {
    title: 'Departments',
    placeholder: 'Add department',
    helper: 'These values appear in the student registration Department dropdown.',
  },
  YEAR: {
    title: 'Years',
    placeholder: 'Add year',
    helper: 'These values appear in the student registration Year dropdown.',
  },
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [options, setOptions] = useState({ DEPARTMENT: [], YEAR: [] });
  const [optionInputs, setOptionInputs] = useState({ DEPARTMENT: '', YEAR: '' });
  const [savingOption, setSavingOption] = useState({ DEPARTMENT: false, YEAR: false });
  const [expandedStudents, setExpandedStudents] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      const [studentsResult, optionsResult] = await Promise.allSettled([
        getAllStudents(),
        getStudentRegistrationOptions(),
      ]);

      if (studentsResult.status === 'fulfilled') {
        setStudents(studentsResult.value.data || []);
      } else {
        const err = studentsResult.reason;
        setError(err.response?.data?.message || err.message || 'Unable to load student records.');
      }

      if (optionsResult.status === 'fulfilled') {
        const data = optionsResult.value.data || {};
        setOptions({
          DEPARTMENT: data.departments || [],
          YEAR: data.years || [],
        });
      } else if (studentsResult.status === 'fulfilled') {
        const err = optionsResult.reason;
        setError(err.response?.data?.message || err.message || 'Unable to load registration options.');
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const handleToggleStatus = async (studentId, currentActive) => {
    try {
      const response = await toggleStudentStatus(studentId, !currentActive);
      const updatedStudent = response.data;
      setStudents((prev) =>
        prev.map((student) => (student.id === studentId ? updatedStudent : student))
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to update student status.');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await deleteStudent(studentId);
      setStudents((prev) => prev.filter((student) => student.id !== studentId));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to delete student.');
    }
  };

  const handleCreateOption = async (type) => {
    const value = optionInputs[type].trim();
    if (!value) {
      return;
    }

    setSavingOption((prev) => ({ ...prev, [type]: true }));
    setError('');

    try {
      const response = await createRegistrationOption(type, {
        value,
        sortOrder: options[type].length,
      });

      setOptions((prev) => ({
        ...prev,
        [type]: [...prev[type], response.data],
      }));
      setOptionInputs((prev) => ({ ...prev, [type]: '' }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Unable to add ${type.toLowerCase()} option.`);
    } finally {
      setSavingOption((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleDeleteOption = async (type, optionId) => {
    try {
      await deleteRegistrationOption(optionId);
      setOptions((prev) => ({
        ...prev,
        [type]: prev[type].filter((item) => item.id !== optionId),
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Unable to delete ${type.toLowerCase()} option.`);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'active' && student.active) ||
        (filterStatus === 'inactive' && !student.active);

      return matchesSearch && matchesFilter;
    });
  }, [filterStatus, searchTerm, students]);

  const toggleAppliedJobs = (studentId) => {
    setExpandedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const renderSemesterRecords = (student) => {
    if (!student.semesterRecords || student.semesterRecords.length === 0) {
      return (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#64748b',
            fontSize: '14px',
          }}
        >
          No semester details added yet.
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {student.semesterRecords.map((record) => (
          <div
            key={record.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.1fr) minmax(160px, 0.6fr) minmax(200px, 0.9fr)',
              gap: '16px',
              alignItems: 'start',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                Semester Name
              </div>
              <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                {record.semesterName || 'Not added'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                Percentage
              </div>
              <div style={{ marginTop: '6px', fontSize: '14px', color: '#111827' }}>
                {record.percentage !== null && record.percentage !== undefined
                  ? `${record.percentage}%`
                  : 'Not added'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                Marksheet
              </div>
              {record.marksheetUrl ? (
                <a
                  href={record.marksheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#2563eb',
                    textDecoration: 'none',
                  }}
                >
                  {record.marksheetName || 'View Marksheet'}
                </a>
              ) : (
                <div style={{ marginTop: '6px', fontSize: '14px', color: '#64748b' }}>Not uploaded</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Students Management
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage registered students and configure Department and Year dropdown values.
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '24px',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            backgroundColor: '#fef2f2',
            padding: '16px',
            color: '#b91c1c',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ ...sectionCardStyle, marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' }}>
            Student Registration Settings
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Maintain the Department and Year values shown in the student registration form.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              padding: '16px 18px',
              borderRadius: '14px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
            }}
          >
            <div style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: '600', marginBottom: '8px' }}>
              Department Options
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
              {options.DEPARTMENT.length}
            </div>
          </div>

          <div
            style={{
              padding: '16px 18px',
              borderRadius: '14px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
            }}
          >
            <div style={{ fontSize: '13px', color: '#15803d', fontWeight: '600', marginBottom: '8px' }}>
              Year Options
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
              {options.YEAR.length}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {Object.entries(optionConfig).map(([type, config]) => (
            <div key={type} style={{ ...sectionCardStyle, boxShadow: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FolderCog size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                    {config.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '13px' }}>
                    {config.helper}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
                <input
                  type="text"
                  value={optionInputs[type]}
                  onChange={(e) =>
                    setOptionInputs((prev) => ({
                      ...prev,
                      [type]: e.target.value,
                    }))
                  }
                  placeholder={config.placeholder}
                  style={{
                    flex: 1,
                    padding: '11px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleCreateOption(type)}
                  disabled={savingOption[type]}
                  style={{
                    ...actionButtonStyle,
                    backgroundColor: '#2563eb',
                    color: 'white',
                    opacity: savingOption[type] ? 0.7 : 1,
                  }}
                >
                  <Plus size={16} />
                  {savingOption[type] ? 'Adding...' : 'Add'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {options[type].length === 0 ? (
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      color: '#64748b',
                      fontSize: '14px',
                    }}
                  >
                    No values added yet.
                  </div>
                ) : (
                  options[type].map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
                        {item.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteOption(type, item.id)}
                        style={{
                          ...actionButtonStyle,
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          padding: '8px 12px',
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={sectionCardStyle}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' }}>
            Registered Students
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Live student records from the backend with status controls.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '16px',
                width: '16px',
                color: '#9ca3af',
              }}
            />
            <input
              type="text"
              placeholder="Search by name, email, or roll number..."
              style={{
                width: '100%',
                padding: '10px 12px 10px 44px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
              }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              type="button"
              style={{
                ...actionButtonStyle,
                backgroundColor: '#e5e7eb',
                color: '#374151',
              }}
            >
              <Filter size={16} />
              Filter
            </button>

            <button
              type="button"
              style={{
                ...actionButtonStyle,
                backgroundColor: '#e5e7eb',
                color: '#374151',
              }}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div
          style={{
            borderRadius: '14px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            backgroundColor: 'white',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  {['Student', 'Contact', 'Academic', 'Status', 'Registered', 'Actions'].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: '14px 24px',
                        textAlign: heading === 'Actions' ? 'right' : 'left',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody style={{ backgroundColor: 'white' }}>
                {!loading &&
                  filteredStudents.map((student) => (
                    <React.Fragment key={student.id}>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            {student.fullName}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>ID: {student.id}</div>
                          <button
                            type="button"
                            onClick={() => toggleAppliedJobs(student.id)}
                            style={{
                              marginTop: '10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              border: 'none',
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              borderRadius: '9999px',
                              padding: '6px 10px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            Applied Jobs ({student.appliedJobs?.length || 0})
                            {expandedStudents.includes(student.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                        <div>
                          <div style={{ fontSize: '14px', color: '#111827' }}>{student.email}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>{student.phoneNumber}</div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                        <div>
                          <div style={{ fontSize: '14px', color: '#111827' }}>
                            {student.department || 'Not set'}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            Year: {student.year || student.graduationYear || 'Not set'}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            Roll: {student.rollNumber || 'N/A'} | CGPA: {student.currentCgpa ?? 'N/A'}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '700',
                            backgroundColor: student.active ? '#dcfce7' : '#fee2e2',
                            color: student.active ? '#166534' : '#991b1b',
                          }}
                        >
                          {student.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#6b7280', verticalAlign: 'top' }}>
                        {student.registrationDate
                          ? format(new Date(student.registrationDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </td>

                      <td style={{ padding: '16px 24px', textAlign: 'right', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student.id, student.active)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              color: student.active ? '#059669' : '#6b7280',
                            }}
                            title={student.active ? 'Deactivate' : 'Activate'}
                          >
                            {student.active ? (
                              <ToggleRight style={{ height: '20px', width: '20px' }} />
                            ) : (
                              <ToggleLeft style={{ height: '20px', width: '20px' }} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              color: '#6b7280',
                            }}
                            title="Delete"
                          >
                            <Trash2 style={{ height: '16px', width: '16px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedStudents.includes(student.id) && (
                      <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                        <td colSpan={6} style={{ padding: '18px 24px' }}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                              gap: '14px',
                              marginBottom: '18px',
                            }}
                          >
                            <div
                              style={{
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#ffffff',
                              }}
                            >
                              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                                Resume
                              </div>
                              {student.resumeUrl ? (
                                <a
                                  href={student.resumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: 'inline-block',
                                    marginTop: '8px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    color: '#2563eb',
                                    textDecoration: 'none',
                                  }}
                                >
                                  {student.resumeFileName || 'View Resume'}
                                </a>
                              ) : (
                                <div style={{ marginTop: '8px', fontSize: '14px', color: '#64748b' }}>Not uploaded</div>
                              )}
                            </div>

                            <div
                              style={{
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#ffffff',
                              }}
                            >
                              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                                Semester Entries
                              </div>
                              <div style={{ marginTop: '8px', fontSize: '22px', fontWeight: '700', color: '#111827' }}>
                                {student.semesterRecords?.length || 0}
                              </div>
                            </div>

                            <div
                              style={{
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#ffffff',
                              }}
                            >
                              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                                Applied Jobs
                              </div>
                              <div style={{ marginTop: '8px', fontSize: '22px', fontWeight: '700', color: '#111827' }}>
                                {student.appliedJobs?.length || 0}
                              </div>
                            </div>
                          </div>

                          <div style={{ marginBottom: '18px' }}>
                            <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                              Semester Details
                            </div>
                            {renderSemesterRecords(student)}
                          </div>

                          <div>
                            <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                              Applied Jobs
                            </div>
                            {!student.appliedJobs || student.appliedJobs.length === 0 ? (
                              <div
                                style={{
                                  padding: '14px 16px',
                                  borderRadius: '12px',
                                  border: '1px dashed #cbd5e1',
                                  backgroundColor: '#ffffff',
                                  color: '#64748b',
                                  fontSize: '14px',
                                }}
                              >
                                This student has not marked any jobs as applied yet.
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {student.appliedJobs.map((job) => (
                                  <div
                                    key={job.applicationId || job.jobId}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      gap: '16px',
                                      alignItems: 'flex-start',
                                      padding: '16px',
                                      borderRadius: '12px',
                                      border: '1px solid #e2e8f0',
                                      backgroundColor: '#ffffff',
                                    }}
                                  >
                                    <div>
                                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                                        {job.title}
                                      </div>
                                      <div style={{ marginTop: '4px', fontSize: '13px', color: '#475569' }}>
                                        {job.companyName}
                                      </div>
                                      <div style={{ marginTop: '6px', fontSize: '13px', color: '#64748b' }}>
                                        {job.location || 'Location not specified'}
                                      </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        Applied on {job.appliedAt ? format(new Date(job.appliedAt), 'MMM dd, yyyy') : 'N/A'}
                                      </div>
                                      {job.applicationLink && (
                                        <a
                                          href={job.applicationLink}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            display: 'inline-block',
                                            marginTop: '8px',
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            color: '#2563eb',
                                            textDecoration: 'none',
                                          }}
                                        >
                                          Open Apply Link
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>

            {loading && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6b7280' }}>
                Loading students...
              </div>
            )}

            {!loading && filteredStudents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6b7280' }}>
                No students found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
