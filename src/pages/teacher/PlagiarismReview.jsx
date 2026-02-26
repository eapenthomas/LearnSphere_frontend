import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { toast } from 'react-hot-toast';
import {
    ShieldAlert, ShieldCheck, ShieldQuestion,
    RefreshCw, CheckCircle, XCircle, MessageSquare, Eye
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const RISK_CONFIG = {
    High: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-100 text-red-700', icon: ShieldAlert, rowBg: 'bg-red-50/60' },
    Moderate: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', icon: ShieldQuestion, rowBg: 'bg-orange-50/40' },
    Low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700', icon: ShieldCheck, rowBg: '' },
};

const TeacherPlagiarismReview = () => {
    const { user } = useAuth();
    const [flagged, setFlagged] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState(null); // { sub, action }
    const [remark, setRemark] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => { if (user?.id) fetchFlagged(); }, [user]);

    const fetchFlagged = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/plagiarism/flagged/${user.id}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            if (res.ok) setFlagged(await res.json());
            else throw new Error();
        } catch {
            toast.error('Failed to load flagged submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (action) => {
        if (!reviewModal) return;
        setSubmittingReview(true);
        try {
            const formData = new FormData();
            formData.append('action', action);
            formData.append('remark', remark);

            const res = await fetch(`${API}/api/plagiarism/review/${reviewModal.submission_id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${user.accessToken}` },
                body: formData,
            });

            if (res.ok) {
                toast.success(`Submission ${action}d successfully!`);
                setReviewModal(null);
                setRemark('');
                fetchFlagged();
            } else throw new Error();
        } catch {
            toast.error('Failed to update submission');
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <ShieldAlert className="w-6 h-6 text-red-500" />
                                Plagiarism Review
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {flagged.length} submission{flagged.length !== 1 ? 's' : ''} flagged for review
                            </p>
                        </div>
                        <button
                            onClick={fetchFlagged}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                            <span className="ml-3 text-gray-500">Loading flagged submissions...</span>
                        </div>
                    ) : flagged.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <ShieldCheck className="w-16 h-16 mx-auto text-green-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700">All Clear!</h3>
                            <p className="text-gray-500 text-sm mt-1">No flagged or moderate-risk submissions found.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        {['Student', 'Assignment', 'Similarity', 'Risk', 'Status', 'Submitted', 'Actions'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {flagged.map((sub, i) => {
                                        const rc = RISK_CONFIG[sub.plagiarism_risk] || RISK_CONFIG.Low;
                                        const RiskIcon = rc.icon;
                                        const sim = Math.round((sub.plagiarism_similarity || 0) * 100);
                                        const isReviewed = sub.plagiarism_status?.includes('Teacher');

                                        return (
                                            <motion.tr
                                                key={sub.submission_id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className={`hover:bg-gray-50 transition-colors ${rc.rowBg}`}
                                            >
                                                <td className="px-4 py-3 font-medium text-gray-900">{sub.student_name}</td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    <div>{sub.assignment_title}</div>
                                                    <div className="text-xs text-gray-400">{sub.course_id}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${sim >= 80 ? 'bg-red-500' : sim >= 60 ? 'bg-orange-400' : 'bg-green-400'}`}
                                                                style={{ width: `${sim}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-semibold ${sim >= 80 ? 'text-red-600' : sim >= 60 ? 'text-orange-600' : 'text-green-600'}`}>
                                                            {sim}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${rc.badge}`}>
                                                        <RiskIcon className="w-3 h-3" />
                                                        {sub.plagiarism_risk}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">{sub.plagiarism_status || '—'}</td>
                                                <td className="px-4 py-3 text-xs text-gray-400">{formatDate(sub.submitted_at)}</td>
                                                <td className="px-4 py-3">
                                                    {!isReviewed ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => { setReviewModal(sub); setRemark(''); }}
                                                                title="Review"
                                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => { setReviewModal(sub); handleReview('approve'); }}
                                                                title="Approve"
                                                                className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => { setReviewModal(sub); handleReview('reject'); }}
                                                                title="Reject"
                                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">{sub.plagiarism_status}</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Review Modal */}
                    {reviewModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Review Submission</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    <span className="font-medium text-gray-700">{reviewModal.student_name}</span> — {reviewModal.assignment_title}
                                </p>

                                <div className={`p-3 rounded-lg mb-4 ${RISK_CONFIG[reviewModal.plagiarism_risk]?.bg || 'bg-gray-50'} border ${RISK_CONFIG[reviewModal.plagiarism_risk]?.border || 'border-gray-200'}`}>
                                    <p className={`text-sm font-medium ${RISK_CONFIG[reviewModal.plagiarism_risk]?.text || 'text-gray-700'}`}>
                                        {reviewModal.plagiarism_risk} Risk — {Math.round((reviewModal.plagiarism_similarity || 0) * 100)}% similarity
                                    </p>
                                </div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MessageSquare className="inline w-4 h-4 mr-1" />
                                    Remark (optional)
                                </label>
                                <textarea
                                    value={remark}
                                    onChange={e => setRemark(e.target.value)}
                                    rows={3}
                                    placeholder="Add a note for the student..."
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-transparent mb-4 resize-none"
                                />

                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => { setReviewModal(null); setRemark(''); }}
                                        className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleReview('reject')}
                                        disabled={submittingReview}
                                        className="px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-1"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleReview('approve')}
                                        disabled={submittingReview}
                                        className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Approve
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
};

export default TeacherPlagiarismReview;
