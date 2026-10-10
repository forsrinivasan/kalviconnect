import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { formatDualTime } from '../utils/timeZone';
import {
  Users,
  Shield,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Calendar,
  Sparkles,
  Search,
  Check,
  X,
  Trash2,
  CalendarX,
  Clock,
  Video,
  Mail,
  Building,
  MapPin,
} from 'lucide-react';

export const CoordinatorDashboard: React.FC = () => {
  const {
    learners,
    mentors,
    sessions,
    safeguardingReports,
    coordinatorAdmin,
    matchLearner,
    unmatchLearner,
    approveMentor,
    resolveSafeguardingReport,
    approveUserRegistration,
    rejectUserRegistration,
    cancelSessionByCoordinator,
    deleteSessionByCoordinator,
    language,
  } = useApp();

  const t = getTranslation(language);

  const [activeTab, setActiveTab] = useState<'approvals' | 'events' | 'matching' | 'vetting' | 'safeguarding' | 'analytics'>('approvals');

  // Matching workbench state
  const [selectedLearnerForMatch, setSelectedLearnerForMatch] = useState<string | null>(null);
  const [searchMentorQuery, setSearchMentorQuery] = useState('');

  // Safeguarding Resolution state
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Cancel Session modal/state
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Rescheduled per coordinator review');

  // Stats
  const pendingLearnerApprovals = learners.filter(l => l.registrationStatus === 'pending_approval');
  const pendingMentorApprovals = mentors.filter(m => m.registrationStatus === 'pending_approval');
  const totalPendingApprovals = pendingLearnerApprovals.length + pendingMentorApprovals.length;

  const totalLearners = learners.length;
  const verifiedMentorsCount = mentors.filter(m => m.vettingStatus === 'verified').length;
  const activePairsCount = learners.filter(l => Boolean(l.assignedMentorId)).length;
  const completedSessionsCount = sessions.filter(s => s.status === 'completed').length;
  const openReportsCount = safeguardingReports.filter(r => r.status === 'open').length;

  const unmatchedLearners = learners.filter(l => !l.assignedMentorId && l.registrationStatus === 'approved');
  const matchedLearners = learners.filter(l => Boolean(l.assignedMentorId));
  const availableMentors = mentors.filter(m => m.vettingStatus === 'verified' && m.registrationStatus === 'approved');

  const targetLearnerToMatch = learners.find(l => l.id === selectedLearnerForMatch);

  const handleExecuteMatch = (mentorId: string) => {
    if (!selectedLearnerForMatch) return;
    matchLearner(selectedLearnerForMatch, mentorId);
    setSelectedLearnerForMatch(null);
  };

  const handleResolveReport = (reportId: string) => {
    if (!resolutionNote.trim()) return;
    resolveSafeguardingReport(reportId, resolutionNote);
    setResolvingReportId(null);
    setResolutionNote('');
  };

  const handleConfirmCancelSession = (sessionId: string) => {
    cancelSessionByCoordinator(sessionId, cancelReason);
    setCancellingSessionId(null);
    setCancelReason('Rescheduled per coordinator review');
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to completely delete this session from the platform? This cannot be undone.')) {
      deleteSessionByCoordinator(sessionId);
    }
  };

  const exportCsv = () => {
    const headers = ['Learner Name', 'Email', 'District', 'College', 'Track', 'Status', 'Assigned Mentor', 'Milestones Done'];
    const rows = learners.map(l => {
      const mentor = mentors.find(m => m.id === l.assignedMentorId);
      const done = l.milestones.filter(m => m.status === 'completed').length;
      return [
        `"${l.name}"`,
        `"${l.email}"`,
        `"${l.district}"`,
        `"${l.partnerInstitution}"`,
        `"${l.trackId}"`,
        `"${l.registrationStatus}"`,
        `"${mentor?.name || 'Unassigned'}"`,
        `"${done} of 6"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kalvi-cohort-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title & Administrator Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Super Administrator Account: <strong>{coordinatorAdmin.email}</strong> ({coordinatorAdmin.name})</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.coordinator.dashboardTitle}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Full administrative authority: Approve User Registrations · Manage & Cancel Events · Cohort Matching
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>{t.coordinator.exportReport}</span>
        </button>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`p-4 rounded-xl border shadow-xs transition-colors ${
          totalPendingApprovals > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'
        }`}>
          <span className="text-xs font-medium text-slate-600 block">Pending Registrations</span>
          <span className={`text-2xl font-bold mt-1 block tabular-nums ${totalPendingApprovals > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
            {totalPendingApprovals}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Requires your sign-off</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">{t.coordinator.stats.enrolledLearners}</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block tabular-nums">{totalLearners}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">5 TN districts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">{t.coordinator.stats.verifiedMentors}</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block tabular-nums">{verifiedMentorsCount}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Global diaspora</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">{t.coordinator.stats.activePairings}</span>
          <span className="text-2xl font-bold text-amber-800 mt-1 block tabular-nums">{activePairsCount}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{unmatchedLearners.length} ready to pair</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total Events Scheduled</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block tabular-nums">{sessions.length}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{completedSessionsCount} completed</span>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs ${
          openReportsCount > 0 ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <span className="text-xs font-medium text-slate-500 block">{t.coordinator.stats.openConcerns}</span>
          <span className={`text-2xl font-bold mt-1 block tabular-nums ${openReportsCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>
            {openReportsCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Confidential review</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-6 text-xs font-semibold overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 transition-colors flex items-center gap-1.5 border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'approvals'
              ? 'border-amber-800 text-amber-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>User Approvals Queue</span>
          {totalPendingApprovals > 0 && (
            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {totalPendingApprovals}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 transition-colors flex items-center gap-1.5 border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'events'
              ? 'border-amber-800 text-amber-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events & Sessions Manager</span>
          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
            {sessions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matching')}
          className={`pb-3 transition-colors flex items-center gap-1.5 border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'matching'
              ? 'border-amber-800 text-amber-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.coordinator.matchWorkbench}</span>
        </button>

        <button
          onClick={() => setActiveTab('safeguarding')}
          className={`pb-3 transition-colors flex items-center gap-1.5 border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'safeguarding'
              ? 'border-red-700 text-red-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-700" />
          <span>{t.coordinator.safeguardingQueue}</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 transition-colors flex items-center gap-1.5 border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-amber-800 text-amber-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{t.coordinator.cohortMetrics}</span>
        </button>
      </div>

      {/* TAB 1: USER REGISTRATIONS & APPROVALS (Item 2) */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 text-xs text-amber-950 flex items-start gap-3">
            <Shield className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Administrator Approval Authority</p>
              <p className="text-slate-700 leading-relaxed">
                As the Coordinator / Administrator (<code>{coordinatorAdmin.email}</code>), you review all new email-registered learners and global mentors before they can join active mentoring cohorts or book sessions.
              </p>
            </div>
          </div>

          {/* Pending Learners */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Learners Awaiting Approval ({pendingLearnerApprovals.length})</span>
              <span className="text-xs text-slate-500 font-normal">Registered via Email & OTP</span>
            </h3>

            {pendingLearnerApprovals.length > 0 ? (
              <div className="space-y-3">
                {pendingLearnerApprovals.map(learner => (
                  <div
                    key={learner.id}
                    className="p-4 rounded-lg border border-amber-200 bg-amber-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{learner.name}</span>
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          OTP Verified
                        </span>
                        <span className="text-[10px] text-slate-500">Registered: {learner.registeredAt}</span>
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{learner.email}</span>
                        <span>·</span>
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{learner.partnerInstitution} ({learner.district})</span>
                      </p>
                      <p className="text-xs text-slate-700 italic pt-1">
                        Goal: "{learner.primaryGoal}"
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => approveUserRegistration(learner.id, 'learner')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Learner</span>
                      </button>
                      <button
                        onClick={() => rejectUserRegistration(learner.id, 'learner')}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                No pending learner registrations at this time.
              </div>
            )}
          </div>

          {/* Pending Mentors */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Volunteers / Mentors Awaiting Approval ({pendingMentorApprovals.length})</span>
              <span className="text-xs text-slate-500 font-normal">Global volunteer applicants</span>
            </h3>

            {pendingMentorApprovals.length > 0 ? (
              <div className="space-y-3">
                {pendingMentorApprovals.map(mentor => (
                  <div
                    key={mentor.id}
                    className="p-4 rounded-lg border border-amber-200 bg-amber-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{mentor.name}</span>
                        <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                          {mentor.timezoneLabel}
                        </span>
                        <span className="text-[10px] text-slate-500">Registered: {mentor.registeredAt}</span>
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{mentor.email}</span>
                        <span>·</span>
                        <span>{mentor.role} at {mentor.organization} ({mentor.city}, {mentor.country})</span>
                      </p>
                      <p className="text-xs text-slate-700 italic pt-1">
                        "{mentor.bio}"
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => approveUserRegistration(mentor.id, 'mentor')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Volunteer</span>
                      </button>
                      <button
                        onClick={() => rejectUserRegistration(mentor.id, 'mentor')}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                No pending volunteer mentor applications at this time.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EVENTS & SESSIONS MANAGEMENT (Item 4 - Cancel or Delete Events) */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Scheduled Mentoring Events & Session Governance
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  View all active, upcoming, completed, and cancelled sessions. As Coordinator, you have authority to cancel or permanently delete any event.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {sessions.map(session => {
                const learner = learners.find(l => l.id === session.learnerId);
                const mentor = mentors.find(m => m.id === session.mentorId);
                const dualTime = mentor
                  ? formatDualTime(session.scheduledTimeUTC, mentor.timezone)
                  : null;

                const isCancelling = cancellingSessionId === session.id;

                return (
                  <div
                    key={session.id}
                    className={`p-4 rounded-lg border transition-all ${
                      session.status === 'cancelled'
                        ? 'border-red-200 bg-red-50/20 opacity-80'
                        : session.status === 'completed'
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            Week {session.weekNumber} Mentoring Session
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            session.status === 'upcoming'
                              ? 'bg-amber-100 text-amber-900'
                              : session.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                          <span>Learner: <strong className="text-slate-900">{learner?.name || 'Learner'}</strong> ({learner?.district})</span>
                          <span>⟷</span>
                          <span>Mentor: <strong className="text-slate-900">{mentor?.name || 'Mentor'}</strong> ({mentor?.city})</span>
                        </div>

                        {dualTime && (
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1.5 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-800" />
                              <span>IST: {dualTime.istTime} ({dualTime.istDate})</span>
                            </span>
                            <span>·</span>
                            <span>Mentor Time: {dualTime.mentorTime} ({dualTime.mentorDate})</span>
                          </div>
                        )}

                        {session.cancellationReason && (
                          <div className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">
                            <strong>Cancelled by Coordinator:</strong> {session.cancellationReason}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="shrink-0 flex items-center gap-2 pt-2 md:pt-0">
                        {session.status === 'upcoming' && (
                          <button
                            onClick={() => setCancellingSessionId(session.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors flex items-center gap-1"
                          >
                            <CalendarX className="w-3.5 h-3.5" />
                            <span>Cancel Session</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors flex items-center gap-1"
                          title="Permanently delete event record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* In-line cancellation reason drawer */}
                    {isCancelling && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md space-y-2 animate-in fade-in">
                        <label className="block text-xs font-semibold text-red-950">
                          Reason for cancelling this session:
                        </label>
                        <input
                          type="text"
                          value={cancelReason}
                          onChange={e => setCancelReason(e.target.value)}
                          placeholder="e.g. Rescheduled per college exam or volunteer time conflict..."
                          className="w-full text-xs p-2 bg-white border border-red-300 rounded focus:outline-hidden"
                          required
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setCancellingSessionId(null)}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                          >
                            Keep Session
                          </button>
                          <button
                            onClick={() => handleConfirmCancelSession(session.id)}
                            className="px-3 py-1 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded shadow-xs"
                          >
                            Confirm Cancellation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COORDINATOR MATCHING WORKBENCH */}
      {activeTab === 'matching' && (
        <div className="space-y-6">
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-4 text-xs text-amber-950 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Coordinator Matching Workbench</p>
              <p className="text-slate-700 leading-relaxed">
                {t.coordinator.matchWorkbenchDesc} Pair approved learners with mentors based on track expertise, timezone, and language.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Unmatched Learners List */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>{t.coordinator.unmatchedStudents}</span>
                <span className="text-xs text-slate-500 font-normal">({unmatchedLearners.length})</span>
              </h3>

              {unmatchedLearners.length > 0 ? (
                <div className="space-y-3">
                  {unmatchedLearners.map(learner => {
                    const isSelected = selectedLearnerForMatch === learner.id;
                    return (
                      <div
                        key={learner.id}
                        onClick={() => setSelectedLearnerForMatch(learner.id)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{learner.name}</span>
                          <span className="text-[11px] text-amber-900 font-semibold uppercase">{learner.trackId}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {learner.partnerInstitution} · {learner.district}
                        </p>
                        <p className="text-[11px] text-slate-700 italic mt-1 line-clamp-2">
                          "{learner.primaryGoal}"
                        </p>
                        <div className="mt-2 text-[10px] text-slate-500 flex justify-between items-center">
                          <span>Language: <strong className="capitalize">{learner.preferredLanguage}</strong></span>
                          <span className="text-amber-800 font-semibold">Click to Pair →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  All approved learners have assigned mentors!
                </div>
              )}

              {/* Matched Learners Quick List */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Active Pairings ({matchedLearners.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {matchedLearners.map(l => {
                    const mentor = mentors.find(m => m.id === l.assignedMentorId);
                    return (
                      <div key={l.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block text-[11px]">{l.name}</span>
                          <span className="text-[10px] text-slate-500">Paired with {mentor?.name || 'Mentor'}</span>
                        </div>
                        <button
                          onClick={() => unmatchLearner(l.id)}
                          className="text-[11px] font-semibold text-red-600 hover:underline"
                        >
                          Unmatch
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Mentor Selection Column */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedLearnerForMatch ? (
                    <span>
                      Select Mentor for <strong className="text-amber-800">{targetLearnerToMatch?.name}</strong>
                    </span>
                  ) : (
                    <span>{t.coordinator.approvedMentors}</span>
                  )}
                </h3>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchMentorQuery}
                    onChange={e => setSearchMentorQuery(e.target.value)}
                    placeholder="Search by skill, country..."
                    className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden"
                  />
                </div>
              </div>

              {selectedLearnerForMatch && targetLearnerToMatch && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs">
                  <span className="font-bold text-amber-950 block mb-0.5">Matching Criteria:</span>
                  <div className="text-slate-700 text-[11px] space-y-0.5">
                    <p>Track: <strong>{targetLearnerToMatch.trackId.toUpperCase()}</strong> · Goal: "{targetLearnerToMatch.primaryGoal}"</p>
                    <p>Language preference: <strong className="capitalize">{targetLearnerToMatch.preferredLanguage}</strong></p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {availableMentors
                  .filter(m =>
                    m.name.toLowerCase().includes(searchMentorQuery.toLowerCase()) ||
                    m.city.toLowerCase().includes(searchMentorQuery.toLowerCase()) ||
                    m.organization.toLowerCase().includes(searchMentorQuery.toLowerCase())
                  )
                  .map(mentor => {
                    const isTrackMatch = targetLearnerToMatch
                      ? mentor.trackSpecialties.includes(targetLearnerToMatch.trackId)
                      : false;

                    return (
                      <div
                        key={mentor.id}
                        className={`p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isTrackMatch
                            ? 'border-emerald-300 bg-emerald-50/20'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={mentor.avatarUrl || '/src/assets/images/avatar_mentor_lead_1791648043121.jpg'}
                            alt={mentor.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{mentor.name}</span>
                              {isTrackMatch && (
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  Track Match
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600">
                              {mentor.role} · {mentor.organization}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {mentor.city}, {mentor.country} · {mentor.timezoneLabel} · Lang: {mentor.languages.join(', ')}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center justify-end">
                          {selectedLearnerForMatch ? (
                            <button
                              onClick={() => handleExecuteMatch(mentor.id)}
                              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-md transition-colors shadow-xs"
                            >
                              Assign This Mentor
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              {mentor.assignedLearnerIds.length} Active Mentees
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 4: SAFEGUARDING & ESCALATION QUEUE */}
      {activeTab === 'safeguarding' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-700" />
              <span>Safeguarding Lead Incident Queue</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Strictly confidential incident triage handled exclusively by the Lead Safeguarding Coordinator ({coordinatorAdmin.name}).
            </p>
          </div>

          <div className="space-y-4">
            {safeguardingReports.map(report => {
              const isOpen = report.status === 'open';

              return (
                <div
                  key={report.id}
                  className={`p-5 rounded-lg border space-y-3 ${
                    isOpen
                      ? 'border-red-300 bg-red-50/30'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Case #{report.id}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                          isOpen ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Reported on {report.dateReported} by {report.reporterName} ({report.reporterRole})
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1 capitalize">
                        Category: {report.category.replace('_', ' ')}
                      </p>
                    </div>

                    {isOpen && (
                      <button
                        onClick={() => setResolvingReportId(report.id)}
                        className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md"
                      >
                        Triage & Resolve
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 bg-white p-3 rounded border border-slate-200">
                    "{report.description}"
                  </p>

                  {report.resolutionNotes && (
                    <div className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded border border-emerald-200">
                      <span className="font-semibold block mb-0.5">Lead Resolution Note:</span>
                      <p className="text-[11px]">{report.resolutionNotes}</p>
                    </div>
                  )}

                  {resolvingReportId === report.id && (
                    <div className="p-3 bg-white border border-slate-300 rounded-lg space-y-2">
                      <label className="block text-xs font-semibold text-slate-800">
                        Safeguarding Lead Resolution Notes:
                      </label>
                      <textarea
                        value={resolutionNote}
                        onChange={e => setResolutionNote(e.target.value)}
                        placeholder="Detail corrective action, mentor conversation, and rematch arrangement..."
                        rows={2}
                        className="w-full text-xs p-2 border border-slate-300 rounded-md focus:outline-hidden"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setResolvingReportId(null)}
                          className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleResolveReport(report.id)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: COHORT ANALYTICS & EVIDENCE */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              {t.coordinator.cohortMetrics}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Evaluating baseline-to-milestone achievement in accordance with social impact principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="border border-slate-200 rounded-lg p-4 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Track Distribution</span>
              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex justify-between">
                  <span>Track A (Career Navigation)</span>
                  <span className="font-semibold tabular-nums">
                    {learners.filter(l => l.trackId === 'track-a').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Track B (Digital Skills & IT)</span>
                  <span className="font-semibold tabular-nums">
                    {learners.filter(l => l.trackId === 'track-b').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Track C (Communication & Readiness)</span>
                  <span className="font-semibold tabular-nums">
                    {learners.filter(l => l.trackId === 'track-c').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Attendance & Retention</span>
              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex justify-between">
                  <span>Completed Sessions</span>
                  <span className="font-semibold tabular-nums text-emerald-800">
                    {completedSessionsCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cancelled Sessions</span>
                  <span className="font-semibold tabular-nums text-red-700">
                    {sessions.filter(s => s.status === 'cancelled').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Satisfaction</span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    4.9 / 5.0
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Local Communities</span>
              <div className="space-y-1 text-xs pt-1 text-slate-700">
                <p>• Tirunelveli (St. Xavier’s Rural College)</p>
                <p>• Madurai (MKU Evening College)</p>
                <p>• Dharmapuri (Periyar Univ Extension)</p>
                <p>• Salem (Govt Arts College)</p>
                <p>• Thanjavur & Cuddalore Youth Centres</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
