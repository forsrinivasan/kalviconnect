import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { formatDualTime } from '../utils/timeZone';
import {
  ShieldCheck,
  Globe,
  Clock,
  CheckCircle2,
  Calendar,
  Video,
  FileCheck2,
  MessageSquare,
  Users,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface MentorDashboardProps {
  onOpenSchedule: () => void;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({ onOpenSchedule }) => {
  const {
    activeMentor,
    mentors,
    setActiveMentorId,
    learners,
    sessions,
    completeSession,
    verifyMilestoneTask,
    language,
  } = useApp();

  const t = getTranslation(language);

  // Mentees assigned to this mentor
  const assignedLearners = learners.filter(l =>
    activeMentor.assignedLearnerIds.includes(l.id) || l.assignedMentorId === activeMentor.id
  );

  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(
    assignedLearners[0]?.id || ''
  );

  const targetLearner = assignedLearners.find(l => l.id === selectedLearnerId) || assignedLearners[0];

  // Milestone review state
  const [reviewingWeek, setReviewingWeek] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Session completion log state
  const [logSessionId, setLogSessionId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [followUpItem, setFollowUpItem] = useState('');

  // Active mentor sessions
  const mentorSessions = sessions.filter(s => s.mentorId === activeMentor.id);
  const upcomingSession = mentorSessions.find(s => s.status === 'upcoming');

  const dualTime = upcomingSession && targetLearner
    ? formatDualTime(upcomingSession.scheduledTimeUTC, activeMentor.timezone)
    : null;

  const handleVerify = (weekNum: number) => {
    if (!targetLearner || !feedbackText.trim()) return;
    verifyMilestoneTask(targetLearner.id, weekNum, feedbackText);
    setReviewingWeek(null);
    setFeedbackText('');
  };

  const handleCompleteSession = (sessionId: string) => {
    if (!sessionNotes.trim()) return;
    completeSession(
      sessionId,
      sessionNotes,
      followUpItem ? [followUpItem] : []
    );
    setLogSessionId(null);
    setSessionNotes('');
    setFollowUpItem('');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Mentor Profile Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={activeMentor.avatarUrl || '/src/assets/images/avatar_mentor_lead_1791648043121.jpg'}
              alt={activeMentor.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {activeMentor.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.mentor.verifiedVolunteer}</span>
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-0.5">
                {activeMentor.role} · <span className="font-semibold">{activeMentor.organization}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeMentor.city}, {activeMentor.country}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-mono text-amber-900">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>{activeMentor.timezoneLabel}</span>
                </span>
                <span>·</span>
                <span>{activeMentor.weeklyCommitmentHours} {t.mentor.hoursPerWeek}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={onOpenSchedule}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-md transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.learner.scheduleNew}</span>
            </button>
          </div>
        </div>

        {/* Demo Switcher for Testing different Mentors */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {language === 'ta' ? 'சோதனை வழிகாட்டி மாற்றம்:' : 'Switch test mentor persona:'}
          </span>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {mentors.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMentorId(m.id);
                  const firstLearner = learners.find(l => l.assignedMentorId === m.id);
                  if (firstLearner) setSelectedLearnerId(firstLearner.id);
                }}
                className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors ${
                  m.id === activeMentor.id
                    ? 'bg-amber-800 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                {m.name} ({m.city})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Left (Upcoming Session & Mentees), Right (Milestone Review Portal) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Upcoming Session Widget */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>Next Mentoring Appointment</span>
              </h3>
              <span className="text-xs text-slate-500">45 minutes</span>
            </div>

            {upcomingSession && targetLearner && dualTime ? (
              <div className="space-y-4">
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-900 font-medium">
                    <span>With {targetLearner.name} · Week {upcomingSession.weekNumber}</span>
                    <span className="font-mono">{dualTime.timeDiffDescription}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-white p-2 rounded-md border border-amber-200/60 shadow-xs">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Your Time ({activeMentor.city})</span>
                      <span className="font-bold text-amber-900 text-sm block mt-0.5">{dualTime.mentorTime}</span>
                      <span className="text-[11px] text-slate-600">{dualTime.mentorDate}</span>
                    </div>

                    <div className="bg-white p-2 rounded-md border border-amber-200/60 shadow-xs">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Learner Time (India)</span>
                      <span className="font-bold text-slate-900 text-sm block mt-0.5">{dualTime.istTime}</span>
                      <span className="text-[11px] text-slate-600">{dualTime.istDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={upcomingSession.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Launch Google Meet</span>
                  </a>

                  <button
                    onClick={() => setLogSessionId(upcomingSession.id)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium py-2 px-3 rounded-md transition-colors border border-slate-200"
                  >
                    Log Completed
                  </button>
                </div>

                {/* Session Logger Drawer */}
                {logSessionId === upcomingSession.id && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 animate-in fade-in">
                    <h4 className="text-xs font-bold text-slate-900">
                      Record Session Summary & Follow-Ups
                    </h4>
                    <textarea
                      value={sessionNotes}
                      onChange={e => setSessionNotes(e.target.value)}
                      placeholder="Summary of topics covered, student questions, concepts clarified..."
                      rows={2}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md focus:outline-hidden"
                      required
                    />
                    <input
                      type="text"
                      value={followUpItem}
                      onChange={e => setFollowUpItem(e.target.value)}
                      placeholder="Follow-up task for learner before next week..."
                      className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-hidden"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setLogSessionId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCompleteSession(upcomingSession.id)}
                        className="px-3 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded"
                      >
                        Save & Mark Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">
                No active session scheduled with current mentees.
              </p>
            )}
          </div>

          {/* Assigned Mentees Selector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>{t.mentor.activeMentees}</span>
              <span className="text-slate-400 font-normal">({assignedLearners.length})</span>
            </h3>

            {assignedLearners.length > 0 ? (
              <div className="space-y-2">
                {assignedLearners.map(lrn => {
                  const completedCount = lrn.milestones.filter(m => m.status === 'completed').length;
                  const isSelected = lrn.id === (targetLearner?.id || '');

                  return (
                    <button
                      key={lrn.id}
                      onClick={() => setSelectedLearnerId(lrn.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{lrn.name}</span>
                        <span className="text-[11px] font-semibold text-amber-900 tabular-nums">
                          {completedCount} / 6 Weeks
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {lrn.partnerInstitution} · {lrn.district}
                      </p>
                      <p className="text-[11px] text-slate-600 italic mt-1 line-clamp-1">
                        "{lrn.primaryGoal}"
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">
                No mentees currently assigned. The programme coordinator will match students soon.
              </p>
            )}
          </div>

          {/* Safeguarding Boundaries Reminder */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Mentor Boundaries & Charter</span>
            </div>
            <ul className="text-slate-600 text-[11px] space-y-1 list-disc list-inside">
              <li>Use approved video links only (no private messaging/WhatsApp).</li>
              <li>Encourage and empower — never guarantee jobs or admission.</li>
              <li>Respect local cultural context and language comfort.</li>
            </ul>
          </div>

        </div>

        {/* Right Column (7 cols): Mentee 6-Week Curriculum & Submission Review */}
        <div className="lg:col-span-7 space-y-4">
          {targetLearner ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] text-amber-800 font-semibold uppercase">
                    Reviewing Student Curriculum
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    {targetLearner.name}’s 6-Week Progress
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Preferred Language</span>
                  <span className="text-xs font-semibold text-slate-800 capitalize">
                    {targetLearner.preferredLanguage}
                  </span>
                </div>
              </div>

              {/* Milestones List */}
              <div className="space-y-4">
                {targetLearner.milestones.map(m => {
                  const isReviewingThis = reviewingWeek === m.week;

                  return (
                    <div
                      key={m.week}
                      className={`p-4 rounded-lg border transition-all ${
                        m.status === 'submitted'
                          ? 'border-amber-300 bg-amber-50/20'
                          : m.status === 'completed'
                          ? 'border-emerald-200 bg-emerald-50/10'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {m.week}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {m.title}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {m.objective}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {m.status === 'completed' && (
                            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          )}
                          {m.status === 'submitted' && (
                            <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              Needs Your Review
                            </span>
                          )}
                          {m.status === 'pending' && (
                            <span className="text-xs text-slate-600">Pending</span>
                          )}
                        </div>
                      </div>

                      {/* Student Submission Display */}
                      {m.submission && (
                        <div className="mt-3 p-3 bg-white border border-slate-200 rounded-md text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">Learner's Work Submission:</span>
                            <span>{m.submittedAt}</span>
                          </div>
                          <p className="text-slate-800 font-mono text-[11px] break-all bg-slate-50 p-2 rounded">
                            {m.submission}
                          </p>
                        </div>
                      )}

                      {/* Mentor Feedback Display */}
                      {m.mentorFeedback && (
                        <div className="mt-2 p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-md text-xs space-y-0.5">
                          <span className="text-emerald-900 font-semibold text-[11px] block">
                            Your Verification Notes:
                          </span>
                          <p className="text-slate-700 text-[11px]">
                            "{m.mentorFeedback}"
                          </p>
                        </div>
                      )}

                      {/* Review Action Drawer */}
                      {m.status === 'submitted' && (
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          {isReviewingThis ? (
                            <div className="space-y-2">
                              <textarea
                                value={feedbackText}
                                onChange={e => setFeedbackText(e.target.value)}
                                placeholder="Write encouraging feedback, strengths, and recommendations..."
                                rows={2}
                                className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setReviewingWeek(null)}
                                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleVerify(m.week)}
                                  className="px-3 py-1 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md flex items-center gap-1"
                                >
                                  <FileCheck2 className="w-3.5 h-3.5" />
                                  <span>Approve & Send Feedback</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReviewingWeek(m.week);
                                setFeedbackText(m.mentorFeedback || 'Well done! Clean code and clear understanding of the core concept.');
                              }}
                              className="text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline"
                            >
                              Review & Leave Feedback
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              Select a mentee to view their roadmap and verify completed milestones.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
