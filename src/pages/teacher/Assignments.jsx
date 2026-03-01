import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import TeacherDashboardLayout from '../../layouts/TeacherDashboardLayout.jsx';
import { toast } from 'react-hot-toast';
import {
  FileText, Calendar, Download, Upload, CheckCircle, AlertTriangle,
  Eye, Search, RefreshCw, Plus, Users, BookOpen, GraduationCap,
  ShieldAlert, ShieldCheck, ShieldQuestion, XCircle, MessageSquare,
  ClipboardList, Star, Clock, ChevronDown, ChevronUp, ExternalLink,
  Award, X
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ─── Risk config ─────────────────────────────────────────────────────────────
const RISK = {
  High: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-100 text-red-700 border-red-200', bar: 'bg-red-500', icon: ShieldAlert },
  Moderate: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700 border-orange-200', bar: 'bg-orange-400', icon: ShieldQuestion },
  Low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700 border-green-200', bar: 'bg-green-400', icon: ShieldCheck },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

const formatDateShort = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

const SimBar = ({ pct }) => {
  const color = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-orange-400' : 'bg-green-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold ${pct >= 80 ? 'text-red-600' : pct >= 60 ? 'text-orange-600' : 'text-green-600'}`}>
        {pct}%
      </span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TeacherAssignments = () => {
  const { user } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'plagiarism'

  // Assignments
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [pendingCounts, setPendingCounts] = useState({});

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ course_id: '', title: '', description: '', due_date: '', max_score: 100, allow_late_submission: false });
  const [assignmentFile, setAssignmentFile] = useState(null);

  // Submissions modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [expandedPlagiarism, setExpandedPlagiarism] = useState({}); // sub.id -> bool
  const [remarkInputs, setRemarkInputs] = useState({});            // sub.id -> string
  const [reviewingId, setReviewingId] = useState(null);
  const [scoreInputs, setScoreInputs] = useState({});             // sub.id -> string
  const [gradingId, setGradingId] = useState(null);

  // Plagiarism tab
  const [flagged, setFlagged] = useState([]);
  const [flaggedLoading, setFlaggedLoading] = useState(false);
  const [plagReviewModal, setPlagReviewModal] = useState(null);
  const [plagRemark, setPlagRemark] = useState('');
  const [plagSubmitting, setPlagSubmitting] = useState(false);

  // ─── Fetch functions ────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [asgRes, crsRes] = await Promise.all([
        fetch(`${API}/api/assignments/teacher/${user.id}`, { headers: { Authorization: `Bearer ${user.accessToken}` } }),
        fetch(`${API}/api/courses/teacher/${user.id}`, { headers: { Authorization: `Bearer ${user.accessToken}` } }),
      ]);
      if (asgRes.ok) setAssignments(await asgRes.json());
      if (crsRes.ok) { const d = await crsRes.json(); setCourses(Array.isArray(d) ? d : d?.data || []); }
    } catch { toast.error('Failed to load assignments'); }
    finally { setLoading(false); }
  }, [user]);

  const fetchPendingCounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API}/api/assignments/teacher/${user.id}/pending-count`, { headers: { Authorization: `Bearer ${user.accessToken}` } });
      if (res.ok) {
        const data = await res.json();
        const map = {}; data.forEach(i => { map[i.assignment_id] = i.pending_count; });
        setPendingCounts(map);
      }
    } catch { }
  }, [user]);

  const fetchSubmissions = useCallback(async (assignmentId) => {
    setSubmissionsLoading(true);
    try {
      const res = await fetch(`${API}/api/assignments/submissions/${assignmentId}?teacher_id=${user.id}`, { headers: { Authorization: `Bearer ${user.accessToken}` } });
      if (res.ok) { const d = await res.json(); setSubmissions(d); }
      else throw new Error();
    } catch { toast.error('Failed to load submissions'); }
    finally { setSubmissionsLoading(false); }
  }, [user]);

  const fetchFlagged = useCallback(async () => {
    if (!user?.id) return;
    setFlaggedLoading(true);
    try {
      const res = await fetch(`${API}/api/plagiarism/flagged/${user.id}`, { headers: { Authorization: `Bearer ${user.accessToken}` } });
      if (res.ok) setFlagged(await res.json());
      else throw new Error();
    } catch { toast.error('Failed to load flagged submissions'); }
    finally { setFlaggedLoading(false); }
  }, [user]);

  useEffect(() => { fetchAll(); fetchPendingCounts(); }, [fetchAll, fetchPendingCounts]);
  useEffect(() => { if (activeTab === 'plagiarism') fetchFlagged(); }, [activeTab, fetchFlagged]);

  // ─── Actions ────────────────────────────────────────────────────────────────
  const handleCreateAssignment = async () => {
    if (!formData.course_id || !formData.title || !formData.due_date) { toast.error('Please fill required fields'); return; }
    if (new Date(formData.due_date) <= new Date()) { toast.error('Due date must be in the future'); return; }
    setCreating(true);
    try {
      const fd = new FormData();
      Object.entries({ ...formData, due_date: new Date(formData.due_date).toISOString() }).forEach(([k, v]) => fd.append(k, v));
      if (assignmentFile) fd.append('file', assignmentFile);
      const res = await fetch(`${API}/api/assignments/create?teacher_id=${user.id}`, { method: 'POST', body: fd, headers: { Authorization: `Bearer ${user.accessToken}` } });
      if (res.ok) { toast.success('Assignment created!'); setShowCreateModal(false); setFormData({ course_id: '', title: '', description: '', due_date: '', max_score: 100, allow_late_submission: false }); setAssignmentFile(null); fetchAll(); fetchPendingCounts(); }
      else { const e = await res.json(); throw new Error(e.detail || 'Failed'); }
    } catch (e) { toast.error(e.message || 'Failed to create assignment'); }
    finally { setCreating(false); }
  };

  const handleGrade = async (submissionId) => {
    const score = parseInt(scoreInputs[submissionId] ?? '');
    if (isNaN(score) || score < 0 || score > selectedAssignment.max_score) { toast.error(`Score must be 0–${selectedAssignment.max_score}`); return; }
    setGradingId(submissionId);
    try {
      const res = await fetch(`${API}/api/assignments/grade/${submissionId}?teacher_id=${user.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
        body: JSON.stringify({ score }),
      });
      if (res.ok) { toast.success('Grade saved!'); setScoreInputs(p => ({ ...p, [submissionId]: '' })); fetchSubmissions(selectedAssignment.id); fetchPendingCounts(); }
      else throw new Error();
    } catch { toast.error('Failed to grade'); }
    finally { setGradingId(null); }
  };

  const handleDownload = async (type, id) => {
    try {
      const res = await fetch(`${API}/api/files/download/${type}/${id}`, { headers: { Authorization: `Bearer ${user.accessToken}` } });
      if (!res.ok) throw new Error();
      const cd = res.headers.get('content-disposition');
      const name = cd?.match(/filename="(.+)"/)?.[1] || 'file.pdf';
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  const handlePlagReview = async (action) => {
    if (!plagReviewModal) return;
    setPlagSubmitting(true);
    try {
      const fd = new FormData(); fd.append('action', action); fd.append('remark', plagRemark);
      const res = await fetch(`${API}/api/plagiarism/review/${plagReviewModal.submission_id}`, {
        method: 'POST', headers: { Authorization: `Bearer ${user.accessToken}` }, body: fd,
      });
      if (res.ok) { toast.success(`Submission ${action}d!`); setPlagReviewModal(null); setPlagRemark(''); fetchFlagged(); if (selectedAssignment) fetchSubmissions(selectedAssignment.id); }
      else throw new Error();
    } catch { toast.error('Review failed'); }
    finally { setPlagSubmitting(false); }
  };

  // Inline plagiarism review from submissions modal
  const handleInlineReview = async (submissionId, action, remark) => {
    setReviewingId(submissionId);
    try {
      const fd = new FormData(); fd.append('action', action); fd.append('remark', remark || '');
      const res = await fetch(`${API}/api/plagiarism/review/${submissionId}`, {
        method: 'POST', headers: { Authorization: `Bearer ${user.accessToken}` }, body: fd,
      });
      if (res.ok) { toast.success(`Submission ${action}d!`); fetchSubmissions(selectedAssignment.id); fetchFlagged(); }
      else throw new Error();
    } catch { toast.error('Review failed'); }
    finally { setReviewingId(null); }
  };

  // ─── Derived ────────────────────────────────────────────────────────────────
  const filtered = assignments.filter(a => {
    const q = searchTerm.toLowerCase();
    return (a.title.toLowerCase().includes(q) || a.course_title?.toLowerCase().includes(q))
      && (courseFilter === 'all' || a.course_id === courseFilter);
  });

  const flaggedCount = flagged.length;
  const highCount = flagged.filter(f => f.plagiarism_risk === 'High').length;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <TeacherDashboardLayout>
      <div className="min-h-screen teacher-page-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Page Header ── */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-serif text-gray-900 mb-1 flex items-center gap-2">
                <ClipboardList className="w-7 h-7 text-blue-600" />
                Assignment Management
              </h1>
              <p className="text-sm text-gray-500">Create, grade, and review submissions across all your courses.</p>
            </div>
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <button onClick={() => { fetchAll(); fetchPendingCounts(); if (activeTab === 'plagiarism') fetchFlagged(); }}
                disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              {activeTab === 'assignments' && (
                <button onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md transition-all">
                  <Plus className="w-4 h-4" /> Create Assignment
                </button>
              )}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
            {[
              { key: 'assignments', label: 'All Assignments', icon: FileText, count: assignments.length },
              { key: 'plagiarism', label: 'Plagiarism Review', icon: ShieldAlert, count: flaggedCount, urgent: highCount > 0 },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${active ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab.urgent ? 'bg-red-500 text-white animate-pulse' : active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>{tab.count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1 — ALL ASSIGNMENTS                                           */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'assignments' && (
            <>
              {/* Search + Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search assignments…" className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-300 focus:border-transparent transition" />
                </div>
                <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-300 text-gray-700 min-w-[180px]">
                  <option value="all">All Courses</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                  <RefreshCw className="w-7 h-7 animate-spin mr-3" /> Loading assignments…
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <FileText className="w-14 h-14 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">{searchTerm || courseFilter !== 'all' ? 'No results' : 'No assignments yet'}</h3>
                  <p className="text-sm text-gray-400 mb-5">{searchTerm || courseFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first assignment to get started'}</p>
                  {!searchTerm && courseFilter === 'all' && (
                    <button onClick={() => setShowCreateModal(true)} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Create Assignment
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filtered.map((asg, i) => {
                    const submitted = asg.submission_count || 0;
                    const total = asg.total_students || 0;
                    const pct = total > 0 ? Math.round(submitted / total * 100) : 0;
                    const isPast = new Date(asg.due_date) < new Date();
                    const pending = pendingCounts[asg.id] || 0;
                    return (
                      <motion.div key={asg.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">{asg.title}</h3>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                  <BookOpen className="w-3.5 h-3.5" /> {asg.course_title}
                                </div>
                              </div>
                            </div>
                            {asg.description && <p className="text-sm text-gray-500 line-clamp-1 mb-3 pl-13">{asg.description}</p>}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                              <span className={`flex items-center gap-1 font-medium ${isPast ? 'text-red-500' : 'text-gray-600'}`}>
                                <Calendar className="w-3.5 h-3.5" /> Due {formatDateShort(asg.due_date)}
                                {isPast && <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs">Overdue</span>}
                              </span>
                              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {submitted}/{total} submitted ({pct}%)</span>
                              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Max: {asg.max_score} pts</span>
                              {pending > 0 && (
                                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                                  <Clock className="w-3.5 h-3.5" /> {pending} pending
                                </span>
                              )}
                            </div>
                            {/* Submission progress bar */}
                            <div className="mt-3 w-full max-w-xs">
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {asg.file_url && (
                              <button onClick={() => handleDownload('assignment', asg.id)}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                                <Download className="w-4 h-4" /> Download
                              </button>
                            )}
                            <button onClick={() => { setSelectedAssignment(asg); setSubmissions([]); setExpandedPlagiarism({}); setRemarkInputs({}); setScoreInputs({}); fetchSubmissions(asg.id); }}
                              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors font-medium">
                              <Eye className="w-4 h-4" /> View Submissions
                              {pending > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-amber-400 text-white text-xs flex items-center justify-center font-bold">{pending}</span>}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 2 — PLAGIARISM REVIEW                                         */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'plagiarism' && (
            <>
              {/* Stats bar */}
              {!flaggedLoading && flagged.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Total Flagged', value: flagged.length, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
                    { label: 'High Risk', value: highCount, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
                    { label: 'Pending Review', value: flagged.filter(f => !f.plagiarism_status?.includes('Teacher')).length, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} ${s.border} border rounded-xl p-4 text-center`}>
                      <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {flaggedLoading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                  <RefreshCw className="w-7 h-7 animate-spin mr-3" /> Loading flagged submissions…
                </div>
              ) : flagged.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                  <ShieldCheck className="w-16 h-16 mx-auto text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">All Clear!</h3>
                  <p className="text-sm text-gray-400 mt-1">No flagged or moderate-risk submissions found.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Student', 'Assignment', 'Similarity', 'Risk Level', 'Status', 'Submitted', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {flagged.map((sub, i) => {
                        const rc = RISK[sub.plagiarism_risk] || RISK.Low;
                        const RiskIcon = rc.icon;
                        const sim = Math.round((sub.plagiarism_similarity || 0) * 100);
                        const reviewed = sub.plagiarism_status?.includes('Teacher');
                        return (
                          <motion.tr key={sub.submission_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                            className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900">{sub.student_name}</td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-800 text-sm">{sub.assignment_title}</div>
                            </td>
                            <td className="px-4 py-3"><SimBar pct={sim} /></td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${rc.badge}`}>
                                <RiskIcon className="w-3.5 h-3.5" /> {sub.plagiarism_risk}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs ${reviewed ? 'text-green-600 font-medium' : 'text-amber-600'}`}>
                                {sub.plagiarism_status || 'Pending Review'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">{formatDateShort(sub.submitted_at)}</td>
                            <td className="px-4 py-3">
                              {!reviewed ? (
                                <button onClick={() => { setPlagReviewModal(sub); setPlagRemark(''); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                                  <Eye className="w-3.5 h-3.5" /> Review
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                  <CheckCircle className="w-3.5 h-3.5" /> Reviewed
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Plagiarism Review Modal */}
              <AnimatePresence>
                {plagReviewModal && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Review Submission</h3>
                        <button onClick={() => setPlagReviewModal(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Student: <span className="font-semibold text-gray-800">{plagReviewModal.student_name}</span></p>
                        <p className="text-sm text-gray-500">Assignment: <span className="font-medium text-gray-700">{plagReviewModal.assignment_title}</span></p>
                      </div>
                      {(() => {
                        const rc = RISK[plagReviewModal.plagiarism_risk] || RISK.Low;
                        const sim = Math.round((plagReviewModal.plagiarism_similarity || 0) * 100);
                        const RiskIcon = rc.icon;
                        return (
                          <div className={`p-4 rounded-xl border ${rc.border} ${rc.bg} mb-5`}>
                            <div className="flex items-center gap-2 mb-2">
                              <RiskIcon className={`w-5 h-5 ${rc.text}`} />
                              <span className={`font-semibold ${rc.text}`}>{plagReviewModal.plagiarism_risk} Risk Detected</span>
                            </div>
                            <SimBar pct={sim} />
                            <p className={`text-xs mt-2 ${rc.text}`}>This submission has {sim}% similarity to another submission in the same assignment.</p>
                          </div>
                        );
                      })()}
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MessageSquare className="inline w-4 h-4 mr-1" />Remark for student (optional)
                      </label>
                      <textarea value={plagRemark} onChange={e => setPlagRemark(e.target.value)} rows={3}
                        placeholder="Add feedback for the student about this plagiarism finding…"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 resize-none mb-4" />
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => setPlagReviewModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={() => handlePlagReview('reject')} disabled={plagSubmitting}
                          className="px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-1.5 font-medium disabled:opacity-50">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button onClick={() => handlePlagReview('approve')} disabled={plagSubmitting}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1.5 font-medium disabled:opacity-50">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* CREATE ASSIGNMENT MODAL                                                 */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Plus className="w-5 h-5 text-blue-600" /> Create New Assignment</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                  <select value={formData.course_id} onChange={e => setFormData({ ...formData, course_id: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 bg-white">
                    <option value="">Select a course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Assignment title" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Instructions for students…" rows={4} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                    <input type="datetime-local" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Score</label>
                    <input type="number" value={formData.max_score} min={1} max={1000}
                      onChange={e => setFormData({ ...formData, max_score: parseInt(e.target.value) })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference File (optional, PDF/DOCX, max 10 MB)</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">{assignmentFile ? assignmentFile.name : 'Click to upload'}</span>
                    <input type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={e => setAssignmentFile(e.target.files[0])} />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="late" checked={formData.allow_late_submission}
                    onChange={e => setFormData({ ...formData, allow_late_submission: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                  <label htmlFor="late" className="text-sm text-gray-700">Allow late submissions</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-7">
                <button onClick={() => setShowCreateModal(false)} className="px-5 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleCreateAssignment} disabled={creating || !formData.course_id || !formData.title || !formData.due_date}
                  className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {creating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating…</> : <><Plus className="w-4 h-4" /> Create Assignment</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* SUBMISSIONS / GRADING PANEL                                             */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedAssignment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setSelectedAssignment(null)}>
            <motion.div initial={{ scale: 0.97, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8"
              onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="flex items-start justify-between p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedAssignment.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> {selectedAssignment.course_title}
                    <span className="mx-1">·</span>
                    <Calendar className="w-3.5 h-3.5" /> Due {formatDateShort(selectedAssignment.due_date)}
                    <span className="mx-1">·</span>
                    <Award className="w-3.5 h-3.5" /> Max {selectedAssignment.max_score} pts
                  </p>
                </div>
                <button onClick={() => setSelectedAssignment(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Submissions Body */}
              <div className="p-6">
                {submissionsLoading ? (
                  <div className="flex items-center justify-center py-16 text-gray-400">
                    <RefreshCw className="w-7 h-7 animate-spin mr-3" /> Loading submissions…
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <h4 className="text-base font-semibold text-gray-500">No submissions yet</h4>
                    <p className="text-sm text-gray-400 mt-1">Students haven't submitted this assignment yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Plagiarism alert banner */}
                    {submissions.some(s => s.plagiarism_risk === 'High' || s.plagiarism_risk === 'Moderate') && (
                      <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <ShieldAlert className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-red-700">Plagiarism Detected</p>
                            <p className="text-xs text-red-500 mt-0.5">
                              {submissions.filter(s => s.plagiarism_risk === 'High').length} high-risk,{' '}
                              {submissions.filter(s => s.plagiarism_risk === 'Moderate').length} moderate-risk submission(s).
                              {' '}Expand flagged rows below to review and take action.
                            </p>
                          </div>
                        </div>
                        <button onClick={() => { setSelectedAssignment(null); setActiveTab('plagiarism'); fetchFlagged(); }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                          <ExternalLink className="w-3.5 h-3.5" /> Full Review
                        </button>
                      </div>
                    )}

                    {submissions.map(sub => {
                      const risk = sub.plagiarism_risk;
                      const isFlagged = risk === 'High' || risk === 'Moderate';
                      const rc = RISK[risk] || RISK.Low;
                      const sim = Math.round((sub.plagiarism_similarity || 0) * 100);
                      const plagExpanded = expandedPlagiarism[sub.id];
                      const remark = remarkInputs[sub.id] || '';
                      const isReviewed = sub.plagiarism_status?.includes('Teacher');
                      const isGraded = sub.status === 'reviewed';
                      const reviewing = reviewingId === sub.id;
                      const grading = gradingId === sub.id;
                      const RiskIcon = rc.icon;

                      return (
                        <div key={sub.id} className={`rounded-xl border transition-all ${isFlagged && !isReviewed
                            ? (risk === 'High' ? 'border-red-300 bg-red-50/30' : 'border-orange-300 bg-orange-50/30')
                            : 'border-gray-200 bg-white'
                          }`}>
                          {/* Submission row */}
                          <div className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm flex-shrink-0">
                                  {(sub.student_name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-gray-900 text-sm">{sub.student_name}</span>
                                    <span className="text-xs text-gray-400">{sub.student_email}</span>
                                    {/* Status badge */}
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isGraded ? 'bg-green-100 text-green-700' : sub.is_late_submission ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                      }`}>
                                      {isGraded ? 'Graded' : sub.is_late_submission ? 'Late' : 'Submitted'}
                                    </span>
                                    {/* Plagiarism badge */}
                                    {risk && risk !== 'Low' && (
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${rc.badge}`}>
                                        <RiskIcon className="w-3 h-3" /> {risk} Risk · {sim}%
                                      </span>
                                    )}
                                    {risk === 'Low' && sim > 0 && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-green-600 bg-green-50 border border-green-200">
                                        <ShieldCheck className="w-3 h-3" /> Checked · {sim}%
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 mt-0.5">Submitted {formatDate(sub.submitted_at)}</p>
                                </div>
                              </div>

                              {/* Score display if graded */}
                              {isGraded && sub.score !== null && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                                  <Star className="w-3.5 h-3.5 text-green-600" />
                                  <span className="text-sm font-bold text-green-700">{sub.score}<span className="font-normal text-green-500">/{selectedAssignment.max_score}</span></span>
                                </div>
                              )}

                              {/* Action buttons */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => handleDownload('submission', sub.id)}
                                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                                  <Download className="w-4 h-4" /> Download
                                </button>
                                {isFlagged && !isReviewed && (
                                  <button onClick={() => setExpandedPlagiarism(p => ({ ...p, [sub.id]: !p[sub.id] }))}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors font-medium ${risk === 'High' ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100' : 'text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100'
                                      }`}>
                                    <ShieldAlert className="w-4 h-4" />
                                    {plagExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Hide</> : <><ChevronDown className="w-3.5 h-3.5" /> Review</>}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Grade Panel (for non-graded submissions) */}
                            {!isGraded && (
                              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-gray-400" />
                                  <span className="text-xs font-medium text-gray-600">Grade:</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input type="number" min={0} max={selectedAssignment.max_score}
                                    value={scoreInputs[sub.id] ?? ''}
                                    onChange={e => setScoreInputs(p => ({ ...p, [sub.id]: e.target.value }))}
                                    placeholder={`0–${selectedAssignment.max_score}`}
                                    className="w-24 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-300 bg-white" />
                                  <span className="text-xs text-gray-400">/ {selectedAssignment.max_score} pts</span>
                                  <button onClick={() => handleGrade(sub.id)} disabled={grading || !scoreInputs[sub.id]}
                                    className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 flex items-center gap-1.5 transition-colors">
                                    {grading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                    {grading ? 'Saving…' : 'Save Grade'}
                                  </button>
                                </div>
                                {sub.feedback && <span className="text-xs text-gray-500 italic truncate max-w-xs">{sub.feedback}</span>}
                              </div>
                            )}
                          </div>

                          {/* ── Plagiarism Expanded Panel ── */}
                          <AnimatePresence>
                            {plagExpanded && isFlagged && !isReviewed && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className={`border-t ${rc.border} overflow-hidden`}>
                                <div className={`p-4 ${rc.bg}`}>
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${risk === 'High' ? 'bg-red-100' : 'bg-orange-100'}`}>
                                      <RiskIcon className={`w-4 h-4 ${rc.text}`} />
                                    </div>
                                    <div>
                                      <p className={`text-sm font-bold ${rc.text}`}>{risk} Plagiarism Risk — {sim}% Similarity Detected</p>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        This submission matches another student's work in this assignment. Review and decide whether to approve or reject.
                                      </p>
                                      <div className="mt-2"><SimBar pct={sim} /></div>
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                      <MessageSquare className="inline w-3.5 h-3.5 mr-1" />Teacher Remark (sent to student)
                                    </label>
                                    <textarea value={remark} rows={2}
                                      onChange={e => setRemarkInputs(p => ({ ...p, [sub.id]: e.target.value }))}
                                      placeholder="Optional note for the student explaining your decision…"
                                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 resize-none bg-white" />
                                  </div>
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => setExpandedPlagiarism(p => ({ ...p, [sub.id]: false }))}
                                      className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                                      Cancel
                                    </button>
                                    <button onClick={() => handleInlineReview(sub.id, 'reject', remark)} disabled={reviewing}
                                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-300 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors">
                                      {reviewing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                      Reject Submission
                                    </button>
                                    <button onClick={() => handleInlineReview(sub.id, 'approve', remark)} disabled={reviewing}
                                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                                      {reviewing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                      Approve Submission
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TeacherDashboardLayout>
  );
};

export default TeacherAssignments;
