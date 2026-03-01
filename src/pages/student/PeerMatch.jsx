import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import StudentDashboardLayout from '../../components/DashboardLayout.jsx';
import axios from 'axios';
import {
    Users, BookOpen, Star, TrendingUp, TrendingDown,
    Search, RefreshCw, ChevronRight, Zap, Award,
    CheckCircle, AlertCircle, HelpCircle, Sparkles
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ─── Skill tag component ──────────────────────────────────────────────────────
const Tag = ({ label, variant }) => {
    const styles = {
        strong: 'bg-green-100 text-green-700 border border-green-200',
        weak: 'bg-red-100 text-red-600 border border-red-200',
        help: 'bg-blue-100 text-blue-700 border border-blue-200',
        muted: 'bg-gray-100 text-gray-500 border border-gray-200',
    };
    // Trim the "Quiz: " / "Assignment: " prefix for compact display
    const short = label.replace(/^(Quiz|Assignment):\s*/, '');
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[variant] || styles.muted}`}>
            {short}
        </span>
    );
};

// ─── Compatibility ring ───────────────────────────────────────────────────────
const CompatRing = ({ pct }) => {
    const color = pct >= 75 ? '#22c55e' : pct >= 55 ? '#f59e0b' : '#6366f1';
    const r = 28, circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
            </svg>
            <span className="text-lg font-extrabold" style={{ color }}>{pct}%</span>
        </div>
    );
};

// ─── Match card ───────────────────────────────────────────────────────────────
const MatchCard = ({ match, index }) => {
    const { name, compatibility_pct, can_help_me, i_help_them, their_strengths } = match;
    const initials = name.charAt(0).toUpperCase();

    const avatarColors = ['from-violet-500 to-purple-700', 'from-blue-500 to-cyan-600', 'from-emerald-500 to-teal-600'];
    const gradient = avatarColors[index % avatarColors.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col gap-4"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-bold shadow`}>
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {compatibility_pct >= 75 ? 'Excellent match' : compatibility_pct >= 55 ? 'Good match' : 'Potential match'}
                    </div>
                </div>
                <CompatRing pct={compatibility_pct} />
            </div>

            {/* They can help me */}
            {can_help_me.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> {name} can help you with:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {can_help_me.map(lbl => <Tag key={lbl} label={lbl} variant="help" />)}
                    </div>
                </div>
            )}

            {/* I can help them */}
            {i_help_them.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-green-500" /> You can help {name} with:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {i_help_them.map(lbl => <Tag key={lbl} label={lbl} variant="strong" />)}
                    </div>
                </div>
            )}

            {/* Their strengths (fallback if no explicit gaps found) */}
            {can_help_me.length === 0 && i_help_them.length === 0 && their_strengths.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" /> {name}'s strengths:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {their_strengths.map(lbl => <Tag key={lbl} label={lbl} variant="muted" />)}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const PeerMatch = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch enrolled courses for dropdown
    useEffect(() => {
        if (!user?.id) return;
        setCoursesLoading(true);
        axios.get(`${API}/api/peer-match/courses/${user.id}`, {
            headers: { Authorization: `Bearer ${user.accessToken}` },
        })
            .then(r => { setCourses(r.data || []); if (r.data?.length) setSelectedCourse(r.data[0].id); })
            .catch(() => setError('Could not load your enrolled courses.'))
            .finally(() => setCoursesLoading(false));
    }, [user]);

    const findMatches = useCallback(async () => {
        if (!selectedCourse || !user?.id) return;
        setLoading(true);
        setResult(null);
        setError('');
        try {
            const res = await axios.get(`${API}/api/peer-match/${selectedCourse}`, {
                params: { student_id: user.id },
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            setResult(res.data);
        } catch (e) {
            setError(e.response?.data?.detail || 'Failed to find matches. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [selectedCourse, user]);

    const courseName = courses.find(c => c.id === selectedCourse)?.title || '';

    return (
        <StudentDashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    {/* ── Hero header ── */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg mb-4">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 font-serif mb-2">Study Buddy Finder</h1>
                        <p className="text-gray-500 text-base max-w-lg mx-auto">
                            Our AI matches you with classmates whose strengths cover your weak spots — and vice versa — so you both level up together.
                        </p>
                    </div>

                    {/* ── Course picker + button ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4 text-indigo-500" /> Select Course
                                </label>
                                {coursesLoading ? (
                                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                                ) : (
                                    <select
                                        value={selectedCourse}
                                        onChange={e => { setSelectedCourse(e.target.value); setResult(null); setError(''); }}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                                    >
                                        {courses.length === 0
                                            ? <option value="">No enrolled courses found</option>
                                            : courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)
                                        }
                                    </select>
                                )}
                            </div>
                            <button
                                onClick={findMatches}
                                disabled={loading || !selectedCourse || coursesLoading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading
                                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Finding…</>
                                    : <><Zap className="w-4 h-4" /> Find My Study Buddy</>
                                }
                            </button>
                        </div>
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                        </div>
                    )}

                    {/* ── Results ── */}
                    <AnimatePresence>
                        {result && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                                {/* My skill snapshot */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                                    <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                                        <Search className="w-4 h-4 text-indigo-500" /> Your Skill Snapshot in <span className="text-indigo-600">{courseName}</span>
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {result.my_strengths.length > 0 && (
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Strong</p>
                                                <div className="flex flex-wrap gap-1.5">{result.my_strengths.map(l => <Tag key={l} label={l} variant="strong" />)}</div>
                                            </div>
                                        )}
                                        {result.my_weaknesses.length > 0 && (
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5 text-red-400" /> Needs work</p>
                                                <div className="flex flex-wrap gap-1.5">{result.my_weaknesses.map(l => <Tag key={l} label={l} variant="weak" />)}</div>
                                            </div>
                                        )}
                                        {result.my_strengths.length === 0 && result.my_weaknesses.length === 0 && (
                                            <p className="text-sm text-gray-400 flex items-center gap-1">
                                                <HelpCircle className="w-4 h-4" /> Complete some quizzes or assignments to see your skill profile.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Match cards */}
                                {result.matches.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <h3 className="text-base font-semibold text-gray-500">No matches found yet</h3>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {result.message || 'More students need to complete quizzes/assignments in this course.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-amber-400" />
                                            Top {result.matches.length} Study {result.matches.length === 1 ? 'Buddy' : 'Buddies'} for You
                                        </h2>
                                        <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-1">
                                            {result.matches.map((m, i) => <MatchCard key={m.student_id} match={m} index={i} />)}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Empty state before search ── */}
                    {!result && !loading && !error && (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 mx-auto rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                                <Users className="w-12 h-12 text-indigo-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-500 mb-1">Ready to find your study partner?</h3>
                            <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                Select a course above and click <strong>Find My Study Buddy</strong>. Our AI will match you with classmates who have complementary skills.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </StudentDashboardLayout>
    );
};

export default PeerMatch;
